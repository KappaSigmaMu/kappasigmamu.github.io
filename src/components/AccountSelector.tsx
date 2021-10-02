import React, { useState } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import styled from 'styled-components'
import { useSubstrate } from '../substrate'

import { useAccount } from '../account/AccountContext'

const Main = () => {
  const { activeAccount, setActiveAccount, accounts } = useAccount()

  const onChange = (account: HTMLInputElement) => {
    setActiveAccount(account.innerText)
  }

  /* debugger */
  console.log(activeAccount)

  const Title = () => {
    return (
      <label
        style={{
          fontSize: '12px',
        }}
      >
        <SelectedAccountDiv>{activeAccount}</SelectedAccountDiv>
        <LevelStatusDiv>
          <label>JOURNEY: HUMAN</label>
          <label>WAITING BID</label>
        </LevelStatusDiv>
      </label>
    )
  }

  return (
    <DropdownButton
      variant="outline-grey-dark"
      onSelect={(eventKey: string | null, e?: React.SyntheticEvent<unknown, Event>) =>
        onChange(e?.target as HTMLInputElement)
      }
      title={<Title />}
    >
      {accounts.map((option: { name: string | undefined; address: string }) => (
        <Dropdown.Item style={{ fontSize: '12px' }} eventKey={option.address} key={option.address} href="#">
          {option.address}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  )
}

const AccountSelector = () => {
  const { api } = useSubstrate()
  return api?.query ? <Main /> : null
}

const LevelStatusDiv = styled.div`
  display: flex;
  justify-content: space-between;

  label {
    color: ${(props) => props.theme.colors.grey};
    font-weight: 700;
  }
`

const SelectedAccountDiv = styled.div`
  color: ${(props) => props.theme.colors.primary};
`

export { AccountSelector }
