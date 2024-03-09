import { ApiPromise } from '@polkadot/api'
import Identicon from '@polkadot/react-identicon'
import { AccountId } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'
import { Col, Badge } from 'react-bootstrap'
import Alert from 'react-bootstrap/Alert'
import { AccountIdentity } from '../../../components/AccountIdentity'
import { AccountIndex } from '../../../components/AccountIndex'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { styled } from 'styled-components'

type NextHeadPageProps = {
  api: ApiPromise | null
}

const NextHeadPage = ({ api }: NextHeadPageProps): JSX.Element => {
  const society = api?.query?.society

  const [head, setNextHead] = useState<AccountId | null>(null)

  useEffect(() => {
    society?.nextHead().then((head) => {
      head.isSome && setNextHead(head.unwrap().who)
    })
  }, [society])

  return head === null ? (
    <LoadingSpinner />
  ) : (
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
          <Identicon value={head.toHuman()} size={32} theme={'polkadot'} />
        </Col>
        <Col lg={5} className="text-center text-lg-start text-truncate">
          {head.toHuman()}
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          <AccountIndex api={api!} accountId={head} />
        </Col>
        <Col lg={2} className="text-center text-lg-start text-truncate">
          <AccountIdentity api={api!} accountId={head} hideNotSet />
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
