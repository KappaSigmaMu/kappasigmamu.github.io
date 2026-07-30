import { MultiAddress } from '@polkadot-api/descriptors'
import { useEffect, useState } from 'react'
import { Spinner, Tab, Nav, Form, Button, InputGroup, FormControl } from 'react-bootstrap'
import styled from 'styled-components'
import { useAccount } from '@/account/AccountContext'
import { useAssetHub } from '@/chain/ChainProvider'
import { useSociety } from '@/chain/society/SocietyContext'
import { submitTx } from '@/chain/society/tx'
import type { ExtrinsicResult } from '@/chain/types'
import { FormatBalance } from '@/components/FormatBalance'
import { CurrentRound } from '@/components/rotation-bar/CurrentRound'
import { isValidAddress } from '@/helpers/validAccount'
import { toastByStatus } from '@/pages/explore/helpers'

type BidVouchProps = {
  handleResult: (result: ExtrinsicResult) => void
  dashboard?: boolean
  compact?: boolean
}
type OnStatusChangeProps = ExtrinsicResult

const parseKsm = (value: string): bigint => {
  const [whole = '0', fraction = ''] = value.trim().split('.')
  const decimals = fraction
    .replace(/[^0-9]/g, '')
    .slice(0, 12)
    .padEnd(12, '0')
  return BigInt(whole || '0') * 1_000_000_000_000n + BigInt(decimals || '0')
}

const BidVouch = ({ handleResult, dashboard = false, compact = false }: BidVouchProps) => {
  const { api } = useAssetHub()
  const { polkadotSigner, isSignerLoading } = useAccount()
  const potState = useSociety().info
  const [bidAmount, setBidAmount] = useState<bigint | null>(null)
  const [vouch, setVouch] = useState<{ address: string; value: bigint; tip: bigint } | null>(null)
  const [loading, setLoading] = useState(false)

  const onStatusChange = ({ loading: nextLoading, message, status }: OnStatusChangeProps) => {
    setLoading(Boolean(nextLoading))
    handleResult({ message, status })
  }

  useEffect(() => {
    if (!api || bidAmount === null) return
    void submitTx(api.tx.Society.bid({ value: bidAmount }), polkadotSigner, {
      finalizedText: 'Bid submitted successfully. You are now a Bidder!',
      onStatusChange
    })
    setBidAmount(null)
  }, [api, bidAmount, polkadotSigner])

  useEffect(() => {
    if (!api || !vouch) return
    void submitTx(
      api.tx.Society.vouch({ who: MultiAddress.Id(vouch.address), value: vouch.value, tip: vouch.tip }),
      polkadotSigner,
      { finalizedText: 'Vouch submitted successfully.', onStatusChange }
    )
    setVouch(null)
  }, [api, polkadotSigner, vouch])

  const handleBidSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBidAmount(parseKsm((event.currentTarget[0] as HTMLInputElement).value))
  }

  const handleVouchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const address = (event.currentTarget[0] as HTMLInputElement).value
    if (!isValidAddress(address)) {
      toastByStatus.error('The provided address is not a valid Kusama address.', { duration: 5000 })
      return
    }
    setVouch({
      address,
      value: parseKsm((event.currentTarget[1] as HTMLInputElement).value),
      tip: parseKsm((event.currentTarget[2] as HTMLInputElement).value)
    })
  }

  return (
    <Tab.Container defaultActiveKey="bid">
      <StyledNav variant="tabs" $dashboard={dashboard}>
        <Nav.Item>
          <Nav.Link eventKey="bid" data-test="bid-tab">
            Place Bid
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="vouch" data-test="vouch-tab">
            Vouch
          </Nav.Link>
        </Nav.Item>
      </StyledNav>
      <StyledTabContent $dashboard={dashboard}>
        <Tab.Pane eventKey="bid">
          <Form
            onSubmit={handleBidSubmit}
            className={dashboard ? 'd-flex flex-column' : 'd-flex flex-lg-column flex-row align-items-center parent'}
          >
            <Form.Group className={dashboard ? '' : 'me-3 me-lg-0'}>
              <StyledFormLabel $dashboard={dashboard}>Bid amount</StyledFormLabel>
              <StyledFormInput>
                <StyledFormControl
                  $dashboard={dashboard}
                  type="number"
                  step="0.01"
                  placeholder="0"
                  aria-label="Bid amount"
                  data-test="bid-amount-input"
                />
                <StyledInputGroupText $dashboard={dashboard}>KSM</StyledInputGroupText>
              </StyledFormInput>
            </Form.Group>
            <Button
              disabled={loading || isSignerLoading}
              variant="primary"
              type="submit"
              className={dashboard ? 'w-100 mt-4' : 'w-100 mt-0 mt-lg-3 child align-self-end'}
              data-test="submit-bid-button"
            >
              {loading || isSignerLoading ? <Spinner size="sm" animation="border" /> : 'Submit'}
            </Button>
          </Form>
          {!compact && (
            <>
              <hr />
              <div className="align-self-center" data-test="society-pot-value">
                <h6>
                  POT:{' '}
                  {potState.isLoading ? (
                    <Spinner size="sm" animation="border" />
                  ) : (
                    <FormatBalance balance={potState.data?.pot} />
                  )}
                </h6>
              </div>
              <hr />
              <div className="align-self-center">
                <CurrentRound />
              </div>
            </>
          )}
        </Tab.Pane>
        <Tab.Pane eventKey="vouch">
          <Form onSubmit={handleVouchSubmit}>
            <Form.Group className="mb-3">
              <StyledFormLabel $dashboard={dashboard}>Vouch for</StyledFormLabel>
              <StyledFormInput className="mb-3">
                <StyledFormControl
                  $dashboard={dashboard}
                  type="text"
                  placeholder="Address to vouch for"
                  aria-label="Address"
                  data-test="vouch-address-input"
                />
              </StyledFormInput>
            </Form.Group>
            <Form.Group className="mb-3">
              <StyledFormLabel $dashboard={dashboard}>Bid amount</StyledFormLabel>
              <StyledFormInput className="mb-3">
                <StyledFormControl
                  $dashboard={dashboard}
                  type="number"
                  step="0.01"
                  placeholder="0"
                  aria-label="Bid amount"
                  data-test="vouch-amount-input"
                />
                <StyledInputGroupText $dashboard={dashboard}>KSM</StyledInputGroupText>
              </StyledFormInput>
            </Form.Group>
            <Form.Group className="mb-3">
              <StyledFormLabel $dashboard={dashboard}>Tip amount</StyledFormLabel>
              <StyledFormInput className="mb-3">
                <StyledFormControl
                  $dashboard={dashboard}
                  type="number"
                  step="0.01"
                  placeholder="0"
                  aria-label="Tip amount"
                  data-test="vouch-tip-input"
                />
                <StyledInputGroupText $dashboard={dashboard}>KSM</StyledInputGroupText>
              </StyledFormInput>
            </Form.Group>
            <Button
              disabled={loading || isSignerLoading}
              variant="primary"
              type="submit"
              className="w-100"
              data-test="submit-vouch-button"
            >
              {loading || isSignerLoading ? <Spinner size="sm" animation="border" /> : 'Submit'}
            </Button>
            {!compact && <StyledButtonLabel className="text-muted">*Plus 0.0045 KSM fee</StyledButtonLabel>}
          </Form>
          {!compact && (
            <>
              <hr />
              <div className="align-self-center">
                <CurrentRound />
              </div>
            </>
          )}
        </Tab.Pane>
      </StyledTabContent>
    </Tab.Container>
  )
}

