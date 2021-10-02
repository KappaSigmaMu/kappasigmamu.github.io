import React from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import styled from 'styled-components'
import { useAccount } from '../account/AccountContext'
import { useSubstrate } from '../substrate'

interface LevelStatusType {
  [key: string]: string
}

const LEVELSTATUS: LevelStatusType = {
  human: 'WAITING BID',
  bidder: 'BID SUBMITTED',
  candidate: 'WAITING POI',
  cyborg: ''
}

const Main = () => {
  const { activeAccount, setActiveAccount, accounts } = useAccount()

  const onChange = (account: HTMLInputElement) => {
    setActiveAccount(account.innerText)
  }

  const Title = () => {
    const { level } = useAccount()

    return (
      <label style={{ fontSize: '12px' }}>
        <SelectedAccountDiv>{activeAccount}</SelectedAccountDiv>
        <LevelStatusDiv>
          <label>JOURNEY: {level.toUpperCase()}</label>
          <label>{LEVELSTATUS[level]}</label>
        </LevelStatusDiv>
      </label>
    )
  }

  return (
    <StyledDropdownButton
      variant="outline-light-grey"
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
    </StyledDropdownButton>
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

const StyledDropdownButton = styled(DropdownButton)`
  & ::after {
    margin-bottom: 16px;
  }
`

export { AccountSelector }
