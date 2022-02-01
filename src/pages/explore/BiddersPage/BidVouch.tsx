import { useState, useEffect } from 'react'
import { web3FromAddress, web3FromSource } from '@polkadot/extension-dapp'
import { Tab, Nav, Form, Button, InputGroup, FormControl } from 'react-bootstrap'
import styled from 'styled-components'

import { CurrentRound } from '../../../components/rotation-bar/CurrentRound'
import { useKusama } from '../../../kusama'

const BidVouch = () => {
  const { api, keyring } = useKusama()
  const [bidAmount, setbidAmount] = useState(0)

  useEffect(() => {
    const bid = async () => {
      const bid = api?.tx?.society?.bid(bidAmount)

      const injected = await web3FromSource(keyring.getAccounts()[9].meta.source)

      console.log(injected.signer)
    }

    if (bidAmount > 0) bid()
  }, [bidAmount])

  const handleBidSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
    const bidVal = parseFloat((e.currentTarget[0] as HTMLInputElement).value)
    setbidAmount(bidVal)
    e.preventDefault()
  }

  return (
    <Tab.Container defaultActiveKey="bid">
      <StyledNav variant='tabs'>
        <Nav.Item>
          <Nav.Link eventKey="bid">Place Bid</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="vouch">Vouch</Nav.Link>
        </Nav.Item>
      </StyledNav>
      <StyledTabContent>
        <Tab.Pane eventKey="bid">
          <Form onSubmit={handleBidSubmit}>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label style={{ color: '#6c757d' }}>Bid amount</Form.Label>
              <StyleFormInput className="mb-3">
                <FormControl
                  type="number"
                  step="any"
                  style={{ borderColor: '#495057 transparent #495057 #495057', backgroundColor: 'black', color: '#6c757d' }}
                  placeholder="0.0000"
                  aria-label="Bid amount"
                />

              <InputGroup.Text style={{ borderColor: '#495057 #495057 #495057 transparent', backgroundColor: 'black', color: '#6c757d'}}>KSM</InputGroup.Text>
            </StyleFormInput>
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">
            Submit
          </Button>
          <Form.Text className="text-muted" style={{ fontStyle: 'italic', fontSize: '12px' }}>
            *Plus 0.0045 KSM fee
          </Form.Text>
        </Form>

        <hr />

        <div className="align-self-center">
          <CurrentRound />
        </div>
      </Tab.Pane>
      <Tab.Pane eventKey="vouch">
        Vouch
      </Tab.Pane>
    </StyledTabContent>
  </Tab.Container>
)
}

const StyleFormInput = styled(InputGroup)`
  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type=number] {
    -moz-appearance: textfield;
  }
`

const StyledNav = styled(Nav)`
  border-top-right-radius: 6px;
  border-top-left-radius: 6px;
  border: none;

  .nav-link {
    color: #01ffff;
    border: none;
  }

  .nav-link.active {
    color: white;
    background-color: #343A40;
  }
`

const StyledTabContent = styled(Tab.Content)`
  border-bottom-right-radius: 6px;
  border-bottom-left-radius: 6px;
  background-color: #343A40;
  padding: 10% 7%;
`

export { BidVouch }

