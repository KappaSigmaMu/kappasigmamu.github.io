import { Col, Container } from 'react-bootstrap'
import styled from 'styled-components'
import { ExternalLink } from '../components/base'
import GilWireframeRed from '../static/gil-wireframe.png'
import GilWireframe from '../static/gil-wireframe.png'

const SocietyGuideLink = styled(ExternalLink).attrs(() => ({
  href: 'https://docs.google.com/document/d/1trsjncEMSRT2u2eSh1IsQfB9o7tfh9s4moMbA2op6RA/edit',
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

const SelfObliterationLink = styled(ExternalLink).attrs(() => ({
  href: 'https://www.youtube.com/watch?v=n6wnhLqJqVE',
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

const TranshumanismPage = () => {
  document.body.style.overflow = "auto"

  return (<>
    <Container>
      <GuideTitleRow className="mb-5">
        <GuideTitle xs lg="6" className="display-1 text-uppercase d-flex align-items-center">
          Transhumanism
        </GuideTitle>
        <Col className="text-uppercase text-end ms-auto pt-5 d-inline-block">
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
            <BrandingDriveLink>Branding Drive</BrandingDriveLink>
          </p>
          <p>
            <CodeRepositoryLink>Code Repository</CodeRepositoryLink>
          </p>
          <p>
            <TrelloLink>Trello</TrelloLink>
          </p>
        </Col>
      </GuideTitleRow>
    </Container>
    <Container>
      <GuideRow className="mb-5">
        <Col>
          <div className="h1 text-uppercase font-weight-bold">
            HAPPINESS IS MADE OF METAL
          </div>
          <p className="mb-1">
            A partnership between Gilberto Gil and Kappa Sigma Mu.
          </p>
          <div className="mb-5">
            <SocietyGuideLink>You can learn more about it here.</SocietyGuideLink>
          </div>
          <CanaryImg src={GilWireframeRed} className="float-end" alt="Grid Canary Red" style={{ "bottom": 0 }} />
        </Col>
      </GuideRow>
      <VerticalLine />
    </Container>
    <Container className="born">
      <GuideRow>
        <Col xs lg="6">
          <span className="badge rounded-pill bg-primary text-uppercase">
            1942
          </span>
        </Col>
      </GuideRow>
      <GuideRow>
        <Col xs lg="6" className="mb-2">
          <div className="h1">Born</div>
        </Col>
      </GuideRow>
      <GuideRow className="mb-5">
        <Col xs lg={6}>
          <strong>
            <p className="mb-1">Gilberto Gil was born in June 26th, 1942</p>
          </strong>
        </Col>
      </GuideRow>
    </Container>
    <Container className="self-obliteration">
      <GuideRow>
        <Col xs lg="6">
          <span className="badge rounded-pill bg-primary text-uppercase">
            1967
          </span>
        </Col>
      </GuideRow>
      <GuideRow>
        <Col xs lg="6" className="mb-2">
          <div className="h1">Self-Obliteration</div>
        </Col>
      </GuideRow>
      <GuideRow className="mb-5">
        <Col xs lg={6}>
          <strong>
            <p className="mb-1">
              Yayoi Kusama releases her highly experimental short film:
              <SelfObliterationLink> Kusama&apos;s Self-Obliteration</SelfObliterationLink>
            </p>
          </strong>
        </Col>
      </GuideRow>
    </Container>
    <Container className="dictatorship">
      <GuideRow>
        <Col xs lg="6">
          <span className="badge rounded-pill bg-primary text-uppercase">
            1964-1985
          </span>
        </Col>
      </GuideRow>
      <GuideRow>
        <Col xs lg="6" className="mb-2">
          <div className="h1">Brazilian dictatorship</div>
        </Col>
      </GuideRow>
      <GuideRow className="mb-5">
        <Col xs lg={6}>
          <strong>
            <p className="mb-1">
              The military dictatorship in Brazil was established on 1 April 1964,
              after a coup d&apos;état by the Brazilian Armed Forces,
              with support from the United States government
            </p>
          </strong>
        </Col>
      </GuideRow>
    </Container>
    <Container className="censorship">
      <GuideRow>
        <Col xs lg="6">
          <span className="badge rounded-pill bg-primary text-uppercase">
            1968
          </span>
        </Col>
      </GuideRow>
      <GuideRow>
        <Col xs lg="6" className="mb-2">
          <div className="h1">The Superior Council of Censorship</div>
        </Col>
      </GuideRow>
      <GuideRow className="mb-5">
        <Col xs lg={6}>
          <strong>
            <p className="mb-1">
              On November 22, 1968, the Superior Council of Censorship was created, based on the American model of 1939
            </p>
          </strong>
        </Col>
      </GuideRow>
    </Container>
    <Container className="censored">
      <GuideRow>
        <Col xs lg="6">
          <span className="badge rounded-pill bg-primary text-uppercase">
            1969
          </span>
        </Col>
      </GuideRow>
      <GuideRow>
        <Col xs lg="6" className="mb-2">
          <div className="h1">Censored but not stopped</div>
        </Col>
      </GuideRow>
      <GuideRow className="mb-5">
        <Col xs lg={6}>
          <strong>
            <p className="mb-1">
              Gilberto Gil is arrested by the brazilian government and left in solitary confinement,
              but that didn&apos;t stop him
            </p>
          </strong>
        </Col>
      </GuideRow>
    </Container>
    <Container className="kusama-launch">
      <GuideRow>
        <Col xs lg="6">
          <span className="badge rounded-pill bg-primary text-uppercase">
            2019
          </span>
        </Col>
      </GuideRow>
      <GuideRow>
        <Col xs lg="6" className="mb-2">
          <div className="h1">Kusama Launch</div>
        </Col>
      </GuideRow>
      <GuideRow className="mb-5">
        <Col xs lg={6}>
        </Col>
      </GuideRow>
    </Container>
    <Container className="happiness mb-5">
      <GuideRow>
        <Col xs lg="6">
          <span className="badge rounded-pill bg-primary text-uppercase">
            2022
          </span>
        </Col>
      </GuideRow>
      <GuideRow>
        <Col xs lg="6" className="mb-2">
          <div className="h1">Happiness is made of metal</div>
        </Col>
      </GuideRow>
      <GuideRow>
        <Col xs lg={6}>
          Gilberto Gil becomes immortal and uncensorable on his 80th birthday
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

const GuideTitleRow = styled(Container)`
  display: flex;
  justify-content: space-between;
  padding-left: 12px;
  padding-bottom: 20px;
`

const GuideTitle = styled(Col)`
  background: url(${GilWireframe});
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  font-size: 500%;
  color: white;
  font-weight: bolder;
  display: inline-block;
`

const VerticalLine = styled.div`
  border-left: 2px solid grey;
  margin-left: -10px;
  height: 1600px;
  position: absolute;
  z-index: 3;
`

const CanaryImg = styled.img`
  position: fixed;
  top: 45%;
  width: 500px;
  right: 20%;
`

export { TranshumanismPage }
