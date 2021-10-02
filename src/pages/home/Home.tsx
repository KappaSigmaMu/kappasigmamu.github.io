import { Vec } from '@polkadot/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import { PalletSocietyBid } from '@polkadot/types/lookup'
import { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { CurrentRoundRow } from '../../components/CurrentRoundRow'
import { Level } from '../../components/Level'
import { LevelNotification } from '../../components/LevelNotification'
import { NextStep } from '../../components/NextStep'
import { useSubstrate } from '../../substrate'

const Home = ({ activeAccount }: { activeAccount: string }): JSX.Element => {
  const { api } = useSubstrate()
  const [, setLevel] = useState('human')

  useEffect(() => {
    const setLevelCheckingAccounts = (accounts: AccountId32[], level: string) => {
      accounts.forEach((account: AccountId32) => {
        if (account.toString() === activeAccount) {
          setLevel(level)
        }
      })
    }

    if (api) {
      api.query.society.bids().then((response: Vec<PalletSocietyBid>) => {
        setLevelCheckingAccounts(response.map(account => account.who), "bidder")
      })

      api.query.society.candidates().then((response: Vec<PalletSocietyBid>) => {
        setLevelCheckingAccounts(response.map(account => account.who), "candidate")
      })

      api.query.society.members().then((response: Vec<AccountId32>) => {
        setLevelCheckingAccounts(response, "cyborg")
      })
    }
  }, [activeAccount])

  return (
    <>
      <StyledDiv>
        <Container>
          <Row>
            <Col sm={3}>
              <Level />
            </Col>
            <Col sm={4}>
              <LevelNotification />
            </Col>
            <Col sm={5}>
              <NextStep />
            </Col>
          </Row>
        </Container>
      </StyledDiv>
      <CurrentRoundRow currentAccount={activeAccount} />
    </>
  )
}

const StyledDiv = styled.div`
  height: 88.1vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export { Home }
