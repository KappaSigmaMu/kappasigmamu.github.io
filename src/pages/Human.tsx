import { Button, Container, Row, Col, Badge } from 'react-bootstrap'
import styled from 'styled-components'
import { Navbar } from '../components/Navbar'

const Human = ({
  setActiveAccount,
  activeAccount,
}: {
  setActiveAccount: (activeAccount: string) => void
  activeAccount: string
}): JSX.Element => {
  return (
    <>
      <Navbar
        showBrandIcon
        showGalleryButton
        showAccount
        setActiveAccount={setActiveAccount}
        activeAccount={activeAccount}
      />
      <StyledDiv>
        <Container>
          <Row>
            <Col sm={3}>
              <Badge pill>
                Level 1
              </Badge>
              <UnderlinedH1>Human</UnderlinedH1>
            </Col>
            <Col sm={4}>
              <StyledP>Level Notification</StyledP>
              <MarginH5>You are IN the society;<br/>
                You are NOT a member;<br/>
                You CAN&apos;T vote;<br/>
                You CAN VIEW the gallery.
              </MarginH5>
            </Col>
            <Col sm={5}>
              <StyledP>Next Step</StyledP>
              <MarginH5>To become a Candidate you need to level up;<br/>To level up you must first Submit a Bid.</MarginH5>
              <MarginButton variant="outline-grey-dark">Bid Rules</MarginButton>
              <Button>Submit a Bid</Button>
            </Col>
          </Row>
        </Container>
      </StyledDiv>
    </>
  )
}

const UnderlinedH1 = styled.h1`
  text-decoration: underline;
`

const MarginH5 = styled.h5`
  margin-bottom: 24px;
`

const StyledP = styled.p`
  color: ${(props) => props.theme.colors.greyDark};
`

const MarginButton = styled(Button)`
  margin-right: 16px;
`

const StyledDiv = styled.div`
  height: 88.1vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export { Human }
