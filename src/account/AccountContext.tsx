import { StorageKey, Vec } from '@polkadot/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import { PalletSocietyBid } from '@polkadot/types/lookup'
import { WalletAccount } from '@talismn/connect-wallets'
import React, { useContext, useEffect, useState } from 'react'
import { wallets } from '../helpers/wallets'
import { useKusama } from '../kusama'
import { ApiState } from '../kusama/KusamaContext'
import { toastByStatus } from '../pages/explore/helpers'
import { account } from '@polkadot/api-derive/balances'

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
  const { api, apiState } = useKusama()
  const [activeAccount, _setActiveAccount] = useState<WalletAccount | undefined>(storedActiveAccount)
  const [level, setLevel] = useState('human')

  const loading = apiState !== ApiState.ready
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
    const setLevelCheckingAccounts = (accounts: AccountId32[], level: string) => {
      accounts.forEach((account: AccountId32) => {
        if (account.toHuman() === activeAccount?.address) {
          setLevel(level)
        }
      })
    }

    if (society && activeAccount) {
      setLevel('human')

      society.bids().then((response: Vec<PalletSocietyBid>) => {
        setLevelCheckingAccounts(
          response.map((account) => account.who),
          'bidder'
        )
      })

      society.candidates.keys().then((response: StorageKey<[AccountId32]>[]) => {
        setLevelCheckingAccounts(
          response.map((account) => account.args[0] as AccountId32),
          'candidate'
        )
      })

      society.members.keys().then((response: StorageKey<[AccountId32]>[]) => {
        setLevelCheckingAccounts(
          response.map((account) => account.args[0] as AccountId32),
          'cyborg'
        )
      })
    }
  }, [society, activeAccount])

  return loading ? (
    <>{children}</>
  ) : (
    <AccountContext.Provider value={{ level, setLevel, activeAccount, setActiveAccount }}>
      {children}
    </AccountContext.Provider>
  )
}

const useAccount = () => ({ ...useContext(AccountContext) })

export { AccountContextProvider, useAccount }
