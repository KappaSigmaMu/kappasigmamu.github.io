import { Col, Container } from 'react-bootstrap'
import styled from 'styled-components'
import { ExternalLink } from '../components/base'
import GilWireframe from '../static/gil-wireframe.png'

const SocietyGuideLink = styled(ExternalLink).attrs(() => ({
  href: 'https://docs.google.com/document/d/1trsjncEMSRT2u2eSh1IsQfB9o7tfh9s4moMbA2op6RA/edit',
}))`
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
`

const SelfObliterationLink = styled(ExternalLink).attrs(() => ({
  href: 'https://www.youtube.com/watch?v=n6wnhLqJqVE',
}))`
  text-decoration: none;
`

const VelosoLink = styled(ExternalLink).attrs(() => ({
  href: 'https://en.wikipedia.org/wiki/Caetano_Veloso',
}))`
text-decoration: none;
`

const TropicaliaLink = styled(ExternalLink).attrs(() => ({
  href: 'https://en.wikipedia.org/wiki/Tropic%C3%A1lia:_ou_Panis_et_Circencis',
}))`
text-decoration: none;
`

const ActFiveLink = styled(ExternalLink).attrs(() => ({
  href: 'https://www.americasquarterly.org/article/50-years-ago-brazil-virtually-legalized-torture-and-censorship',
}))`
  text-decoration: none;
`
const ActFiveWikiLink = styled(ExternalLink).attrs(() => ({
  href: 'https://en.wikipedia.org/wiki/Institutional_Act_Number_Five',
}))`
  text-decoration: none;
`

