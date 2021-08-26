import { useEffect, useState } from 'react'
import { useBlockTime } from '../hooks/useBlockTime'
import { useSubstrate } from '../substrate'

function Timer() {
  const { api } = useSubstrate()
  const [currentBlock, setCurrentBlock] = useState<number>(0)
  const [rotationPeriod, setRotationPeriod] = useState<number>(0)

  const periodBlocksDone = currentBlock % rotationPeriod
  const periodBlocksLeft = rotationPeriod - periodBlocksDone
  const percentageDone = 100 - (periodBlocksLeft * 100) / rotationPeriod

  const [, periodTime] = useBlockTime(rotationPeriod, api)
  const [, periodTimeLeft] = useBlockTime(periodBlocksLeft, api)

  useEffect(() => {
    if (api) {
      const rotationPeriod = api.consts.society.rotationPeriod.toNumber()
      api.derive.chain.bestNumber((block) => {
        setCurrentBlock(block.toNumber())
      })
      setRotationPeriod(rotationPeriod)
    }
  }, [])

  return (
    <>
      <div>Rotation period: {rotationPeriod}</div>
      <div>Current block: {currentBlock}</div>
      <div>Rotation Period Time: {periodTime}</div>
      <div>Rotation Time Left: {periodTimeLeft}</div>
      <div>Percentage: {percentageDone.toFixed()}%</div>
    </>
  )
}

export { Timer }
