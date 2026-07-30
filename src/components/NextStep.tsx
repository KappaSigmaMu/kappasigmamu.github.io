/* eslint-disable react/no-unescaped-entities */
import { ReactElement, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { LinkWithQuery } from './LinkWithQuery'
import { isVotingPeriod } from './rotation-bar/helpers/periods'
import { useAccount } from '@/account/AccountContext'
import { useAssetHub } from '@/chain/ChainProvider'
import { submitTx, type StatusChangeHandler } from '@/chain/society/tx'
import type { ExtrinsicResult } from '@/chain/types'
import { useConsts } from '@/hooks/useConsts'
import { useRelayChainBlockNumber } from '@/hooks/useRelayChainBlockNumber'
import { LoadingSpinner } from '@/pages/explore/components/LoadingSpinner'
import { toastByStatus } from '@/pages/explore/helpers'

const StyledP = styled.p`
  color: ${(props) => props.theme.colors.lightGrey};
`
interface LevelsType {
  [key: string]: ReactElement
}
const HumanNextStep = (
  <>
    <h5 className="mb-4">
      To become a Candidate you need to level up;
      <br />
      To level up you must first Submit a Bid.
    </h5>
    <LinkWithQuery to="/explore/bidders" className="ml-5 btn btn-primary">
      Submit a Bid
    </LinkWithQuery>
  </>
)
const BidderNextStep = (
  <>
    <h5 className="mb-4">To become a Candidate your bid must be accepted.</h5>
    <LinkWithQuery to="/explore/bidders" className="ml-5 btn btn-primary">
      Check Bids
    </LinkWithQuery>
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
    <LinkWithQuery to="/explore/poi" className="btn btn-outline-light-grey">
      Ink Art
    </LinkWithQuery>
    &nbsp;&nbsp;
    <a
      href="https://matrix.to/#/!BUmiAAnAYSRGarqwOt:matrix.parity.io?via=matrix.parity.io"
      target="_blank"
      className="btn btn-primary"
      rel="noreferrer"
    >
      Submit Proof of Ink
    </a>
    <br />
    <br />
    <LinkWithQuery to="/journey?claim=true">I've already submitted Proof of Ink</LinkWithQuery>
  </>
)
const CyborgNextStep = (
  <>
    <h5 className="mb-4">Welcome to the Kusama Society!</h5>
    <LinkWithQuery to="/explore/bidders" className="btn btn-outline-light-grey">
      Vouch for someone
    </LinkWithQuery>
    &nbsp;&nbsp;
    <LinkWithQuery to="/explore/candidates" className="ml-5 btn btn-primary">
      Vote on Candidates
    </LinkWithQuery>
  </>
)
const LEVELS: LevelsType = {
  human: HumanNextStep,
  bidder: BidderNextStep,
  candidate: CandidateNextStep,
  cyborg: CyborgNextStep
}

const ClaimMembershipStep = ({
  showMessage,
  handleUpdate
}: {
  showMessage: (args: ExtrinsicResult) => void
  handleUpdate: () => void
}) => {
  const { api } = useAssetHub()
  const { polkadotSigner, isSignerLoading } = useAccount()
  const [loading, setLoading] = useState(false)
  const onStatusChange: StatusChangeHandler = ({ loading: nextLoading, message, status }) => {
    setLoading(Boolean(nextLoading))
    showMessage({ status, message })
    if (!nextLoading && status === 'success') handleUpdate()
  }
  const handleClaim = async () => {
    if (!api) return
    setLoading(true)
    await submitTx(api.tx.Society.claim_membership(), polkadotSigner, {
      finalizedText: 'Claim request sent.',
      onStatusChange
    })
  }
  if (loading || isSignerLoading) return <LoadingSpinner center={false} small />
  return (
    <>
      <h5>It's claim time!</h5>
      <p>If you were approved, go ahead and claim your membership:</p>&nbsp;&nbsp;
      <Button data-test="claim-membership-button" onClick={handleClaim} disabled={!polkadotSigner}>
        Claim Membership
      </Button>
    </>
  )
}

const NextStep = () => {
  const { level, isLevelLoading } = useAccount()
  const { search } = useLocation()
  const currentBlock = useRelayChainBlockNumber() ?? 0
  const { votingPeriod, claimPeriod } = useConsts()
  const claim = new URLSearchParams(search).get('claim')
  const periodsLoaded = votingPeriod > 0 && claimPeriod > 0
  const isClaimPeriod = Boolean(claim) || (periodsLoaded && !isVotingPeriod(votingPeriod, claimPeriod, currentBlock))
  const showMessage = (result: ExtrinsicResult) => toastByStatus[result.status](result.message, { id: result.message })
  if (isLevelLoading) return <LoadingSpinner />
  return (
    <>
      <StyledP>{level !== 'cyborg' && 'Next Step'}</StyledP>
      {level === 'candidate' && isClaimPeriod ? (
        <ClaimMembershipStep showMessage={showMessage} handleUpdate={() => undefined} />
      ) : (
        LEVELS[level]
      )}
    </>
  )
}

export { NextStep }
