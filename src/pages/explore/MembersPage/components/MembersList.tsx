import type { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { WalletAccount } from '@talismn/connect-wallets'
import { useEffect, useRef, useState } from 'react'
import { Badge, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { MemberDetailsOffCanvas } from './MemberDetailsOffcanvas'
import { useAccount } from '../../../../account/AccountContext'
import { AccountIdentity } from '../../../../components/AccountIdentity'
import { AccountIndex } from '../../../../components/AccountIndex'
import { DataHeaderRow, DataRow } from '../../../../components/base'
import ApproveIcon from '../../../../static/approve-icon.svg'
import CheckAllIcon from '../../../../static/check-all-icon.svg'
import RejectIcon from '../../../../static/reject-icon.svg'
import { VoteButton } from '../../CandidatesPage/components/VoteButton'
import { Identicon } from '../../components/Identicon'
import { toastByStatus } from '../../helpers'

const StyledDataRow = styled(DataRow)`
  background-color: ${(props) => (props.$isDefender ? '#73003d' : '')};
  border: ${(props) => (props.$isDefender ? '2px solid #E6007A' : '')};
  &:hover {
    cursor: pointer;
  }
`

type MembersListProps = {
  api: ApiPromise
  members: SocietyMember[]
  activeAccount: WalletAccount | undefined
  handleUpdate: () => void
}

const AlreadyVotedIcon = () => (
  <>
    <img src={CheckAllIcon} className="me-2" />
    <label style={{ color: '#6c757d' }}>Voted</label>
  </>
)

const MembersList = ({ api, members, activeAccount, handleUpdate }: MembersListProps): JSX.Element => {
  // Likely impossible to happen but if it does, better to show a
  // clear message than an empty list which may look like a loading state
  if (members.length === 0) return <>No members</>

  const { level } = useAccount()
  const activeAccountIsMember = level === 'cyborg'

  const [activeAccountIsDefenderVoter, setActiveAccountIsDefenderVoter] = useState(false)
  const [disabledVote, setDisabledVote] = useState<boolean>(false)
  const [selectedMember, setSelectedMember] = useState<AccountId | null>(null)
  const [showMemberDetailsOffcanvas, setShowMemberDetailsOffcanvas] = useState(false)

  const showMessage = (nextResult: ExtrinsicResult) => {
    setDisabledVote(nextResult.status === 'loading')
    toastByStatus[nextResult.status](nextResult.message, { id: nextResult.message })
  }

  const showMemberDetails = (memberId: AccountId) => {
    setSelectedMember(memberId)
    setShowMemberDetailsOffcanvas(true)
  }

  const usePrevious = (value: any) => {
    const ref = useRef()
    useEffect(() => {
      ref.current = value
    })
    return ref.current
  }

  const prevActiveAccount = usePrevious(activeAccount)

  useEffect(() => {
    if (members.length === 0) return

    setActiveAccountIsDefenderVoter(
      members.some((member) => member.accountId.toHuman() === activeAccount!.address && member.isDefenderVoter)
    )
  }, [members, activeAccount, prevActiveAccount])

  return (
    <>
      {selectedMember && (
        <MemberDetailsOffCanvas
          api={api}
          accountId={selectedMember}
          show={showMemberDetailsOffcanvas}
          onClose={() => setShowMemberDetailsOffcanvas(false)}
        />
      )}
      <DataHeaderRow>
        <Col xs={1} className="text-center">
          #
        </Col>
        <Col xs={3} className="text-start">
          Wallet Hash
        </Col>
        <Col xs={2} className="text-start">
          Index
        </Col>
        <Col xs={3}>{activeAccountIsMember && 'Defender Vote'}</Col>
        <Col xs={2} className="text-end"></Col>
      </DataHeaderRow>
      {members.map((member: SocietyMember) => (
        <StyledDataRow key={member.accountId.toString()} $isDefender={member.isDefender}>
          <Col xs={1} className="text-center">
            <Identicon value={member.accountId.toHuman()} size={32} theme={'polkadot'} />
          </Col>
          <Col xs={3} className="text-start text-truncate" onClick={() => showMemberDetails(member.accountId)}>
            <AccountIdentity api={api} accountId={member.accountId} />
          </Col>
          <Col xs={2} className="text-start text-truncate">
            <AccountIndex api={api} accountId={member.accountId} />
          </Col>
          <Col xs={3} className="d-flex">
            {member.isDefender && activeAccountIsMember && (
              <>
                <VoteButton
                  disabled={disabledVote}
                  api={api}
                  showMessage={showMessage}
                  successText="Approval vote sent."
                  waitingText="Request sent. Waiting for response..."
                  vote={{ approve: true, voterAccount: activeAccount!, accountId: member.accountId, type: 'defender' }}
                  icon={ApproveIcon}
                  handleUpdate={handleUpdate}
                ></VoteButton>
                <VoteButton
                  disabled={disabledVote}
                  api={api}
                  showMessage={showMessage}
                  successText="Rejection vote sent."
                  waitingText="Request sent. Waiting for response..."
                  vote={{ approve: false, voterAccount: activeAccount!, accountId: member.accountId, type: 'defender' }}
                  icon={RejectIcon}
                  handleUpdate={handleUpdate}
                ></VoteButton>
              </>
            )}
            {member.isDefender && activeAccountIsDefenderVoter ? <AlreadyVotedIcon /> : <></>}
          </Col>
          <Col xs={3} className="text-end">
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
            {member.rank.toNumber() > 0 && (
              <Badge pill bg="dark" className="me-2 p-2">
                Ranked
              </Badge>
            )}
          </Col>
        </StyledDataRow>
      ))}
    </>
  )
}

export { MembersList }
