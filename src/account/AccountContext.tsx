import type { WalletAccount } from '@talismn/connect-wallets'
import { getPolkadotSignerFromPjs, type PolkadotSigner, type SignPayload, type SignRaw } from 'polkadot-api/pjs-signer'
import React, { useContext, useEffect, useState } from 'react'
import { useAssetHub } from '../chain/ChainProvider'
import { getAccountLevel } from '../chain/society/queries'
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
  level: string
  setLevel: (level: string) => void
  setActiveAccount: (account: WalletAccount | undefined) => void
  activeAccount: WalletAccount | undefined
  polkadotSigner: PolkadotSigner | undefined
}

const INIT_STATE: StateType = {
  activeAccount: storedActiveAccount,
  setActiveAccount: () => undefined,
  setLevel: () => undefined,
  level: 'human',
  polkadotSigner: undefined
}

const AccountContext = React.createContext<StateType>(INIT_STATE)

const AccountContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { api } = useAssetHub()
  const [activeAccount, _setActiveAccount] = useState<WalletAccount | undefined>(storedActiveAccount)
  const [polkadotSigner, setPolkadotSigner] = useState<PolkadotSigner | undefined>(undefined)
  const [level, setLevel] = useState('human')

  const setActiveAccount = (account: WalletAccount | undefined) => {
    _setActiveAccount(account)
    setPolkadotSigner(undefined)
    localStorage.setItem('activeAccount', JSON.stringify(account))
  }

  useEffect(() => {
    if (!activeAccount) {
      setPolkadotSigner(undefined)
      return
    }

    let cancelled = false
    const enableWallet = async () => {
      const wallet = wallets.find((candidate) => candidate.extensionName === activeAccount.source)
      try {
        await wallet?.enable(APP_NAME ?? 'Kappa Sigma Mu')
        const signer = wallet?.signer as { signPayload?: SignPayload; signRaw?: SignRaw } | undefined

        if (!signer?.signPayload || !signer.signRaw) throw new Error('This wallet does not expose a compatible signer.')
        const papiSigner = getPolkadotSignerFromPjs(activeAccount.address, signer.signPayload, signer.signRaw)
        if (!cancelled) setPolkadotSigner(papiSigner)
      } catch (error) {
        if (!cancelled) {
          setPolkadotSigner(undefined)
          toastByStatus.error(error instanceof Error ? error.message : String(error), {})
        }
      }
    }

    void enableWallet()
    return () => {
      cancelled = true
    }
  }, [activeAccount])

  useEffect(() => {
    if (!api || !activeAccount) {
      setLevel('human')
      return
    }

    let cancelled = false
    getAccountLevel(api, activeAccount.address)
      .then((nextLevel) => {
        if (!cancelled) setLevel(nextLevel)
      })
      .catch(() => {
        if (!cancelled) setLevel('human')
      })

    return () => {
      cancelled = true
    }
  }, [api, activeAccount])

  return (
    <AccountContext.Provider value={{ level, setLevel, activeAccount, setActiveAccount, polkadotSigner }}>
      {children}
    </AccountContext.Provider>
  )
}

const useAccount = () => ({ ...useContext(AccountContext) })

export { AccountContextProvider, useAccount }
