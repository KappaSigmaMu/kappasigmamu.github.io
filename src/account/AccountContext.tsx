import { Vec } from '@polkadot/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import { PalletSocietyBid } from '@polkadot/types/lookup'
import type { KeyringAddress } from '@polkadot/ui-keyring/types'
import React, { useContext, useEffect, useState } from 'react'
import { Row } from 'react-bootstrap'
import { isValidAccount } from '../helpers/validAccount'
import { useKusama } from '../kusama'
import { LoadingSpinner } from '../pages/explore/components/LoadingSpinner'

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
  level: string,
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
  const { api, keyringState, keyring } = useKusama()
  const [activeAccount, _setActiveAccount] = useState<accountType>(storedActiveAccount)
  const [accounts, setAccounts] = useState<accountType[]>([])
  const [level, setLevel] = useState('human')

  const loading = !api?.query?.society && keyringState !== 'READY'

  const fetchAccounts = () => {
    const storedAccounts = keyring.getAccounts().map((account: KeyringAddress) => ({
      name: account.meta.name,
      address: keyring.encodeAddress(account.address),
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
  }, [api?.query?.society, keyringState])

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
        setLevelCheckingAccounts(response.map(account => account.who), 'bidder')
      })

      api.query.society.candidates().then((response: Vec<PalletSocietyBid>) => {
        setLevelCheckingAccounts(response.map(account => account.who), 'candidate')
      })

      api.query.society.members().then((response: Vec<AccountId32>) => {
        setLevelCheckingAccounts(response, 'cyborg')
      })
    }
  }, [accounts, activeAccount])

  const content = loading
    ? <Row style={{ marginTop: "30vh" }}>
        <p className="text-center">Connecting to Kusama network...</p>
        <LoadingSpinner />
      </Row>
    : <AccountContext.Provider value={{ level, activeAccount, setActiveAccount, accounts, fetchAccounts }}>
        {children}
      </AccountContext.Provider>

  return content
}

const useAccount = () => ({ ...useContext(AccountContext) })

export { AccountContextProvider, useAccount }
