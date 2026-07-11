import { useBlockTime } from '../hooks/useBlockTime'

const BlockTime = ({ block }: { block: number | bigint }) => {
  const [, time] = useBlockTime(block)
  return (
    <>
      <span>{time}</span>&nbsp;<span>(#{block.toString()})</span>
    </>
  )
}

export { BlockTime }
