import { Vec } from '@polkadot/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import { PalletSocietyBid } from '@polkadot/types/lookup'
import React, { useContext, useEffect, useState } from 'react'
import { useKusama } from '../kusama'

// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
const storedActiveAccount = JSON.parse(localStorage.getItem('activeAccount')!) || ''
// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
const storedAccounts = JSON.parse(localStorage.getItem('accounts')!) || []

const INIT_STATE = {
  activeAccount: storedActiveAccount,
  setActiveAccount: () => ({}),
  accounts: storedAccounts,
  setAccounts: () => ({}),
  level: 'human'
}

type StateType = {
  level: string,
  setActiveAccount: (account: accountType) => void
  activeAccount: accountType
  accounts: accountType[]
  setAccounts: (accounts: accountType[]) => void
}

const AccountContext = React.createContext<StateType>(INIT_STATE)

const AccountContextProvider = ({ children } : any) => {
  const { api } = useKusama()
  const [activeAccount, setActiveAccount] = useState<accountType>(storedActiveAccount)
  const [accounts, setAccounts] = useState<accountType[]>(storedAccounts)
  const [level, setLevel] = useState('human')

  const loading = !api?.query?.society

  useEffect(() => {
    const setLevelCheckingAccounts = (accounts: AccountId32[], level: string) => {
      setLevel('human')
      accounts.forEach((account: AccountId32) => {
        if (account.toString() === activeAccount.address) {
          setLevel(level)
        }
      })
    }

    if (api) {
      api.query.society.bids().then((response: Vec<PalletSocietyBid>) => {
        setLevelCheckingAccounts(response.map(account => account.who), 'bidder')
      })

      api.query.society.candidates().then((response: Vec<PalletSocietyBid>) => {
        setLevelCheckingAccounts(response.map(account => account.who), 'candidate')
      })

      api.query.society.members().then((response: Vec<AccountId32>) => {
        setLevelCheckingAccounts(response, 'cyborg')
      })
    }
  }, [api?.query?.society, activeAccount])

  const content = loading
    ? <></>
    : <AccountContext.Provider value={{ level, activeAccount, setActiveAccount, accounts, setAccounts }}>
        {children}
      </AccountContext.Provider>

  return content
}

const useAccount = () => ({ ...useContext(AccountContext) })

export { AccountContextProvider, useAccount }
