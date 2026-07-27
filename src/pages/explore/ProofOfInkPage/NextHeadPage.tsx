import { Badge, Col } from 'react-bootstrap'
import Alert from 'react-bootstrap/Alert'
import styled from 'styled-components'
import { useAssetHub } from '../../../chain/ChainProvider'
import { useChainQuery } from '../../../chain/hooks'
import { AccountIdentity } from '../../../components/AccountIdentity'
import { AccountIndex } from '../../../components/AccountIndex'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { ChainError } from '../components/ChainError'
import { Identicon } from '../components/Identicon'
import { LoadingSpinner } from '../components/LoadingSpinner'

const NextHeadPage = (): JSX.Element => {
  const { api } = useAssetHub()
  const state = useChainQuery(() => api?.query.Society.NextHead.getValue(), [api])
  const head = state.data?.who
  if (state.error) return <ChainError error={state.error} onRetry={state.refetch} />
  if (!head) return <LoadingSpinner />
  return (
    <>
      <DataHeaderRow className="d-none d-lg-flex text-center">
        <Col lg={1} className="text-center">
          #
        </Col>
        <Col lg={5} className="text-center text-lg-start">
          Wallet Hash
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          Index
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          Identity
        </Col>
        <Col lg={2}></Col>
      </DataHeaderRow>
      <StyledDataRow>
        <Col lg={1} className="text-center">
          <Identicon value={head} size={32} theme="polkadot" />
        </Col>
        <Col lg={5} className="text-center text-lg-start text-truncate">
          {head}
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          <AccountIndex accountId={head} />
        </Col>
        <Col lg={2} className="text-center text-lg-start text-truncate">
          <AccountIdentity accountId={head} hideNotSet />
        </Col>
        <Col lg={2} className="text-center text-lg-end">
          <Badge pill bg="primary" className="me-2 p-2">
            Society Next Head
          </Badge>
        </Col>
      </StyledDataRow>
      <Alert variant="warning" style={{ textAlign: 'center' }}>
        <b>This may change if new members are approved</b>
      </Alert>
    </>
  )
}
const StyledDataRow = styled(DataRow)`
  @media (max-width: 992px) {
    padding-block: 12px;
    margin-inline: 2px;
  }
`
export { NextHeadPage }
