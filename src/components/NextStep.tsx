/* eslint-disable react/no-unescaped-entities */
import { ApiPromise } from '@polkadot/api'
import { u32 } from '@polkadot/types'
import { ReactElement, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { LinkWithQuery } from './LinkWithQuery'
import { isVotingPeriod } from './rotation-bar/helpers/periods'
import { useAccount } from '../account/AccountContext'
import { StatusChangeHandler, doTx } from '../helpers/extrinsics'
import { useKusama } from '../kusama/KusamaContext'
import { LoadingSpinner } from '../pages/explore/components/LoadingSpinner'
import { toastByStatus } from '../pages/explore/helpers'

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

const ClaimMembershipStep = ({
  api,
  showMessage,
  handleUpdate
}: {
  api: ApiPromise
  showMessage: (args: ExtrinsicResult) => any
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

const NextStep = () => {
  const { level, setLevel } = useAccount()
  const { api } = useKusama()
  const { search } = useLocation()
  const [currentBlock, setCurrentBlock] = useState<number>(0)
  const [votingPeriod, setVotingPeriod] = useState<number>(0)
  const [claimPeriod, setClaimPeriod] = useState<number>(0)

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

  const claim = new URLSearchParams(search).get('claim')
  const isClaimPeriod = claim || !isVotingPeriod(votingPeriod, claimPeriod, currentBlock)

  const showMessage = (nextResult: ExtrinsicResult) => {
    toastByStatus[nextResult.status](nextResult.message, { id: nextResult.message })
  }

  const handleUpdate = () => {
    setLevel('cyborg')
  }

  return (
    <>
      <StyledP>{level !== 'cyborg' && 'Next Step'}</StyledP>
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
  showMessage: (args: ExtrinsicResult) => any
  handleUpdate: () => void
  successText: string
  waitingText: string
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

  const onStatusChange: StatusChangeHandler = ({ loading, message, status }) => {
    loading && setLoading(loading)
    showMessage({ status, message })
    if (!loading && status === 'success') handleUpdate()
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
