import { WalletAccount } from '@talismn/connect-wallets'
import { Spinner } from 'react-bootstrap'
import { FaChevronDown } from 'react-icons/fa6'
import styled from 'styled-components'
import { useAccount } from '../account/AccountContext'
import { truncateMiddle } from '../helpers/truncate'
import { useKusama } from '../kusama'
import { Identicon } from '../pages/explore/components/Identicon'

const Title = ({ activeAccount }: { activeAccount: WalletAccount }) => {
  const { level } = useAccount()
  const account = activeAccount.name

  return (
    <div className="d-flex align-items-center" role="button">
      <div className="align-top d-inline-block me-2">
        <Identicon value={activeAccount.address} size={26} theme={'polkadot'} />
      </div>

      <label style={{ fontSize: '10px', cursor: 'pointer', lineHeight: '15px' }}>
        <SelectedAccountDiv className="text-start">{truncateMiddle(account || '')}</SelectedAccountDiv>
        <LevelStatusDiv>
          <label>{level.toUpperCase()}</label>
        </LevelStatusDiv>
      </label>

      <FaChevronDown className="ms-2" />
    </div>
  )
}

const Main = () => {
  const { activeAccount } = useAccount()

  return <Title activeAccount={activeAccount!} />
}

const SelectedAccount = () => {
  const { api } = useKusama()
  const loading = !api?.query
  return loading ? <Spinner animation="border" variant="primary" /> : <Main />
}

const LevelStatusDiv = styled.div`
  display: flex;
  justify-content: space-between;
  cursor: pointer;

  label {
    color: ${(props) => props.theme.colors.white};
    font-weight: 600;
    cursor: pointer;
  }
`

const SelectedAccountDiv = styled.div`
  color: ${(props) => props.theme.colors.white};
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.5px;
`

export { SelectedAccount }
