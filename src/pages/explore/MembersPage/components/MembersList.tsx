import type { WalletAccount } from '@talismn/connect-wallets'
import { useEffect, useState } from 'react'
import { Badge, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { MemberDetailsOffCanvas } from './MemberDetailsOffcanvas'
import { useAccount } from '../../../../account/AccountContext'
import { isSameAddress } from '../../../../chain/ss58'
import type { AccountId, ExtrinsicResult, SocietyMember } from '../../../../chain/types'
import { AccountIdentity } from '../../../../components/AccountIdentity'
import { AccountIndex } from '../../../../components/AccountIndex'
import { DataHeaderRow, DataRow } from '../../../../components/base'
import { VoteButton } from '../../CandidatesPage/components/VoteButton'
import { Identicon } from '../../components/Identicon'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { toastByStatus } from '../../helpers'

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
type Props = { members: SocietyMember[]; activeAccount: WalletAccount | undefined; handleUpdate: () => void }

const MembersList = ({ members, activeAccount, handleUpdate }: Props): JSX.Element => {
  const { level, isLevelLoading, isSignerLoading } = useAccount()
  const [activeAccountIsDefenderVoter, setActiveAccountIsDefenderVoter] = useState(false)
  const [disabledVote, setDisabledVote] = useState(false)
  const [selectedMember, setSelectedMember] = useState<AccountId | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  useEffect(() => {
    setActiveAccountIsDefenderVoter(
      members.some((member) => member.isDefenderVoter && isSameAddress(member.accountId, activeAccount?.address))
    )
  }, [members, activeAccount])
  const showMessage = (result: ExtrinsicResult) => {
    setDisabledVote(result.status === 'loading')
    toastByStatus[result.status](result.message, { id: result.message })
  }
  if (activeAccount && (isLevelLoading || isSignerLoading)) return <LoadingSpinner />
  if (members.length === 0) return <>No members</>
  return (
    <div data-test="members-list">
      {selectedMember && (
        <div data-test="member-detail-panel">
          <MemberDetailsOffCanvas accountId={selectedMember} show={showDetails} onClose={() => setShowDetails(false)} />
        </div>
      )}
      <DataHeaderRow className="d-none d-lg-flex text-center">
        <Col lg={1}>#</Col>
        <Col lg={3} className="text-center text-lg-start">
          Wallet Hash
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          Index
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          {level === 'cyborg' && 'Defender Vote'}
        </Col>
        <Col lg={1} className="text-center text-lg-start">
          Strikes
        </Col>
        <Col lg={3}></Col>
      </DataHeaderRow>
      {members.map((member) => (
        <StyledDataRow
          key={member.accountId}
          $isDefender={member.isDefender}
          data-test={`member-row-${member.accountId}`}
        >
          <Col lg={1} className="text-center">
            <Identicon value={member.accountId} size={32} theme="polkadot" />
          </Col>
          <Col
            lg={3}
            className="text-center text-lg-start text-truncate"
            onClick={() => {
              setSelectedMember(member.accountId)
              setShowDetails(true)
            }}
          >
            <AccountIdentity accountId={member.accountId} />
          </Col>
          <Col lg={2} className="text-center text-lg-start text-truncate">
            <AccountIndex accountId={member.accountId} />
          </Col>
          <Col
            lg={2}
            className={`d-flex justify-content-lg-start justify-content-center align-items-center py-2 ${
              member.isDefender && level === 'cyborg' ? 'd-inline' : 'd-none d-lg-inline p-0'
            }`}
            data-test={member.isDefender ? 'defender-section' : undefined}
          >
            {member.isDefender && level === 'cyborg' && (
              <>
                <VoteButton
                  disabled={disabledVote}
                  showMessage={showMessage}
                  successText="Approval vote sent."
                  waitingText="Request sent. Waiting for response..."
                  vote={{ approve: true, voterAccount: activeAccount!, accountId: member.accountId, type: 'defender' }}
                  icon="approve"
                  handleUpdate={handleUpdate}
                  data-test="defender-approve-button"
                />
                <VoteButton
                  disabled={disabledVote}
                  showMessage={showMessage}
                  successText="Rejection vote sent."
                  waitingText="Request sent. Waiting for response..."
                  vote={{ approve: false, voterAccount: activeAccount!, accountId: member.accountId, type: 'defender' }}
                  icon="reject"
                  handleUpdate={handleUpdate}
                  data-test="defender-reject-button"
                />
              </>
            )}
          </Col>
          <Col lg={1} className="text-center text-lg-start" data-test={`member-strikes-${member.accountId}`}>
            <span style={{ color: member.strikes > 5 ? 'red' : 'white' }}>
              {member.strikes}
              <span style={{ color: member.strikes > 5 ? 'red' : 'white' }} className="d-inline d-lg-none">
                &nbsp;strikes
              </span>
            </span>
          </Col>
          <Col lg={3} className="text-center text-lg-end" data-test={`member-badges-${member.accountId}`}>
            {member.isDefender && (
              <Badge pill bg="primary" className="me-2 p-2">
                Defender
              </Badge>
            )}
            {member.isFounder && (
              <Badge pill bg="dark" className="me-2 p-2">
                Founder
              </Badge>
            )}
            {member.isHead && (
              <Badge pill bg="dark" className="me-2 p-2">
                Society Head
              </Badge>
            )}
            {member.isSkeptic && (
              <Badge pill bg="danger" className="me-2 p-2">
                Round Skeptic
              </Badge>
            )}
            {member.rank > 0 && (
              <Badge pill bg="dark" className="me-2 p-2">
                Ranked
              </Badge>
            )}
            {member.isDefender && activeAccountIsDefenderVoter && (
              <Badge bg="secondary" text="black">
                Voted
              </Badge>
            )}
          </Col>
        </StyledDataRow>
      ))}
    </div>
  )
}

export { MembersList }
