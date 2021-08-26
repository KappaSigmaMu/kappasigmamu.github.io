import React, { useState } from 'react'
import { Container } from 'react-bootstrap'
import { Switch, Route } from 'react-router-dom'
import { SubstrateContextProvider, useSubstrate } from '../substrate'
import { About } from './About'
import { Blog } from './Blog'
import { CyborgJourney } from './CyborgJourney'
import { Home } from './Home'

function Main() {
  const { apiState, apiError } = useSubstrate()
  const [account, setAccount] = useState('')

  const loader = (text: string) => {
    return <p>{text}</p>
  }

  if (apiState === 'ERROR')
    return loader(`${JSON.stringify(apiError, null, 4)}`)
  if (apiState !== 'READY') return loader('Connecting')

  return (
    <Container fluid>
      <Switch>
        <Route exact path="/">
          <Home account={account} setAccount={setAccount} />
        </Route>
        <Route path="/about">
          <About />
        </Route>
        <Route path="/blog">
          <Blog />
        </Route>
        <Route path="/cyborg-guide">
          <CyborgJourney />
        </Route>
      </Switch>
    </Container>
  )
}

function App() {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  )
}

export { App }
