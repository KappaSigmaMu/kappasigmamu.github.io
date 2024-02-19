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
      <DataHeaderRow>
        <Col xs={1} className="text-center">
          #
        </Col>
        <Col xs={5} className="text-start">
          Wallet Hash
        </Col>
        <Col xs={2} className="text-start">
          Index
        </Col>
        <Col xs={2} className="text-start">
          Identity
        </Col>
        <Col xs={2} className="text-end"></Col>
      </DataHeaderRow>

      <DataRow>
        <Col xs={1} className="text-center">
          <Identicon value={head.toHuman()} size={32} theme={'polkadot'} />
        </Col>
        <Col xs={5} className="text-start text-truncate">
          {head.toHuman()}
        </Col>
        <Col xs={2} className="text-start text-truncate">
          <AccountIndex api={api!} accountId={head} />
        </Col>
        <Col xs={2} className="text-start text-truncate">
          <AccountIdentity api={api!} accountId={head} hideNotSet />
        </Col>
        <Col xs={2} className="text-end">
          <Badge pill bg="primary" className="me-2 p-2">
            Society Next Head
          </Badge>
        </Col>
      </DataRow>

      <Alert variant="warning" style={{ textAlign: 'center' }}>
        <b>This may change if new members are approved</b>
      </Alert>
    </>
  )
}

export { NextHeadPage }
