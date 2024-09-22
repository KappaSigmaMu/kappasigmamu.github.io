import type { ApiPromise } from '@polkadot/api'
import { WalletAccount } from '@talismn/connect-wallets'
import { Badge, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { DataHeaderRow, DataRow } from '../../../../components/base'
import { FormatBalance } from '../../../../components/FormatBalance'
import { Identicon } from '../../components/Identicon'

const StyledDataRow = styled(DataRow)`
  background-color: ${(props) => (props.$isDefender ? props.theme.colors.black : '')};
  border: ${(props) => (props.$isDefender ? `2px solid ${props.theme.colors.secondary}` : '')};
  &:hover {
    cursor: pointer;
  }
  @media (max-width: 992px) {
    padding-block: 12px;
    margin-inline: 2px;
  }
`

type PayoutsListProps = {
  api: ApiPromise
  members: ExtendedSocietyMember[]
  activeAccount: WalletAccount | undefined
  handleUpdate: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PayoutsList = ({ api, members }: PayoutsListProps): JSX.Element => {
  // Likely impossible to happen but if it does, better to show a
  // clear message than an empty list which may look like a loading state
  if (members.length === 0) return <>No members</>

  return (
    <>
      <DataHeaderRow className="d-none d-lg-flex text-center">
        <Col lg={1}>#</Col>
        <Col lg={5} className="text-center text-lg-start">
          Wallet Hash
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          Paid
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          Pending
        </Col>
        <Col lg={2}></Col>
      </DataHeaderRow>

      {members.map((member: ExtendedSocietyMember) => (
        <StyledDataRow key={member.accountId.toString()}>
          <Col lg={1} className="text-center">
            <Identicon value={member.accountId.toHuman()} size={32} theme={'polkadot'} />
          </Col>
          <Col lg={5} className="text-center text-lg-start">
            {member.accountId.toHuman()}
          </Col>
          <Col lg={2} className="text-center text-lg-start">
            <FormatBalance balance={member.extendedPayouts.paid} />
          </Col>
          <Col lg={2} className="text-center text-lg-start">
            <FormatBalance balance={member.extendedPayouts.pending} />
          </Col>
          <Col lg={2} className="text-center text-lg-end">
            {member.isFounder && (
              <Badge pill bg="dark" className="me-2 p-2">
                Founder
              </Badge>
            )}
            {member.rank.toNumber() > 0 && (
              <Badge pill bg="dark" className="me-2 p-2">
                Ranked
              </Badge>
            )}
            {member.hasPayouts && (
              <Badge pill bg="primary" className="me-2 p-2">
                Maturing in block {member.extendedPayouts.block}
              </Badge>
            )}
            {member.extendedPayouts.pending == 0 && member.extendedPayouts.paid > 0 && (
              <Badge pill bg="secondary" text="black" className="me-2 p-2">
                Paid
              </Badge>
            )}
            {!member.hasPayouts && member.extendedPayouts.paid == 0 && (
              <Badge pill bg="black" className="me-2 p-2">
                V1
              </Badge>
            )}
          </Col>
        </StyledDataRow>
      ))}
    </>
  )
}

export { PayoutsList }
