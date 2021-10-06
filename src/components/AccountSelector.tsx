import React from 'react'
import { Dropdown, DropdownButton, Spinner } from 'react-bootstrap'
import styled from 'styled-components'
import { useAccount } from '../account/AccountContext'
import { truncateMiddle } from '../helpers/truncate'
import { useKusama } from '../kusama'

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

  const onChange = (account: string) => {
    const activeAccount = accounts.filter(acc => acc.address.includes(account))[0]
    setActiveAccount(activeAccount)
    localStorage.setItem("activeAccount", JSON.stringify(activeAccount))
  }

  const Title = () => {
    const { level } = useAccount()
    const account = activeAccount.name && activeAccount.name.replace(' (polkadot-js)','')

    return (
      <label style={{ fontSize: '12px' }}>
        <SelectedAccountDiv className="text-start mb-1">
          {truncateMiddle(account || '')}
        </SelectedAccountDiv>
        <LevelStatusDiv>
          <label className="pe-3">JOURNEY: {level.toUpperCase()}</label>
          <label>{LEVELSTATUS[level]}</label>
        </LevelStatusDiv>
      </label>
    )
  }

  return (
    <StyledDropdownButton
      variant="outline-light-grey"
      onSelect={(eventKey: string) => onChange(eventKey)}
      title={<Title />}
    >
      {accounts.map((option: { name: string | undefined; address: string }) => (
        <Dropdown.Item style={{ fontSize: '12px' }} eventKey={option.address} key={option.address} href="#">
          {option.name ? option.name : option.address}
        </Dropdown.Item>
      ))}
    </StyledDropdownButton>
  )
}

const AccountSelector = () => {
  const { api } = useKusama()
  const loading = !api?.query
  return loading ? <Spinner animation="border" variant="primary" /> : <Main />
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
  font-weight: 700;
  font-size: 14px;
`

const StyledDropdownButton = styled(DropdownButton)`
  background-color: ${(props) => props.theme.colors.darkGrey};
  & ::after {
    margin-bottom: 16px;
  }
`

export { AccountSelector }
