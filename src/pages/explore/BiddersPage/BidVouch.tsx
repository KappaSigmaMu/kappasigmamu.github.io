import { web3FromAddress } from '@polkadot/extension-dapp'
import { useState, useEffect } from 'react'
import { Spinner, Tab, Nav, Form, Button, InputGroup, FormControl } from 'react-bootstrap'
import styled from 'styled-components'
import { CurrentRound } from '../../../components/rotation-bar/CurrentRound'
import { useKusama } from '../../../kusama'

type BidVouchProps = { handleResult: any, activeAccount: accountType, accounts: accountType[] }

const BidVouch = ({ handleResult, activeAccount, accounts } : BidVouchProps) => {
  const { api, apiState, keyring } = useKusama()
  const [bidAmount, setbidAmount] = useState(0)
  const [vouchValue, setVouchValue] = useState(0)
  const [vouchTip, setVouchTip] = useState(0)
  const [vouchAddress, setVouchAddress] = useState<string>()
  const [loading, setLoading] = useState(false)

  const apiReady = apiState === 'READY'

  useEffect(() => {
    const bid = async () => {
      const bid = api?.tx?.society?.bid(bidAmount)
      const injector = await web3FromAddress(activeAccount.address)

      bid?.signAndSend(activeAccount.address, { signer: injector.signer }, ({ status }) => {
        const _status = status.type.toString()
        let text

        if (_status === 'Finalized') {
          setLoading(false)
          text = 'Bid submitted successfully. You are now a Bidder'
        } else {
          setLoading(true)
          text = `Bid request sent. Waiting for response...`
        }

        handleResult(text)
      })
    }

    if (bidAmount > 0 && apiReady) bid()
  }, [bidAmount, handleResult])

  useEffect(() => {
    const vouch = async () => {
      const account = keyring.getAccount(activeAccount.address)
      const injector = await web3FromAddress(account.address)
      const vouch = api?.tx?.society?.vouch(account.address, vouchValue, vouchTip)

       vouch?.signAndSend(account.address, { signer: injector.signer }, ({ status }) => {
        const _status = status.type.toString()
        let text

        if (_status === 'Finalized') {
          setLoading(false)
          text = 'Vouch submitted successfully.'
        } else {
          setLoading(true)
          text = `Vouch request sent. Waiting for response...`
        }

        handleResult(text)
      })
    }

    (vouchAddress && vouchTip && vouchValue && apiReady) && vouch()
  }, [vouchAddress, vouchTip, vouchValue])

  const handleBidSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
    const bidVal = parseFloat((e.currentTarget[0] as HTMLInputElement).value)
    setbidAmount(bidVal)
    e.preventDefault()
  }

  const handleVouchSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
    const address = (e.currentTarget[0] as HTMLInputElement).value
    const value = parseFloat((e.currentTarget[1] as HTMLInputElement).value)
    const tip = parseFloat((e.currentTarget[2] as HTMLInputElement).value)
    setVouchAddress(address)
    setVouchValue(value)
    setVouchTip(tip)
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
            <Form.Group className="mb-3">
              <StyledFormLabel style={{ color: '#6c757d' }}>Bid amount</StyledFormLabel>
              <StyledFormInput className="mb-3">
                <StyledForm
                  type="number"
                  step="any"
                  placeholder="0.0000"
                  aria-label="Bid amount"
                />
                <StyledInputGroupText>KSM</StyledInputGroupText>
              </StyledFormInput>
            </Form.Group>
            <Button disabled={loading} variant="primary" type="submit" className="w-100">
              {loading ? <Spinner size="sm" animation="border" /> : 'Submit'}
            </Button>
            <StyledButtonLabel className="text-muted">
              *Plus 0.0045 KSM fee
            </StyledButtonLabel>
          </Form>
          <hr />
          <div className="align-self-center">
            <CurrentRound />
          </div>
        </Tab.Pane>
        <Tab.Pane eventKey="vouch">
          <Form onSubmit={handleVouchSubmit}>
            <Form.Group className="mb-3">
              <StyledFormLabel style={{ color: '#6c757d' }}>Vouch for</StyledFormLabel>
              <StyledSelectForm aria-label="Default select example">
                <option>Select an account</option>
                {accounts.map((account, key) => <option key={key} value={account.address}>{account.name}</option>)}
              </StyledSelectForm>
            </Form.Group>

            <Form.Group className="mb-3">
              <StyledFormLabel style={{ color: '#6c757d' }}>Bid amount</StyledFormLabel>
              <StyledFormInput className="mb-3">
                <StyledForm
                  type="number"
                  step="any"
                  placeholder="0.0000"
                  aria-label="Bid amount"
                />
                <StyledInputGroupText>KSM</StyledInputGroupText>
              </StyledFormInput>
            </Form.Group>
            <Form.Group className="mb-3">
              <StyledFormLabel style={{ color: '#6c757d' }}>Tip amount</StyledFormLabel>
              <StyledFormInput className="mb-3">
                <StyledForm
                  type="number"
                  step="any"
                  placeholder="0.0000"
                  aria-label="Tip amount"
                />
                <StyledInputGroupText>KSM</StyledInputGroupText>
              </StyledFormInput>
            </Form.Group>
            <Button disabled={loading} variant="primary" type="submit" className="w-100">
              {loading ? <Spinner size="sm" animation="border" /> : 'Submit'}
            </Button>
            <StyledButtonLabel className="text-muted">
              *Plus 0.0045 KSM fee
            </StyledButtonLabel>
          </Form>
          <hr />
          <div className="align-self-center">
            <CurrentRound />
          </div>
        </Tab.Pane>
      </StyledTabContent>
    </Tab.Container>
  )
}

const StyledFormLabel = styled(Form.Label)`
  color: #6c757d
`

const StyledSelectForm = styled(Form.Select)`
  border-color: #495057 transparent #495057 #495057;
  background-color: black;
  color: #6c757d;

  :focus {
    border-color: #495057 transparent #495057 #495057;
    background-color: black;
    color: #6c757d;
  }
`

const StyledForm = styled(FormControl)`
  border-color: #495057 transparent #495057 #495057;
  background-color: black;
  color: #6c757d;

  :focus {
    border-color: #495057 transparent #495057 #495057;
    background-color: black;
    color: #6c757d;
  }
`

const StyledButtonLabel = styled(Form.Text)`
  font-style: 'italic';
  font-size: '12px';
`

const StyledInputGroupText = styled(InputGroup.Text)`
  border-color: #495057 #495057 #495057 transparent;
  background-color: black;
  color: #6c757d;
`

const StyledFormInput = styled(InputGroup)`
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
