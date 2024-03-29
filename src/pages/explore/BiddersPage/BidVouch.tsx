import { ApiPromise } from '@polkadot/api'
import { Balance } from '@polkadot/types/interfaces'
import { WalletAccount } from '@talismn/connect-wallets'
import BN from 'bn.js'
import { useState, useEffect } from 'react'
import { Spinner, Tab, Nav, Form, Button, InputGroup, FormControl } from 'react-bootstrap'
import styled from 'styled-components'
import { bid, vouch, BNtoNumber } from './helper'
import { FormatBalance } from '../../../components/FormatBalance'
import { CurrentRound } from '../../../components/rotation-bar/CurrentRound'
import { isValidAddress } from '../../../helpers/validAccount'
import { toastByStatus } from '../helpers'

type BidVouchProps = { api: ApiPromise; handleResult: any; activeAccount: WalletAccount | undefined }
type OnStatusChangeProps = { loading: boolean; message: string; status: string }

const ksmMultiplierWithDecimals = new BN(1e10)

const BidVouch = ({ api, handleResult, activeAccount }: BidVouchProps) => {
  const [bidAmount, setBidAmount] = useState<BN>(new BN(-1))
  const [pot, setPot] = useState<Balance>()
  const [vouchValue, setVouchValue] = useState<BN>(new BN(-1))
  const [vouchTip, setVouchTip] = useState<BN>(new BN(-1))
  const [vouchAddress, setVouchAddress] = useState<string>()
  const [loading, setLoading] = useState(false)

  const onStatusChange = ({ loading, message, status }: OnStatusChangeProps) => {
    setLoading(loading)
    handleResult({ message, status })
  }

  useEffect(() => {
    api.query.society.pot(setPot)

    if (BNtoNumber(bidAmount) >= 0) {
      const tx = api.tx.society.bid(bidAmount)
      bid(tx, api, activeAccount, onStatusChange)
    }
  }, [bidAmount, handleResult])

  useEffect(() => {
    if (vouchAddress && BNtoNumber(vouchTip) >= 0 && BNtoNumber(vouchValue) >= 0) {
      const tx = api.tx.society.vouch(vouchAddress, vouchValue, vouchTip)
      vouch(tx, api, activeAccount, onStatusChange)
    }
  }, [vouchAddress, vouchTip, vouchValue])

  const scaleInputValue = (value: string) => {
    const scaleFactor = 100
    return Math.floor(parseFloat(value) * scaleFactor)
  }

  const handleBidSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = (e.currentTarget[0] as HTMLInputElement).value
    const bidVal: BN = new BN(scaleInputValue(value))
    setBidAmount(bidVal.mul(ksmMultiplierWithDecimals))
  }

  const handleVouchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const address = (e.currentTarget[0] as HTMLInputElement).value
    if (!isValidAddress(address)) {
      toastByStatus['error']('The provided address is not a valid Kusama address.', {
        duration: 5000
      })
      return
    }

    const value: BN = new BN(scaleInputValue((e.currentTarget[1] as HTMLInputElement).value))
    const tip: BN = new BN(scaleInputValue((e.currentTarget[2] as HTMLInputElement).value))
    setVouchAddress(address)
    setVouchValue(value.mul(ksmMultiplierWithDecimals))
    setVouchTip(tip.mul(ksmMultiplierWithDecimals))
  }

  return (
    <Tab.Container defaultActiveKey="bid">
      <StyledNav variant="tabs">
        <Nav.Item>
          <Nav.Link eventKey="bid">Place Bid</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="vouch">Vouch</Nav.Link>
        </Nav.Item>
      </StyledNav>
      <StyledTabContent>
        <Tab.Pane eventKey="bid">
          <Form onSubmit={handleBidSubmit} className="d-flex flex-lg-column flex-row align-items-center parent">
            <Form.Group className="me-3 me-lg-0">
              <StyledFormLabel>Bid amount</StyledFormLabel>
              <StyledFormInput>
                <StyledFormControl type="number" step="0.01" placeholder="0" aria-label="Bid amount" />
                <StyledInputGroupText>KSM</StyledInputGroupText>
              </StyledFormInput>
            </Form.Group>
            <Button
              disabled={loading}
              variant="primary"
              type="submit"
              className="w-100 mt-0 mt-lg-3 child align-self-end"
            >
              {loading ? <Spinner size="sm" animation="border" /> : 'Submit'}
            </Button>
          </Form>
          <hr />
          <div className="align-self-center">
            <h6>POT: {<FormatBalance balance={pot!} />}</h6>
          </div>
          <hr />
          <div className="align-self-center">
            <CurrentRound />
          </div>
        </Tab.Pane>
        <Tab.Pane eventKey="vouch">
          <Form onSubmit={handleVouchSubmit}>
            <Form.Group className="mb-3">
              <StyledFormLabel>Vouch for</StyledFormLabel>
              <StyledFormInput className="mb-3">
                <StyledFormControl type="text" step="any" placeholder="Address to vouch for" aria-label="Address" />
              </StyledFormInput>
            </Form.Group>

            <Form.Group className="mb-3">
              <StyledFormLabel>Bid amount</StyledFormLabel>
              <StyledFormInput className="mb-3">
                <StyledFormControl type="number" step="0.01" placeholder="0" aria-label="Bid amount" />
                <StyledInputGroupText>KSM</StyledInputGroupText>
              </StyledFormInput>
            </Form.Group>
            <Form.Group className="mb-3">
              <StyledFormLabel>Tip amount</StyledFormLabel>
              <StyledFormInput className="mb-3">
                <StyledFormControl type="number" step="0.01" placeholder="0" aria-label="Tip amount" />
                <StyledInputGroupText>KSM</StyledInputGroupText>
              </StyledFormInput>
            </Form.Group>
            <Button disabled={loading} variant="primary" type="submit" className="w-100">
              {loading ? <Spinner size="sm" animation="border" /> : 'Submit'}
            </Button>
            <StyledButtonLabel className="text-muted">*Plus 0.0045 KSM fee</StyledButtonLabel>
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
  color: #6c757d;
`

const StyledFormControl = styled(FormControl)`
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
  input[type='number'] {
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
    background-color: #343a40;
  }
`

const StyledTabContent = styled(Tab.Content)`
  border-bottom-right-radius: 6px;
  border-bottom-left-radius: 6px;
  background-color: #343a40;
  padding: 10% 7%;

  @media (max-width: 992px) {
    padding: 3% 3%;
  }
`

export { BidVouch }
