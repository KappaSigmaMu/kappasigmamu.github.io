// import Identicon from '@polkadot/react-identicon'
// import { Dropdown, DropdownButton, Spinner } from 'react-bootstrap'
// import styled from 'styled-components'
// import { useAccount } from '../account/AccountContext'
// import { truncateMiddle } from '../helpers/truncate'
// import { useKusama } from '../kusama'
// import { WalletAccount } from '@talismn/connect-wallets'
// import { useState } from 'react'

// interface LevelStatusType {
//   [key: string]: string
// }

// const LEVELSTATUS: LevelStatusType = {
//   human: 'WAITING BID',
//   bidder: 'BID SUBMITTED',
//   candidate: 'WAITING POI',
//   cyborg: ''
// }

// const Title = ({ activeAccount }: { activeAccount: WalletAccount }) => {
//   const { level } = useAccount()
//   const account = activeAccount.name

//   return (
//     <>
//       <div className="align-top d-inline-block me-3" style={{ marginTop: 6 }}>
//         <Identicon value={activeAccount.address} size={32} theme={'polkadot'} />
//       </div>

//       <label style={{ fontSize: '12px' }}>
//         <SelectedAccountDiv className="text-start mb-1">{truncateMiddle(account || '')}</SelectedAccountDiv>
//         <LevelStatusDiv>
//           <label className="pe-3">JOURNEY: {level.toUpperCase()}</label>
//           <label>{LEVELSTATUS[level]}</label>
//         </LevelStatusDiv>
//       </label>
//     </>
//   )
// }

// const Accounts = ({ accounts }: { accounts: WalletAccount[] }) => {
//   const [activeAccount, setActiveAccount] = useState<WalletAccount | undefined>(undefined)

//   const onChange = (account: WalletAccount) => {
//     const activeAccount = accounts.filter((acc) => acc.address.includes(account.address))[0]
//     setActiveAccount(activeAccount)
//   }

//   return (
//     <StyledDropdownButton
//       variant="outline-light-grey"
//       onSelect={(eventKey: string | null) => onChange(eventKey!)}
//       title={<Title activeAccount={activeAccount} />}
//     >
//       {accounts.map((option: WalletAccount) => (
//         <Dropdown.Item style={{ fontSize: '12px' }} eventKey={option.address} key={option.address} href="#">
//           {option.name ? option.name : option.address}
//         </Dropdown.Item>
//       ))}
//     </StyledDropdownButton>
//   )
// }

// const AccountSelector = () => {
//   const { api } = useKusama()
//   const loading = !api?.query
//   return loading ? <Spinner animation="border" variant="primary" /> : <Accounts />
// }

// const LevelStatusDiv = styled.div`
//   display: flex;
//   justify-content: space-between;

//   label {
//     color: ${(props) => props.theme.colors.grey};
//     font-weight: 700;
//   }
// `

// const SelectedAccountDiv = styled.div`
//   color: ${(props) => props.theme.colors.primary};
//   font-weight: 700;
//   font-size: 14px;
// `

// const StyledDropdownButton = styled(DropdownButton)`
//   background-color: ${(props) => props.theme.colors.darkGrey};
//   & ::after {
//     margin-bottom: 10px;
//   }
// `

// export { AccountSelector }
export {}
