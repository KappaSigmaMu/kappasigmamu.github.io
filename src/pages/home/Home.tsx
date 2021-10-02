import { Vec } from '@polkadot/types'
import { AccountId32 } from '@polkadot/types/interfaces'
import { PalletSocietyBid } from '@polkadot/types/lookup'
import { useEffect, useState } from 'react'
import { Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import { CurrentRoundRow } from '../../components/CurrentRoundRow'
import { Level } from '../../components/Level'
import { LevelNotification } from '../../components/LevelNotification'
import { NextStep } from '../../components/NextStep'
import { useSubstrate } from '../../substrate'
import { useAccount } from '../../account/AccountContext'

const Home = () => {
  const { api } = useSubstrate()
  const { activeAccount, level } = useAccount()

  return (
    <>
      <StyledDiv>
        <Container>
          <Row>
            <Level />
            <LevelNotification />
            <NextStep />
          </Row>
        </Container>
      </StyledDiv>
      <CurrentRoundRow />
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
