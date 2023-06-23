import { Col, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { ExternalLink } from '../components/base'
import CanaryRed from '../static/grid-canary-red.png'
import CanaryGreen from '../static/spots-canary-green.png'

const SocietyGuideLink = styled(ExternalLink).attrs(() => ({
  href: 'https://wiki.polkadot.network/docs/maintain-guides-society-kusama',
}))`
  font-size: 24px;
  font-weight: 700;
  text-decoration: none;
`

const TattooRulesLink = styled(ExternalLink).attrs(() => ({
  href: 'https://polkascan.io/kusama/transaction/0x948d3a4378914341dc7af9220a4c73acb2b3f72a70f14ee8089799da16d94c17',
}))`
  text-decoration: none;
`

const SocietyElementLink = styled(ExternalLink).attrs(() => ({
  href: 'https://riot.im/app/#/room/#kappasigmamulounge:matrix.parity.io',
}))`
  text-decoration: none;
`

const Motion186Link = styled(ExternalLink).attrs(() => ({
  href: 'https://kusama.polkassembly.io/motion/186',
}))`
  text-decoration: none;
`

const ThirdGenerationLink = styled(ExternalLink).attrs(() => ({
  href: 'https://www.youtube.com/watch?v=-JfQ2vCipWU',
}))`
  text-decoration: none;
`

const BrandingDriveLink = styled(ExternalLink).attrs(() => ({
  href: 'https://drive.google.com/drive/u/1/folders/1ReG63yRvPgIRRyryDTbrACHELcZoMkA3',
}))`
  text-decoration: none;
`

const BrandingIPFSLink = styled(ExternalLink).attrs(() => ({
  href: 'https://cloudflare-ipfs.com/ipfs/QmTvCsRfGXhPN4kqu19hhYV2zR7dCB1RFR6D7JUaxRpkxF#x-ipfs-companion-no-redirect',
}))`
  text-decoration: none;
`

const CodeRepositoryLink = styled(ExternalLink).attrs(() => ({
  href: 'https://github.com/KappaSigmaMu',
}))`
  text-decoration: none;
`

const TrelloLink = styled(ExternalLink).attrs(() => ({
  href: 'https://trello.com/b/aqOYaoD0/ksm-society-website',
}))`
  text-decoration: none;
`

const CyborgGuidePage = () => {
  document.body.style.overflow = "auto"

  return (
    <Guide>
      <Row>
        <CanaryImg src={CanaryRed} className="float-end" alt="Grid Canary Red" />
        <Col xs={12} lg={6} className="px-0">
          <GuideTitleRow className="mb-5">
            <GuideTitle xs className="display-1 text-uppercase text-center d-flex align-items-center">
              Cyborg Guide
            </GuideTitle>
          </GuideTitleRow>
          <JourneyIntroContainer className="px-0 position-relative">
            <GuideRow className="mb-5 pt-5">
              <Col>
                <div className="h1 text-uppercase font-weight-bold">
                  The journey
                </div>
                <p className="mb-1">
                  To become a Cyborg means to get a membership in the Kappa Sigma Mu
                  Society.
                </p>
                <div className="mb-5">
                  <SocietyGuideLink>You can learn more about it here.</SocietyGuideLink>
                </div>
              </Col>
            </GuideRow>
          </JourneyIntroContainer>
          <TimelineContainer>
            <GuideRow>
              <Col>
                <span className="badge rounded-pill bg-primary text-uppercase">
                  Level 1
                </span>
              </Col>
            </GuideRow>
            <GuideRow>
              <Col className="mb-2">
                <div className="h1">Human</div>
              </Col>
            </GuideRow>
            <GuideRow className="pb-5">
              <Col>
                <strong>
                  <p className="mb-1">Connect your wallet</p>
                </strong>
                <p>
                  You start out as a Human, with your Polkadot Wallet connected.
                </p>
              </Col>
            </GuideRow>
          </TimelineContainer>
          <TimelineContainer>
            <GuideRow>
              <Col>
                <span className="badge rounded-pill bg-primary text-uppercase">
                  Level 2
                </span>
              </Col>
            </GuideRow>
            <GuideRow>
              <Col className="mb-2">
                <div className="h1">Bidder</div>
              </Col>
            </GuideRow>
            <GuideRow className="pb-5">
              <Col>
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
          </TimelineContainer>
          <TimelineContainer>
            <GuideRow>
              <Col>
                <span className="badge rounded-pill bg-primary text-uppercase">
                  Level 3
                </span>
              </Col>
            </GuideRow>
            <GuideRow>
              <Col className="mb-2">
                <div className="h1">Candidate</div>
              </Col>
            </GuideRow>
            <GuideRow className="pb-5">
              <Col>
                <strong>
                  <p className="mb-1">Becoming a Candidate</p>
                </strong>
                <p className="mb-1">
                  When your bid gets accepted, you become a Candidate. Now it’s time
                  to get tattoed!
                </p>
                <p>
                  <TattooRulesLink>See the rules for your PoI here.</TattooRulesLink>
                </p>
                <strong>
                  <p className="mb-1">Your tattoo, the Proof of Ink (PoI)</p>
                </strong>
                <p>
                  After getting your PoI, it’s time to show it to the world! You can
                  submit a photo or video of it&nbsp;
                  <SocietyElementLink>here on our Kappa Sigma Mu Lounge.</SocietyElementLink>
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
          </TimelineContainer>
          <TimelineContainer>
            <GuideRow>
              <Col>
                <span className="badge rounded-pill bg-primary text-uppercase">
                  Level 4
                </span>
              </Col>
            </GuideRow>
            <GuideRow>
              <Col className="mb-2">
                <div className="h1">Cyborg</div>
              </Col>
            </GuideRow>
            <GuideRow>
              <Col>
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
                  requested to show their PoI again, as Defenders, to prove they
                  still have their PoI.
                </p>
                <strong>
                  <p className="mb-1">Request a Payout</p>
                </strong>
                <p>
                  Once you become a Cyborg, there is a period to wait until you
                  can request your payout, the bid you placed. Once this period
                  is up, you can request it here on this website.
                </p>
              </Col>
            </GuideRow>
          </TimelineContainer>
        </Col>
        <Col xs={12} lg={6} className="text-uppercase text-end ms-auto pt-5">
          <LinksContainer className="position-relative">
            <p>
              <SocietyGuideLink>Kusama society guide</SocietyGuideLink>
            </p>
            <p>
              <TattooRulesLink>Tattoo rules</TattooRulesLink>
            </p>
            <p>
              <Motion186Link>Motion 186</Motion186Link>
            </p>
            <p>
              <ThirdGenerationLink>The Third Generation</ThirdGenerationLink>
            </p>
            <p>
              <BrandingDriveLink>Brand Book (Google Drive)</BrandingDriveLink>
            </p>
            <p>
              <BrandingIPFSLink>Brand Book (IPFS)</BrandingIPFSLink>
            </p>
            <p>
              <CodeRepositoryLink>Code Repository</CodeRepositoryLink>
            </p>
            <p>
              <TrelloLink>Trello</TrelloLink>
            </p>
          </LinksContainer>
        </Col>
      </Row>
    </Guide>
  )
}

const Guide = styled(Container)`
  position: relative;
  margin: 0 auto;
  padding-top: 5vh;
  padding-bottom: 5vh;
`

const GuideRow = styled(Container)`
  padding-left: 12px;
  padding-bottom: 20px;
`

const GuideTitleRow = styled(Container)`
  display: flex;
  justify-content: space-between;
  padding-left: 12px;
  padding-bottom: 20px;
`

const GuideTitle = styled(Col)`
  background: url(${CanaryGreen});
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  font-size: 500%;
  color: white;
  font-weight: bolder;
  display: inline-block;
  height: 340px;
`

const JourneyIntroContainer = styled(Container)`
  @media(max-width: 1024px) {
    text-align: center;
  }
`

const TimelineContainer = styled(Container)`
  position: relative;
  @media(min-width: 1024px) {
    border-left: 2px solid grey;
  }
  @media(max-width: 1024px) {
    * {
      color: #fff;
      text-shadow: 2px 2px #000;
      a {
        color: ${(props) => props.theme.colors.secondary}
      }
      span {
        font-weight: bold
      }
    }
  }
  .badge {
    text-shadow: none;
  }
}
`

const LinksContainer = styled(Container)`
  padding-right: 0;
  @media(max-width: 1024px) {
    text-align: center;
    text-shadow: 2px 2px #000;
  }
`

const CanaryImg = styled.img`
  position: fixed;
  top: 45%;
  width: 500px;
  right: 20%;
  @media(max-width: 1024px) {
    opacity: 0.5;
    right: unset;
    top: unset;
    bottom: -1%;
  }
`

export { CyborgGuidePage }
