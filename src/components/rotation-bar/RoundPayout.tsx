import { Col, Row } from 'react-bootstrap'
import { useAssetHub } from '../../chain/ChainProvider'
import { useChainQuery } from '../../chain/hooks'
import { getSocietyInfo } from '../../chain/society/queries'
import { FormatBalance } from '../FormatBalance'

const RoundPayout = () => {
  const { api } = useAssetHub()
  const { data: info } = useChainQuery(() => (api ? getSocietyInfo(api) : undefined), [api])
  return <><Row className="mb-3"><Col><h4>Round Payout</h4></Col></Row><Row><Col><FormatBalance balance={info?.pot} /></Col></Row></>
}

export { RoundPayout }
