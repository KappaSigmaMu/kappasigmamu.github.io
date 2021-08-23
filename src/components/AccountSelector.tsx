import type { KeyringPair } from '@polkadot/keyring/types'
import React, { useState, useEffect } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import styled from 'styled-components'
import { useSubstrate } from '../substrate'

type Props = {
  setAccountAddress: (address: string) => void
}

const Main = ({ setAccountAddress }: Props) => {
  const { keyring } = useSubstrate()
  const [accountSelected, setAccountSelected] = useState('')

  const keyringOptions = keyring?.getPairs().map((account: KeyringPair) => {
    return {
      key: account?.address,
    }
  })

  const initialAddress = keyringOptions?.length > 0 ? keyringOptions[0].key : ''

  useEffect(() => {
    setAccountAddress(initialAddress)
    setAccountSelected(initialAddress)
  }, [setAccountAddress, initialAddress])

  const onChange = (account: HTMLInputElement) => {
    setAccountAddress(account.innerText)
    setAccountSelected(account.innerText)
  }

  const Title = () => {
    return (
      <label
        style={{
          fontSize: '12px',
        }}
      >
        <SelectedAccountDiv>{accountSelected}</SelectedAccountDiv>
        <LevelStatusDiv>
          <label>JOURNEY: HUMAN</label>
          <label>WAITING BID</label>
        </LevelStatusDiv>
      </label>
    )
  }

  return (
    <AccountDropdownButton
      variant="gray-dark"
      onSelect={(
        eventKey: string | null,
        e?: React.SyntheticEvent<unknown, Event>,
      ) => onChange(e?.target as HTMLInputElement)}
      title={<Title />}
    >
      {keyringOptions.map((option: { key: string }) => (
        <Dropdown.Item
          style={{ fontSize: '12px' }}
          eventKey={option.key}
          key={option.key}
          href="#"
        >
          {option.key}
        </Dropdown.Item>
      ))}
    </AccountDropdownButton>
  )
}

const AccountSelector = (props: Props) => {
  const { api } = useSubstrate()
  return api?.query ? <Main {...props} /> : null
}

const LevelStatusDiv = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 10px;

  label {
    color: #6c757d;
    font-weight: 700;
  }
`

const AccountDropdownButton = styled(DropdownButton)`
  button {
    border-color: #ced4da;
    padding: 15px;
  }
  div {
    background-color: black;
  }
  a {
    color: #e6007a;
  }
`

const SelectedAccountDiv = styled.div`
  color: #e6007a;
`

export { AccountSelector }
