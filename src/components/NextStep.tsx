/* eslint-disable react/no-unescaped-entities */
import { ApiPromise } from '@polkadot/api'
import { u32 } from '@polkadot/types'
import { ReactElement, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { isVotingPeriod } from './rotation-bar/helpers/periods'
import { useAccount } from '../account/AccountContext'
import { StatusChangeHandler, doTx } from '../helpers/extrinsitcs'
import { useKusama } from '../kusama/KusamaContext'
import { LoadingSpinner } from '../pages/explore/components/LoadingSpinner'
import { StyledAlert } from '../pages/explore/components/StyledAlert'

const StyledP = styled.p`
  color: ${(props) => props.theme.colors.lightGrey};
`

interface LevelsType {
  [key: string]: ReactElement
}

type ExtrinsicResult = {
  success: boolean
  message: string
}

const HumanNextStep = (
  <>
    <h5 className="mb-4">
      To become a Candidate you need to level up;
      <br />
      To level up you must first Submit a Bid.
    </h5>
    <Link to="/explore/bidders" className="ml-5 btn btn-primary">
      Submit a Bid
    </Link>
  </>
)

const BidderNextStep = (
  <>
    <h5 className="mb-4">To become a Candidate your bid must be accepted.</h5>
    <Link to="/explore/bidders" className="ml-5 btn btn-primary">
      Check Bids
    </Link>
  </>
)

const CandidateNextStep = (
  <>
    <h3 className="mb-4">To become a Cyborg you need to submit the Proof of Ink.</h3>
    <a
      href="https://hackmd.io/@laurogripa/SkahoUpIT"
      target="_blank"
      className="btn btn-outline-light-grey"
      rel="noreferrer"
    >
      Proof of Ink (PoI) Rules
    </a>
    &nbsp;&nbsp;
    <Link to="/explore/poi" className="btn btn-outline-light-grey">
      Ink Art
    </Link>
    &nbsp;&nbsp;
    <a
      href="https://matrix.to/#/!BUmiAAnAYSRGarqwOt:matrix.parity.io?via=matrix.parity.io"
      target="_blank"
      className="btn btn-primary"
      rel="noreferrer"
    >
      Submit Proof of Ink
    </a>
  </>
)

const ClaimMembershipStep = ({
  api,
  showMessage,
  handleUpdate
}: {
  api: ApiPromise
  showMessage: (args: ShowMessageArgs) => any
  handleUpdate: () => void
}) => (
  <>
    <h5>It's claim period!</h5>
    <p>If you were approved, go ahead and claim your membership:</p>
    &nbsp;&nbsp;
    <ClaimMembershipButton
      api={api!}
      showMessage={showMessage}
      successText="Claim request sent."
      waitingText="Claim request sent. Waiting for response..."
      handleUpdate={handleUpdate}
    ></ClaimMembershipButton>
  </>
)

const CyborgNextStep = (
  <>
    <h5 className="mb-4">Welcome to the Society!</h5>
    <Link to="/explore/bidders" className="btn btn-outline-light-grey">
      Vouch Bid
    </Link>
    &nbsp;&nbsp;
    <Link to="/explore/candidates" className="ml-5 btn btn-primary">
      Vote on Candidates
    </Link>
  </>
)

const LEVELS: LevelsType = {
  human: HumanNextStep,
  bidder: BidderNextStep,
  candidate: CandidateNextStep,
  cyborg: CyborgNextStep
}

const NextStep = () => {
  const { level, setLevel } = useAccount()
  const { api } = useKusama()
  const [currentBlock, setCurrentBlock] = useState<number>(0)
  const [votingPeriod, setVotingPeriod] = useState<number>(0)
  const [claimPeriod, setClaimPeriod] = useState<number>(0)
  const [showAlert, setShowAlert] = useState(false)
  const [extrinsicResult, setExtrinsicResult] = useState<ExtrinsicResult>({ success: false, message: '' })

  useEffect(() => {
    if (api && api.consts && api.consts.society) {
      const votingPeriod = (api.consts.society.votingPeriod as u32).toNumber()
      setVotingPeriod(votingPeriod)

      const claimPeriod = (api.consts.society.claimPeriod as u32).toNumber()
      setClaimPeriod(claimPeriod)

      api.derive.chain.bestNumber((block) => {
        setCurrentBlock(block.toNumber())
      })
    }
  }, [api])

  const isClaimPeriod = !isVotingPeriod(votingPeriod, claimPeriod, currentBlock)

  const showMessage = (result: ExtrinsicResult) => {
    setExtrinsicResult(result)
    setShowAlert(true)
  }

  const handleUpdate = () => {
    setLevel('cyborg')
  }

  return (
    <>
      <StyledAlert success={extrinsicResult.success} onClose={() => setShowAlert(false)} show={showAlert} dismissible>
        {extrinsicResult.message}
      </StyledAlert>

      <StyledP>Next Step</StyledP>
      {level === 'candidate' && isClaimPeriod ? (
        <ClaimMembershipStep api={api!} showMessage={showMessage} handleUpdate={handleUpdate} />
      ) : (
        LEVELS[level]
      )}
    </>
  )
}

type ClaimMembershipButtonProps = {
  api: ApiPromise
  showMessage: (args: ShowMessageArgs) => any
  handleUpdate: () => void
  successText: string
  waitingText: string
}

interface ShowMessageArgs {
  success: boolean
  message: string
}

function ClaimMembershipButton({
  api,
  showMessage,
  handleUpdate,
  successText,
  waitingText
}: ClaimMembershipButtonProps) {
  const [loading, setLoading] = useState(false)
  const { activeAccount } = useAccount()

  const onStatusChange: StatusChangeHandler = ({ loading, message, success }) => {
    setLoading(loading)
    showMessage({ success, message })
    if (!loading && success) handleUpdate()
  }

  const handleClaim = async () => {
    setLoading(true)
    try {
      await doTx(api, api.tx.society.claimMembership(), successText, waitingText, activeAccount, onStatusChange)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner center={false} small={true} />

  return <Button onClick={handleClaim}>Claim Membership</Button>
}

export { NextStep }