const FuturivelPage = () => {
  document.body.style.overflow = "auto"

  return (
    <Futurable>
      <Container>
        <GuideTitleRow className="d-flex align-items-center">
          <GuideTitle xs className="display-1 text-uppercase d-flex align-items-center">
            Gil Futurível
          </GuideTitle>
        </GuideTitleRow>
      </Container>
      <Container>
        <GuideRow className="mb-5">
          <Col xs lg="12">
            <GuideSubtitle className="h1 text-uppercase font-weight-bold">
              HAPPINESS IS MADE OF METAL
            </GuideSubtitle>
            <p className="mb-1">
              A partnership between Gilberto Gil and Kappa Sigma Mu.
            </p>
            <div className="mb-5">
              <SocietyGuideLink>You can learn more about how everything started in this proposal.</SocietyGuideLink>
            </div>
            <GilWireframeImg className="float-end"></GilWireframeImg>
          </Col>
        </GuideRow>
      </Container>
      <TimelineContainer className="born">
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
        <GuideRow className="pb-5">
          <Col xs lg={6}>
            <p className="mb-1">
              Gilberto Passos Gil Moreira, known professionally as Gilberto Gil,
              was born in 26 June 1942 in Salvador, Bahia, Brazil.
              <br /> <br />
              Gilberto Gil is widely known for both his musical innovation and political activism.
            </p>
          </Col>
        </GuideRow>
      </TimelineContainer>
      <TimelineContainer className="early-career">
        <GuideRow>
          <Col xs lg="6">
            <span className="badge rounded-pill bg-primary text-uppercase">
              1963-1968
            </span>
          </Col>
        </GuideRow>
        <GuideRow>
          <Col xs lg="6" className="mb-2">
            <div className="h1">Early Career</div>
          </Col>
        </GuideRow>
        <GuideRow className="pb-5">
          <Col xs lg={6}>
            <p className="mb-1">
              Gil started playing bossa nova and traditional Brazilian songs and
              he met guitarist and singer <VelosoLink>Caetano Veloso</VelosoLink> at the
              Federal University of Bahia in 1963.
              The two began collaborating and performing together, releasing a single and EP.
              <br /><br />
              Along with Maria Bethânia (Veloso&apos;s sister), Gal Costa, and Tom Zé, Gil and Veloso
              formed a collective on the landmark 1968 album
              <TropicaliaLink> Tropicália: ou Panis et Circenses</TropicaliaLink>,
              whose style was influenced by The Beatles&apos; Sgt. Pepper&apos;s Lonely Hearts Club Band,
              an album Gil listened to constantly.
              <br /><br />
              Gil describes Tropicália: ou Panis et Circenses as the birth of the tropicália movement.
              T him tropicália, or tropicalismo, was a conflation of musical and cultural developments
              that had occurred in Brazil during the 1950s and 1960s—primarily bossa nova
              and the Jovem Guarda (Young Wave) collective—with rock and roll music from the United States and Europe,
              <span color="white"> a movement deemed threatening by the Brazilian government of the time</span>.
              <br /><br />
              This apparent threat put Veloso and Gil in trouble.
            </p>
          </Col>
        </GuideRow>
      </TimelineContainer>
      <TimelineContainer className="dictatorship">
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
        <GuideRow className="pb-5">
          <Col xs lg={6}>
            <p className="mb-1">
              The military dictatorship in Brazil was established on 1 April 1964,
              after a coup d&apos;état by the Brazilian Armed Forces,
              with support from the United States government.
              <br /><br />
              In 1968 things started becoming dark, when the brazilian military dictatorship
              <ActFiveLink> virtually legalized torture and censorship</ActFiveLink>.
              <br /><br />
              Aong other things, the <ActFiveWikiLink>Instituional Act Number Five </ActFiveWikiLink>
              allowed the government to: censor every medium of mass communication and art;
              made illegal political meetings that didn&apos;t have police authorization;
              take away anyone&apos;s political right for up to ten years and put the death penalty back.
              <br /><br />
              At this point, Gil and Veloso became targets.
            </p>
          </Col>
        </GuideRow>
      </TimelineContainer>
      <TimelineContainer className="censorship">
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
        <GuideRow className="pb-5">
          <Col xs lg={6}>

            <p className="mb-1">
              On November 22, 1968, the Superior Council of Censorship was created, based on the American model of 1939
            </p>
          </Col>
        </GuideRow>
      </TimelineContainer>
      <TimelineContainer className="censored">
        <GuideRow>
          <Col xs lg="6">
            <span className="badge rounded-pill bg-primary text-uppercase">
              1969
            </span>
          </Col>
        </GuideRow>
        <GuideRow>
          <Col xs lg="6" className="mb-2">
            <div className="h1">Censored, imprisoned and exiled, but not stopped</div>
          </Col>
        </GuideRow>
        <GuideRow className="pb-5">
          <Col xs lg={6}>
            <p className="mb-1">
              In February 1969 Gil and Veloso were arrested by the Brazilian military government,
              brought from São Paulo to Rio de Janeiro.
              <br /> <br />

              They were given no reason or charge for their arrest.
              <br /> <br />

              Their heads were shaved and they were jailed in a solitary confinement wing,
              where they could hear the screams of other prisoners being tortured. They spent three months in prison
              and another four under house arrest, before being freed on the condition that they leave the country.
              <br /> <br />

              Gil believes that the government felt his actions <span color="white">&#34;represented
                a threat to them, something new, something that can&apos;t quite be understood,
                something that doesn&apos;t fit into any of the clear compartments of existing cultural practices,
                and that won&apos;t do. That is dangerous.&#34;</span>
              <br /> <br />

              But, that didn&apos;t stop him...
            </p>
          </Col>
        </GuideRow>
      </TimelineContainer>
      <TimelineContainer className="censored">
        <GuideRow>
          <Col xs lg="6">
            <span className="badge rounded-pill bg-primary text-uppercase">
              1969
            </span>
          </Col>
        </GuideRow>
        <GuideRow>
          <Col xs lg="6" className="mb-2">
            <div className="h1">The Electronic Brain</div>
          </Col>
        </GuideRow>
        <GuideRow className="pb-5">
          <Col xs lg={6}>
            <p className="mb-1">
              He composed four songs during his imprisonment,
              among them &#34;Cérebro Electrônico&#34; (&#34;Electronic Brain&#34;)
              and &#34;Futurível&#34; (&#34;Futurable&#34;).

              @TODO: Explain the songs meaning and lyrics
            </p>
          </Col>
        </GuideRow>
      </TimelineContainer>
      <TimelineContainer className="self-obliteration">
        <GuideRow>
          <Col xs lg="6">
            <span className="badge rounded-pill bg-primary text-uppercase">
              1967-1972
            </span>
          </Col>
        </GuideRow>
        <GuideRow>
          <Col xs lg="6" className="mb-2">
            <div className="h1">Kusama&apos;s Self-Obliteration</div>
          </Col>
        </GuideRow>
        <GuideRow className="pb-5">
          <Col xs lg={6}>
            <p className="mb-1">
              On a seemengly unrelated note but around the same time,
              Yayoi Kusama releases her highly experimental short film:
              <SelfObliterationLink> Kusama&apos;s Self-Obliteration</SelfObliterationLink>.
              <br /><br />
              The artist used polka dots to cover and conceal people,
              animals, the environment, and everything around.
              It can be understood as a metaphor of giving up identity, abolishing uniqueness,
              ad becoming one with the universe-or <i>self-obliteration</i>.
              <br /><br />
              It is not clear if both artists know about each others work,
              but they were facing similar issues and fighting for similar things around the same time.
              <br /><br />
              Several years later their work met in a very unusual way...
            </p>
          </Col>
        </GuideRow>
      </TimelineContainer>
      <TimelineContainer className="minister">
        <GuideRow>
          <Col xs lg="6">
            <span className="badge rounded-pill bg-primary text-uppercase">
              2003-2008
            </span>
          </Col>
        </GuideRow>
        <GuideRow>
          <Col xs lg="6" className="mb-2">
            <div className="h1">The Minister of Counterculture</div>
          </Col>
        </GuideRow>
        <GuideRow className="pb-5">
          <Col xs lg={6}>
            <p className="mb-1">
              Three decades after being exiled, he is invited to become Minister of Culture of Brazil,
              where he became a strong advocate of open-source solutions
              and advocated for what he called <i>free digital societies</i>.
              <br /><br />
              This uncommon characteristics alongside his dreadlocks at the time gave him
              the nickname of <b>Minister of Counterculture</b>.
            </p>
          </Col>
        </GuideRow>
      </TimelineContainer>
      <TimelineContainer className="kusama-launch">
        <GuideRow>
          <Col xs lg="6">
            <span className="badge rounded-pill bg-primary text-uppercase">
              2019
            </span>
          </Col>
        </GuideRow>
        <GuideRow>
          <Col xs lg="6" className="mb-2">
            <div className="h1">Kusama Network Launch</div>
          </Col>
        </GuideRow>
        <GuideRow className="pb-5">
          <Col xs lg={6}>
            <p className="mb-1">
              @TODO: Kusama Network, its relation to radical innovation and art, and censorship resistance
            </p>
          </Col>
        </GuideRow>
      </TimelineContainer>
      <TimelineContainer className="kusama-launch">
        <GuideRow>
          <Col xs lg="6">
            <span className="badge rounded-pill bg-primary text-uppercase">
              2020
            </span>
          </Col>
        </GuideRow>
        <GuideRow>
          <Col xs lg="6" className="mb-2">
            <div className="h1">Kusama Society Begins</div>
          </Col>
        </GuideRow>
        <GuideRow className="pb-5">
          <Col xs lg={6}>
            <p className="mb-1">
              @TODO: Kusama Society, Proof-of-Ink, the Alliance between humans and machine,
              Yayoi Kusama inspiration, self-obliteration
            </p>
          </Col>
        </GuideRow>
      </TimelineContainer>
      <TimelineContainer className="happiness mb-5">
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
            <p className="mb-1">
              Finally, our history converges to this unexpected partnership between Gilberto Gil and a digital society
              inspired by the Cyborg Manifesto and Yayoi&apos;s Kusama early work.
              <br /> <br />
              Through this project we celebrate Gilberto Gil&apos;s work
              making him immortal and uncensorable on his 80th birthday.
              <br /> <br />
              His song Futurível goes full circle and becomes a self-fulfulling prophecy,
              Gilberto Gil is &#34;being transmuted into energy.&#34;
              <br /> <br />
              We are an alliance between humans and machine because happiness is made of metal.
            </p>
          </Col>
        </GuideRow>
      </TimelineContainer>
    </Futurable>
  )
}

const GuideRow = styled(Container)`
  padding-left: 12px;
  padding-bottom: 20px;
`

const GuideTitleRow = styled(Container)`
  display: flex;
  padding-top: 10vh;
`

const GuideTitle = styled(Col)`
  font-size: 10vmin;
  color: white;
  font-weight: bolder;
  display: inline-block;
`
const GuideSubtitle = styled.div`
  font-size: 4.5vmin;
  color: white;
  font-weight: bold;
  display: inline-block;
`

const Futurable = styled.div`
  position: relative;
`

const TimelineContainer = styled(Container)`
  border-left: 2px solid grey;
`

const GilWireframeImg = styled.div`
  background: url(${GilWireframe});
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  position: fixed;
  height: 60vh;
  width: 60vh;
  right: 20vw;
  bottom: -5vh;
`

export { FuturivelPage }
