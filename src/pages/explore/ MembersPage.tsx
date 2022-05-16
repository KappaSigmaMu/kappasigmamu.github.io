import { Spinner } from 'react-bootstrap'
import { useKusama } from '../../kusama'

const MembersPage = ({ members }: { members: SocietyMember[] }): JSX.Element => {
  const { api } = useKusama()

  const loading = !api?.query?.society
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

                return (<span key={index}>
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
