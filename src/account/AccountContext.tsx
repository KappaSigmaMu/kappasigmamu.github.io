import type { WalletAccount } from '@talismn/connect-wallets'
import { getPolkadotSignerFromPjs, type PolkadotSigner, type SignPayload, type SignRaw } from 'polkadot-api/pjs-signer'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { getAccountLevelFromCollections, type SocietyAccountLevel } from '../chain/society/queries'
import { useSociety } from '../chain/society/SocietyContext'
import { wallets } from '../helpers/wallets'
import { toastByStatus } from '../pages/explore/helpers'

const localStorageAccount = localStorage.getItem('activeAccount')

let storedActiveAccount: WalletAccount | undefined
if (localStorageAccount && localStorageAccount !== 'undefined') {
  try {
    storedActiveAccount = JSON.parse(localStorageAccount)
  } catch (error) {
    console.error(error)
  }
}

const APP_NAME = process.env.REACT_APP_NAME

type StateType = {
  level: SocietyAccountLevel
  isLevelLoading: boolean
  isSignerLoading: boolean
  setActiveAccount: (account: WalletAccount | undefined) => void
  activeAccount: WalletAccount | undefined
  polkadotSigner: PolkadotSigner | undefined
}

const INIT_STATE: StateType = {
  activeAccount: storedActiveAccount,
  setActiveAccount: () => undefined,
  level: 'human',
  isLevelLoading: false,
  isSignerLoading: false,
  polkadotSigner: undefined
}

const AccountContext = React.createContext<StateType>(INIT_STATE)

const AccountContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { bids, candidates, memberEntries } = useSociety()
  const [activeAccount, _setActiveAccount] = useState<WalletAccount | undefined>(storedActiveAccount)
  const [polkadotSigner, setPolkadotSigner] = useState<PolkadotSigner | undefined>(undefined)
  const [isSignerLoading, setIsSignerLoading] = useState(Boolean(storedActiveAccount))

  const setActiveAccount = (account: WalletAccount | undefined) => {
    _setActiveAccount(account)
    setPolkadotSigner(undefined)
    localStorage.setItem('activeAccount', JSON.stringify(account))
  }

  useEffect(() => {
    if (!activeAccount) {
      setPolkadotSigner(undefined)
      setIsSignerLoading(false)
      return
    }

    let cancelled = false
    setIsSignerLoading(true)
    const enableWallet = async () => {
      const wallet = wallets.find((candidate) => candidate.extensionName === activeAccount.source)
      try {
        await wallet?.enable(APP_NAME ?? 'Kappa Sigma Mu')
        const signer = wallet?.signer as { signPayload?: SignPayload; signRaw?: SignRaw } | undefined

        if (!signer?.signPayload || !signer.signRaw) throw new Error('This wallet does not expose a compatible signer.')
        const papiSigner = getPolkadotSignerFromPjs(activeAccount.address, signer.signPayload, signer.signRaw)
        if (!cancelled) {
          setPolkadotSigner(papiSigner)
          setIsSignerLoading(false)
        }
      } catch (error) {
        if (!cancelled) {
          setPolkadotSigner(undefined)
          setIsSignerLoading(false)
          toastByStatus.error(error instanceof Error ? error.message : String(error), {})
        }
      }
    }

    void enableWallet()
    return () => {
      cancelled = true
    }
  }, [activeAccount])

  const isLevelLoading = Boolean(
    activeAccount &&
      (bids.isLoading ||
        candidates.isLoading ||
        memberEntries.isLoading ||
        !bids.data ||
        !candidates.data ||
        !memberEntries.data)
  )
  const level = useMemo(
    () =>
      activeAccount && bids.data && candidates.data && memberEntries.data
        ? getAccountLevelFromCollections(activeAccount.address, bids.data, candidates.data, memberEntries.data)
        : 'human',
    [activeAccount, bids.data, candidates.data, memberEntries.data]
  )

  return (
    <AccountContext.Provider
      value={{ level, isLevelLoading, isSignerLoading, activeAccount, setActiveAccount, polkadotSigner }}
    >
      {children}
    </AccountContext.Provider>
  )
}

const useAccount = () => ({ ...useContext(AccountContext) })

export { AccountContextProvider, useAccount }
