import type { BlockNumber } from '@polkadot/types/interfaces'
import { formatNumber } from '@polkadot/util'
import { useBlockTime } from '../hooks/useBlockTime'
import { useKusama } from '../kusama'

const BlockTime = ({ block }: { block: BlockNumber }) => {
  const { api } = useKusama()
  const [, time] = useBlockTime(block, api)

  return (<>
    <span>{time}</span>
    &nbsp;
    <span>(#{formatNumber(block)})</span>
  </>)
}

export { BlockTime }
