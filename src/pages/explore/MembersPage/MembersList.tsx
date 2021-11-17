import Identicon from '@polkadot/react-identicon'
import { Col } from 'react-bootstrap'
import { DataHeaderRow, DataRow } from '../../../components/base'

const MembersList = ({ members }: { members: any }): JSX.Element => (
  <>
    <DataHeaderRow>
      <Col xs={1} className="text-center">#</Col>
      <Col xs={1} className="text-center">Defender</Col>
      <Col xs={1} className="text-center">Suspended</Col>
      <Col xs={1} className="text-center">Strikes</Col>
      <Col xs={1} className="text-center">Vouching</Col>
      <Col xs={1} className="text-center">Vote</Col>
      <Col xs={6} className="text-start">Payouts</Col>
    </DataHeaderRow>
    {members.map((member: any) => (
      <DataRow key={member.accountId.toString()}>
        <Col xs={1} className="text-center">
          <Identicon value={member.accountId} size={32} theme={'polkadot'} />
        </Col>
        <Col xs={1} className="text-center">
          {member.isDefenderVoter ? 'true' : 'false'}
        </Col>
        <Col xs={1} className="text-center">
          {member.isSuspended ? 'true' : 'false'}
        </Col>
        <Col xs={1} className="text-center">
          {member.strikes.isEmpty ? 'NONE' : member.strikes.toHuman()}
        </Col>
        <Col xs={1} className="text-center">
          {member.vouching
            ? <>
                {member.vouching.isBanned ? 'isBanned' : ''}
                {member.vouching.isVouching ? 'isVouching' : ''}
              </>
            : 'NONE'
          }
        </Col>
        <Col xs={1} className="text-center">
          {member.vote
            ? <>
                {member.vote.isApprove ? 'isApproved' : ''}
                {member.vote.isReject ? 'isRejected' : ''}
                {member.vote.isSkeptic ? 'isSkeptic' : ''}
              </>
            : 'NONE'
          }
        </Col>
        <Col xs={6} className="text-start">
          {(member.payouts.length <= 0)
            ? 'NONE'
            : member.payouts.map((payout: any, index: any) => {
              const [, amount] = payout

              return(<p key={index}>
                  amount: {amount.toHuman()}
                </p>)
            })
          }
        </Col>
      </DataRow>
    ))}
  </>
)

export { MembersList }
