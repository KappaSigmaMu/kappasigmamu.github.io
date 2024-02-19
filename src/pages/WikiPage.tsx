import { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { MarkdownRenderer } from '../components/MarkdownRenderer'
import CanaryRed from '../static/grid-canary-red.png'

const WikiPage = () => {
  const [content, setContent] = useState('')

  useEffect(() => {
    fetch(`/wiki/Cyborg-Guide.md`)
      .then((response) => response.text())
      .then((text) => setContent(text))
      .catch((error) => console.error('Error fetching wiki content:', error))
  }, [])

  document.body.style.overflow = 'auto'

  return (
    <Guide>
      <Row>
        <CanaryImg src={CanaryRed} className="float-end" alt="Grid Canary Red" />
        <Col xs={12} className="px-0">
          <WikiTitle xs className="text-uppercase text-center d-flex align-items-center">
            Wiki
          </WikiTitle>
          <ScrollContainer>
            <MarkdownRenderer markdownText={content} />
          </ScrollContainer>
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

const WikiTitle = styled(Col)`
  font-size: 500%;
  color: white;
  font-weight: bolder;
`

const ScrollContainer = styled(Container)`
  position: relative;
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
  img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Optional: this will cover the area without distorting the ratio */
  }
  details {
    line-height: 20px;

    summary {
      b {
        color: ${(props) => props.theme.colors.secondary};
      }

      margin-top: 12px;
      margin-bottom: 3px;
    }
  }
}
`

const CanaryImg = styled.img`
  position: fixed;
  width: 500px;
  left: 50%;
  opacity: 0.5;
  right: unset;
  top: unset;
`

export { WikiPage }
