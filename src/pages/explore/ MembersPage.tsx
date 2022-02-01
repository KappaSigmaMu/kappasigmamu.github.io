import { DeriveSocietyMember } from '@polkadot/api-derive/types'
import Identicon from '@polkadot/react-identicon'
import { useEffect, useState } from 'react'
import { Col, Row, Spinner } from 'react-bootstrap'
import styled from 'styled-components'
import { humanizeBidKind, humanizeBidValue } from '../../helpers/humanize'
import { truncateMiddle } from '../../helpers/truncate'
import { useKusama } from '../../kusama'

const Header = () => (
  <StyledHeaderRow>
    <Col xs={1} className="text-center">#</Col>
    <Col xs={4} className="text-start">Wallet Hash</Col>
    <Col xs={5} className="text-start">Bid Kind</Col>
    <Col xs={2} className="text-end">Value</Col>
  </StyledHeaderRow>
)

const DataRow = ({ bid }: { bid: any }) => (
  <StyledDataRow key={bid.who?.toString()}>
    <Col xs={1} className="text-center">
      <Identicon value={bid.who} size={32} theme={'polkadot'} />
    </Col>
    <Col xs={4} className="text-start text-truncate">
      {truncateMiddle(bid.who?.toString())}
    </Col>
    <Col xs={5} className="text-start text-truncate">
      {humanizeBidKind(bid.kind)}
    </Col>
    <Col xs={2} className="text-end">
      {humanizeBidValue(bid.kind)}
    </Col>
  </StyledDataRow>
)

const BidsList = ({ bids }: { bids: any }): JSX.Element => (
  <>
    <Header />
    {bids.map((bid: any) => (
      <DataRow key={bid.who} bid={bid} />
    ))}
  </>
)

const StyledHeaderRow = styled(Row)`
  color: #fff;
  line-height: 3;

  & .text-end {
    padding-right: 36px;
  }
`

const StyledDataRow = styled(StyledHeaderRow)`
  background-color: #343A40;
  border-radius: 6px;
  margin-top: 10px;
`

const MembersPage = (): JSX.Element => {
  const { api } = useKusama()
  const [members, setMembers] = useState<DeriveSocietyMember[] | []>([])

  const loading = !api?.query?.society

  useEffect(() => {
    if (!loading) {
      api.derive.society.members().then((response: DeriveSocietyMember[]) => {
        setMembers(response)
      })
    }
  }, [api?.query?.society])

  const content = loading ? <Spinner animation="border" variant="primary" /> : <>

  {members.map(member =>
            <div key={member.accountId.toString()}>
              <div>
                <p>accountId: {member.accountId.toHuman()}</p>
                <p>isDefenderVoter: {member.isDefenderVoter ? 'true' : 'false'}</p>
                <p>isSuspended: {member.isSuspended ? 'true' : 'false'}</p>
                <p>
                  payouts: {(member.payouts.length <= 0)
                  ? 'NONE'
                  : member.payouts.map((payout, index) => {
                    const [blockNumber, amount] = payout

                    return(<span key={index}>
                        block: {blockNumber.toHuman()} -
                        amount: {amount.toHuman()}
                      </span>)
                  })
                  }
                </p>
                <p>
                  strikes: {member.strikes.isEmpty
                  ? 'NONE'
                  : member.strikes.toHuman()
                  }
                </p>
                <p>
                  vouching: {member.vouching
                  ? <>
                      {member.vouching.isBanned ? 'isBanned' : ''}
                      {member.vouching.isVouching ? 'isVouching' : ''}
                    </>
                  : 'NONE'
                  }
                </p>
                <p>
                  vote: {member.vote
                  ? <>
                      {member.vote.isApprove ? 'isApproved' : ''}
                      {member.vote.isReject ? 'isRejected' : ''}
                      {member.vote.isSkeptic ? 'isSkeptic' : ''}
                    </>
                  : 'NONE'
                  }
                </p>
              </div>
            </div>
          )}

  </>

  return (content)
}

export { MembersPage }
