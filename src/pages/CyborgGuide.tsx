import { Col, Container } from 'react-bootstrap'
import styled from 'styled-components'
import Canary from '../static/mock-canary.svg'

// eslint-disable-next-line max-len
const SOCIETY_RULES_URL = 'https://polkascan.io/kusama/transaction/0x948d3a4378914341dc7af9220a4c73acb2b3f72a70f14ee8089799da16d94c17'

const TattooRulesLink = (props: { children: string }) => (
  <a
    target="_blank"
    href={SOCIETY_RULES_URL}
    rel="noreferrer"
  >
    {props.children}
  </a>
)

const CyborgGuide = (): JSX.Element => {
  return (
    <>
      <Container>
        <GuideRow>
          <GuideTitle xs lg="6" className="display-1 text-uppercase pt-5">
            Cyborg Guide
          </GuideTitle>
          <Col className="text-uppercase text-end ms-auto mt-4">
            <p>
              <a
                target="_blank"
                href="https://wiki.polkadot.network/docs/maintain-guides-society-kusama"
                rel="noreferrer"
              >
                Kusama society guide
              </a>
            </p>
            <p>
              <TattooRulesLink>
                Tattoo rules
              </TattooRulesLink>
            </p>
          </Col>
        </GuideRow>
      </Container>
      <Container>
        <GuideRow>
          <Col>
            <div className="h1 text-uppercase font-weight-bold">
              The journey
            </div>
            <p className="mb-1">
              To become a Cyborg means to get a membership in the Kappa Sigma Mu
              Society.
            </p>
            <div className="mb-5">
              <a
                target="_blank"
                href="https://wiki.polkadot.network/docs/maintain-guides-society-kusama"
                rel="noreferrer"
              >
                You can learn more about it here.
              </a>
            </div>
            <CanaryImg src={Canary} className="float-end" alt="Canary" />
          </Col>
        </GuideRow>
      </Container>
      <VerticalLine />
      <Container>
        <GuideRow>
          <Col xs lg="2">
            <BulletPoint className="pr-5">• </BulletPoint>
            <span className="badge rounded-pill bg-primary text-uppercase">
              Level 1
            </span>
          </Col>
        </GuideRow>
        <GuideRow>
          <Col xs lg="2" className="mb-2">
            <div className="h1 text-decoration-underline">Human</div>
          </Col>
        </GuideRow>
        <GuideRow className="mb-5">
          <Col xs lg={6}>
            <strong>
              <p className="mb-1">Connect your wallet</p>
            </strong>
            <p>
              You start out as a Human, with your Polkadot Wallet connected.
            </p>
          </Col>
        </GuideRow>
      </Container>
      <Container>
        <GuideRow>
          <Col xs lg="2">
            <BulletPoint className="pr-5">• </BulletPoint>
            <span className="badge rounded-pill bg-primary text-uppercase">
              Level 2
            </span>
          </Col>
        </GuideRow>
        <GuideRow>
          <Col xs lg="2" className="mb-2">
            <div className="h1 text-decoration-underline">Bidder</div>
          </Col>
        </GuideRow>
        <GuideRow className="mb-5">
          <Col xs lg={6}>
            <strong>
              <p className="mb-1">Place a Bid</p>
            </strong>
            <p>
              Then you must place a bid. Your bid is the KSM value you want to
              receive for getting your Cyborg Tattoo, or Proof of Ink (PoI).
              This process will require some fees.
            </p>
            <strong>
              <p className="mb-1">Get your Bid Accepted</p>
            </strong>
            <p>
              You must do this inside a time frame, the Round. Your bid will
              only get accepted if it’s between the smallest bids which sum is
              below the pot value of the round. It is like a reverse auction.
            </p>
          </Col>
        </GuideRow>
      </Container>
      <Container>
        <GuideRow>
          <Col xs lg="2">
            <BulletPoint className="pr-5">• </BulletPoint>
            <span className="badge rounded-pill bg-primary text-uppercase">
              Level 3
            </span>
          </Col>
        </GuideRow>
        <GuideRow>
          <Col xs lg="2" className="mb-2">
            <div className="h1 text-decoration-underline">Candidate</div>
          </Col>
        </GuideRow>
        <GuideRow className="mb-5">
          <Col xs lg={6}>
            <strong>
              <p className="mb-1">Becoming a Candidate</p>
            </strong>
            <p className="mb-1">
              When your bid gets accepted, you become a Candidate. Now it’s time
              to get tattoed!
            </p>
            <p>
              <TattooRulesLink>
                See the rules for your PoI here.
              </TattooRulesLink>
            </p>
            <strong>
              <p className="mb-1">Your tattoo, the Proof of Ink (PoI)</p>
            </strong>
            <p>
              After getting your PoI, it’s time to show it to the world! You can
              submit a photo or video of it via Discord.
            </p>
            <strong>
              <p className="mb-1">Getting votes on your Proof of Ink</p>
            </strong>
            <p>
              Once it is submitted, the Cyborgs can vote for your approval.
              You’re almost there! Just be careful with your timeframe, you have
              only one round to get the PoI <b>and</b> get voted.
            </p>
          </Col>
        </GuideRow>
      </Container>
      <Container>
        <GuideRow>
          <Col xs lg="2">
            <BulletPoint className="pr-5">• </BulletPoint>
            <span className="badge rounded-pill bg-primary text-uppercase">
              Level 4
            </span>
          </Col>
        </GuideRow>
        <GuideRow>
          <Col xs lg="2" className="mb-2">
            <div className="h1 text-decoration-underline">Cyborg</div>
          </Col>
        </GuideRow>
        <GuideRow>
          <Col xs lg={6}>
            <strong>
              <p className="mb-1">Becoming a Cyborg</p>
            </strong>
            <p>
              Once the round is up, one random vote will decide if you are a
              Cyborg or not. It’s not the majority of votes! Still, the most you
              get approved, the better are your chances.
            </p>
            <strong>
              <p className="mb-1">
                Congrats! You are now a Society member. You can vote, be a
                Skeptic or a Defender
              </p>
            </strong>
            <p>
              As a Cyborg, you can now vote on new Candidates. If you are a
              Skeptic in the Round, you must vote, otherwise you get a strike.
              10 strikes eliminate you from the Society. Cyborgs also can be
              requested to show their PoI again, as Defenders, to proove they
              still have their PoI.
            </p>
            <strong>
              <p className="mb-1">Request a Payout</p>
            </strong>
            <p>
              Once the round is up, one random vote will decide if you are a
              Cyborg or not. It’s not the majority of votes! Still, the most you
              get approved, the better are your chances.
            </p>
          </Col>
        </GuideRow>
      </Container>
    </>
  )
}

const GuideRow = styled(Container)`
  padding-left: 12px;
  padding-bottom: 20px;
`

const GuideTitle = styled(Col)`
  font-size: 450%;
  color: white;
  font-weight: bolder;
`

const VerticalLine = styled.div`
  border-left: 2px solid grey;
  height: 1500px;
  position: absolute;
  left: 8vw;
`

const BulletPoint = styled.span`
  color: grey;
  font-size: 1.5rem;
`

const CanaryImg = styled.img`
  position: relative;
  bottom: 30px;
  width: 50%;
`

export { CyborgGuide }