const StyledFormLabel = styled(Form.Label)<{ $dashboard: boolean }>`
  color: ${(props) => (props.$dashboard ? '#ced4da' : '#6c757d')};
`
const StyledFormControl = styled(FormControl)<{ $dashboard: boolean }>`
  border-color: #495057 transparent #495057 #495057;
  background-color: ${(props) => (props.$dashboard ? '#343a40' : 'black')};
  color: ${(props) => (props.$dashboard ? '#fff' : '#6c757d')};
  color-scheme: dark;

  &::placeholder {
    color: #495057;
    opacity: 1;
  }

  &:focus,
  &:active {
    border-color: #495057 transparent #495057 #495057;
    background-color: ${(props) => (props.$dashboard ? '#343a40' : 'black')};
    box-shadow: 0 0 0 0.15rem rgba(255, 0, 136, 0.45);
    color: #fff;
  }

  &::selection {
    background: #ff0088;
    color: #fff;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    box-shadow: 0 0 0 1000px ${(props) => (props.$dashboard ? '#343a40' : 'black')} inset;
    -webkit-text-fill-color: #fff;
    caret-color: #fff;
  }
`
const StyledButtonLabel = styled(Form.Text)`
  font-style: italic;
  font-size: 12px;
`
const StyledInputGroupText = styled(InputGroup.Text)<{ $dashboard: boolean }>`
  border-color: #495057 #495057 #495057 transparent;
  background-color: ${(props) => (props.$dashboard ? '#343a40' : 'black')};
  color: ${(props) => (props.$dashboard ? '#8b9298' : '#6c757d')};
`
const StyledFormInput = styled(InputGroup)`
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type='number'] {
    -moz-appearance: textfield;
  }
`
const StyledNav = styled(Nav)<{ $dashboard: boolean }>`
  border-top-right-radius: 6px;
  border-top-left-radius: 6px;
  border: none;
  .nav-link {
    color: #01ffff;
    border: none;
  }
  .nav-link.active {
    color: ${(props) => (props.$dashboard ? '#ff168f' : 'white')};
    background-color: ${(props) => (props.$dashboard ? 'transparent' : '#343a40')};
  }
  ${(props) =>
    props.$dashboard &&
    `
      border-bottom: 4px solid #495057;
      border-radius: 0;
      .nav-item { width: 50%; }
      .nav-link {
        width: 100%;
        padding: 14px 8px 10px;
        color: #ced4da;
        text-align: center;
      }
      .nav-link.active { border-bottom: 4px solid #ff168f; margin-bottom: -4px; }
    `}
`
const StyledTabContent = styled(Tab.Content)<{ $dashboard: boolean }>`
  border-bottom-right-radius: 6px;
  border-bottom-left-radius: 6px;
  background-color: ${(props) => (props.$dashboard ? 'transparent' : '#343a40')};
  padding: ${(props) => (props.$dashboard ? '18px 0 0' : '10% 7%')};
  @media (max-width: 992px) {
    padding: ${(props) => (props.$dashboard ? '14px 0 0' : '3% 3%')};
  }
`

export { BidVouch }
