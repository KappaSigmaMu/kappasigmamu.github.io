import React, { useState } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import styled from 'styled-components'
import { useSubstrate } from '../substrate'

type Props = {
  setActiveAccount: (address: string) => void
  accounts: { name: string | undefined; address: string }[]
  activeAccount: string
}

const Main = ({ setActiveAccount, accounts, activeAccount }: Props) => {
  const [selectedAccount, setSelectedAccount] = useState(activeAccount)

  const onChange = (account: HTMLInputElement) => {
    setActiveAccount(account.innerText)
    setSelectedAccount(account.innerText)
  }

  const Title = () => {
    return (
      <label
        style={{
          fontSize: '12px',
        }}
      >
        <SelectedAccountDiv>{selectedAccount}</SelectedAccountDiv>
        <LevelStatusDiv>
          <label>JOURNEY: HUMAN</label>
          <label>WAITING BID</label>
        </LevelStatusDiv>
      </label>
    )
  }

  return (
    <AccountDropdownButton
      variant="outline-grey-dark"
      onSelect={(
        eventKey: string | null,
        e?: React.SyntheticEvent<unknown, Event>,
      ) => onChange(e?.target as HTMLInputElement)}
      title={<Title />}
    >
      {accounts.map((option: { name: string | undefined; address: string }) => (
        <Dropdown.Item
          style={{ fontSize: '12px' }}
          eventKey={option.address}
          key={option.address}
          href="#"
        >
          {option.address}
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
    color: ${(props) => props.theme.colors.grey};
    font-weight: 700;
  }
`

const AccountDropdownButton = styled(DropdownButton)`
  button {
    padding: 15px;
  }
`

const SelectedAccountDiv = styled.div`
  color: ${(props) => props.theme.colors.primary};
`

export { AccountSelector }
