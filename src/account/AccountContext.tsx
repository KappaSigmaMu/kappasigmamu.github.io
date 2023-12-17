import { StorageKey, Vec } from '@polkadot/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import { PalletSocietyBid } from '@polkadot/types/lookup'
import type { KeyringAddress } from '@polkadot/ui-keyring/types'
import React, { useContext, useEffect, useState } from 'react'
import { isValidAccount } from '../helpers/validAccount'
import { useKusama } from '../kusama'
import { ApiState } from '../kusama/KusamaContext'

const activeAccount = localStorage.getItem('activeAccount')
const isValid = isValidAccount(activeAccount)
let storedActiveAccount = isValid ? JSON.parse(activeAccount!) : null
storedActiveAccount = storedActiveAccount ? (storedActiveAccount as accountType) : { name: '', address: '' }

const INIT_STATE = {
  activeAccount: storedActiveAccount,
  setActiveAccount: () => ({}),
  accounts: [],
  fetchAccounts: () => ({}),
  level: 'human'
}

type StateType = {
  level: string
  setActiveAccount: (account: accountType) => void
  activeAccount: accountType
  accounts: accountType[]
  fetchAccounts: () => void
}

const AccountContext = React.createContext<StateType>(INIT_STATE)

const emptyActiveAccount = (account: accountType) => {
  return account?.name === '' && account?.address === ''
}

const AccountContextProvider = ({ children }: any) => {
  const { api, apiState, keyringState, keyring } = useKusama()
  const [activeAccount, _setActiveAccount] = useState<accountType>(storedActiveAccount)
  const [accounts, setAccounts] = useState<accountType[]>([])
  const [level, setLevel] = useState('human')

  const loading = apiState !== ApiState.ready || keyringState !== 'READY'

  const fetchAccounts = () => {
    const storedAccounts = keyring.getAccounts().map((account: KeyringAddress) => ({
      name: account.meta.name,
      address: keyring.encodeAddress(account.address)
    }))

    if (storedAccounts.length == 0) return

    setAccounts(storedAccounts)
    emptyActiveAccount(activeAccount) && setActiveAccount(storedAccounts[0])
  }

  const setActiveAccount = (account: accountType) => {
    _setActiveAccount(account)
    localStorage.setItem('activeAccount', JSON.stringify(account))
  }

  useEffect(() => {
    if (keyringState === 'READY') fetchAccounts()
  }, [keyringState])

  // TODO: this is duplicated in LandingPage
  useEffect(() => {
    const setLevelCheckingAccounts = (accounts: AccountId32[], level: string) => {
      setLevel('human')
      accounts.forEach((account: AccountId32) => {
        if (account.toString() === activeAccount?.address) {
          setLevel(level)
        }
      })
    }

    if (api && activeAccount) {
      api.query.society.bids().then((response: Vec<PalletSocietyBid>) => {
        setLevelCheckingAccounts(
          response.map((account) => account.who),
          'bidder'
        )
      })

      api.query.society.candidates.keys().then((response: StorageKey<[AccountId32]>[]) => {
        setLevelCheckingAccounts(
          response.map((account) => account.args[0] as AccountId32),
          'candidate'
        )
      })

      api.query.society.members.keys().then((response: StorageKey<[AccountId32]>[]) => {
        setLevelCheckingAccounts(
          response.map((account) => account.args[0] as AccountId32),
          'cyborg'
        )
      })
    }
  }, [accounts, activeAccount])

  return loading ? (
    <>{children}</>
  ) : (
    <AccountContext.Provider value={{ level, activeAccount, setActiveAccount, accounts, fetchAccounts }}>
      {children}
    </AccountContext.Provider>
  )
}

const useAccount = () => ({ ...useContext(AccountContext) })

export { AccountContextProvider, useAccount }
