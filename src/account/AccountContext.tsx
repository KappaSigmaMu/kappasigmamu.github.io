import { StorageKey, Vec } from '@polkadot/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import type { Bid } from '@polkadot/types/interfaces/society'
import { WalletAccount } from '@talismn/connect-wallets'
import React, { useContext, useEffect, useState } from 'react'
import { isSameAddress } from '../helpers/address'
import { wallets } from '../helpers/wallets'
import { useKusama } from '../kusama'
import { toastByStatus } from '../pages/explore/helpers'

const localStorageAccount = localStorage.getItem('activeAccount')

let storedActiveAccount: WalletAccount | undefined
if (localStorageAccount && localStorageAccount !== 'undefined') {
  try {
    storedActiveAccount = JSON.parse(localStorageAccount!)
  } catch (error) {
    console.error(error)
  }
}

const APP_NAME = process.env.REACT_APP_NAME

const INIT_STATE = {
  activeAccount: storedActiveAccount,
  setActiveAccount: () => ({}),
  level: 'human',
  setLevel: () => ({})
}

type StateType = {
  level: string
  setLevel: (level: string) => void
  setActiveAccount: (account: WalletAccount | undefined) => void

  activeAccount: WalletAccount | undefined
}

const AccountContext = React.createContext<StateType>(INIT_STATE)

const AccountContextProvider = ({ children }: any) => {
  const { api } = useKusama()
  const [activeAccount, _setActiveAccount] = useState<WalletAccount | undefined>(storedActiveAccount)
  const [level, setLevel] = useState('human')

  const society = api?.query.society

  const setActiveAccount = (account: WalletAccount | undefined) => {
    _setActiveAccount(account)
    localStorage.setItem('activeAccount', JSON.stringify(account))
  }

  useEffect(() => {
    if (!activeAccount) return

    const enableWallet = async () => {
      const wallet = wallets.find((wallet) => wallet.extensionName === activeAccount?.source)
      try {
        await wallet?.enable(APP_NAME)
        _setActiveAccount((account: any) => ({ ...account, signer: wallet?.signer }))
      } catch (e) {
        toastByStatus['error']((e as Error).message, {})
        return
      }
    }

    enableWallet()
  }, [])

  useEffect(() => {
    if (!society || !activeAccount) return

    const address = activeAccount.address
    let cancelled = false

    const detectLevel = async () => {
      const [bids, candidates, members] = await Promise.all([
        society.bids() as Promise<Vec<Bid>>,
        society.candidates.keys() as Promise<StorageKey<[AccountId32]>[]>,
        society.members.keys() as Promise<StorageKey<[AccountId32]>[]>
      ])

      if (cancelled || activeAccount?.address !== address) return

      const matches = (accounts: AccountId32[]) =>
        accounts.some((account) => isSameAddress(account.toString(), address))

      const bidders = bids.map((bid) => bid.who)
      const candidateAccounts = candidates.map((key) => key.args[0] as AccountId32)
      const memberAccounts = members.map((key) => key.args[0] as AccountId32)

      if (matches(memberAccounts)) setLevel('cyborg')
      else if (matches(candidateAccounts)) setLevel('candidate')
      else if (matches(bidders)) setLevel('bidder')
      else setLevel('human')
    }

    detectLevel()

    return () => {
      cancelled = true
    }
  }, [society, activeAccount])

  return (
    <AccountContext.Provider value={{ level, setLevel, activeAccount, setActiveAccount }}>
      {children}
    </AccountContext.Provider>
  )
}

const useAccount = () => ({ ...useContext(AccountContext) })

export { AccountContextProvider, useAccount }
