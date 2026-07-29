import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { MarkdownRenderer } from '../components/MarkdownRenderer'
import CanaryRed from '../static/grid-canary-red.png'

const WikiPage = () => {
  const [content, setContent] = useState('')

  useEffect(() => {
    let cancelled = false

    fetch('/wiki/Cyborg-Guide.md')
      .then((response) => response.text())
      .then((text) => {
        if (!cancelled) setContent(text)
      })
      .catch((error) => {
        if (!cancelled) console.error('Error fetching wiki content:', error)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <WikiMain>
      <WikiFrame>
        <TitleBlock>
          <h1>Wiki</h1>
        </TitleBlock>
        <CanaryImg src={CanaryRed} alt="" aria-hidden="true" />
        <Article>
          <MarkdownRenderer markdownText={content} />
        </Article>
      </WikiFrame>
    </WikiMain>
  )
}

const WikiMain = styled.main`
  min-height: calc(100vh - 64px);
  overflow-x: clip;
  background: #212529;

  @media (max-width: 991.98px) {
    min-height: calc(100vh - 56px);
  }
`

const WikiFrame = styled.div`
  position: relative;
  width: calc(100% - 48px);
  max-width: 1020px;
  margin: 0 auto;
  padding: 72px 0 96px;

  @media (max-width: 767.98px) {
    width: auto;
    margin: 0;
    padding: 52px 18px 72px;
  }
`

const TitleBlock = styled.header`
  position: relative;
  z-index: 2;
  padding-bottom: 16px;
  border-bottom: 2px solid #454a4f;
  margin-bottom: 40px;

  h1 {
    margin: 0;
    color: #fff;
    font-size: 36px;
    font-weight: 700;
    line-height: 1.15;
    text-transform: uppercase;
  }

  @media (max-width: 767.98px) {
    padding-bottom: 20px;
    margin-bottom: 20px;
    text-align: center;
  }
`

const CanaryImg = styled.img`
  position: fixed;
  z-index: 0;
  top: clamp(220px, 32vh, 320px);
  right: max(calc((100vw - 1020px) / 2 - 210px), -210px);
  width: 500px;
  height: 500px;
  object-fit: contain;
  pointer-events: none;
  user-select: none;

  @media (max-width: 767.98px) {
    top: clamp(180px, 30vh, 250px);
    right: -82px;
    width: 390px;
    height: 390px;
    opacity: 0.28;
  }
`

const Article = styled.article`
  position: relative;
  z-index: 1;
  width: min(100%, 660px);
  min-width: 0;
  color: #d2d4d5;
  font-size: 16px;
  line-height: 1.5;

  p,
  li,
  details {
    color: #d2d4d5;
  }

  p {
    margin: 0 0 22px;
  }

  h1 {
    margin: 38px 0 12px;
    color: #fff;
    font-size: 30px;
    font-weight: 700;
    line-height: 1.2;
  }

  ul,
  ol {
    margin: 0 0 24px;
    padding-left: 22px;
  }

  li::marker {
    color: #01ffff;
  }

  a {
    color: #01ffff;
    text-decoration: none;
    overflow-wrap: anywhere;

    &:hover,
    &:focus-visible {
      color: #fff;
      text-decoration: underline;
    }
  }

  strong {
    color: #fff;
    font-weight: 700;
  }

  > div > ul:first-child {
    margin-bottom: 48px;

    li {
      margin-bottom: 2px;
    }
  }

  h1[id='faq'] {
    margin-bottom: 4px;
  }

  details {
    border-bottom: 1px solid #a4a9ad;
    line-height: 1.5;
  }

  summary {
    position: relative;
    display: flex;
    min-height: 42px;
    padding: 10px 30px 10px 0;
    align-items: center;
    color: #01ffff;
    cursor: pointer;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }

    &::after {
      position: absolute;
      top: 14px;
      right: 5px;
      width: 9px;
      height: 9px;
      border-right: 2px solid #fff;
      border-bottom: 2px solid #fff;
      content: '';
      transform: rotate(45deg);
      transition: transform 140ms ease, top 140ms ease;
    }

    b {
      color: inherit;
    }
  }

  details[open] {
    padding-bottom: 12px;

    summary::after {
      top: 18px;
      transform: rotate(225deg);
    }
  }

  h1[id='links'] + ul {
    margin-bottom: 0;
  }

  @media (max-width: 767.98px) {
    width: 100%;
    font-size: 16px;
    line-height: 1.52;
    text-shadow: 1px 1px 2px #000;

    h1 {
      margin-top: 36px;
      font-size: 28px;
    }

    > div > ul:first-child {
      margin-bottom: 52px;
    }

    details {
      font-size: 14px;
      text-shadow: none;
    }

    summary {
      min-height: 44px;
      padding-top: 10px;
      padding-bottom: 10px;
    }
  }
`

export { WikiPage }
