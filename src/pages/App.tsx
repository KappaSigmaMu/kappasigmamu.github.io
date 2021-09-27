import React, { useState } from 'react'
import { Container } from 'react-bootstrap'
import { Switch, Route } from 'react-router-dom'
import styled, { ThemeProvider } from 'styled-components'
import { GlobalStyle } from '../styles/globalStyle'
import { Theme } from '../styles/Theme'
import { SubstrateContextProvider, useSubstrate } from '../substrate'
import { CyborgGuide } from './CyborgGuide'
import { Home } from './Home'
import { Welcome } from './Welcome'
import { Human } from './Human'

function Main() {
  const { apiState, apiError } = useSubstrate()
  const [activeAccount, setActiveAccount] = useState<string>('')

  const loader = (text: string) => {
    return <p>{text}</p>
  }

  if (apiState === 'ERROR') return loader(`${JSON.stringify(apiError, null, 4)}`)
  if (apiState !== 'READY') return loader('Connecting')

  return (
    <StyledMain fluid>
      <Switch>
        <Route exact path="/">
          <Home activeAccount={activeAccount} setActiveAccount={setActiveAccount} />
        </Route>
        <Route path="/cyborg-guide">
          <CyborgGuide />
        </Route>
        <Route path="/welcome">
          <Welcome activeAccount={activeAccount} setActiveAccount={setActiveAccount} />
        </Route>
        <Route path="/human">
          <Human activeAccount={activeAccount} setActiveAccount={setActiveAccount} />
        </Route>
      </Switch>
    </StyledMain>
  )
}

function App() {
  return (
    <SubstrateContextProvider>
      <ThemeProvider theme={Theme}>
        <Main />
      </ThemeProvider>
    </SubstrateContextProvider>
  )
}

const StyledMain = styled(Container)`
  background-color: ${(props) => props.theme.darkBg};
`

export { App }
