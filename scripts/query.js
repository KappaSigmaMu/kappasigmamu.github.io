import { ApiPromise, WsProvider } from '@polkadot/api'
import { createWriteStream } from 'fs'
import { join } from 'path'

async function processBlock(api, blockNumber, outputStream) {
  const hash = await api.rpc.chain.getBlockHash(blockNumber)
  const apiAt = await api.at(hash)

  if (!apiAt.query.society) {
    return []
  }

  const blockTimestamp = (await api.query.timestamp.now.at(hash)).toJSON()
  const currentMembers = new Set((await apiAt.query.society.members()).map((member) => member.toString()))

  console.info(`Block ${blockNumber} (${new Date(blockTimestamp).toISOString()}):`, currentMembers)

  return Array.from(currentMembers).map((member) => ({ blockNumber, blockTimestamp, member }))
}

async function findNewMemberJoinBlock(api, startBlock, endBlock, batchSize, outputStream) {
  let previousMembers = new Set()
  let totalBlocksProcessed = 0
  const startTime = Date.now() // Start time for performance measurement

  for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber += batchSize) {
    const endOfBatch = Math.min(blockNumber + batchSize - 1, endBlock)
    const blockRange = Array.from({ length: endOfBatch - blockNumber + 1 }, (_, i) => blockNumber + i)

    totalBlocksProcessed += endOfBatch - blockNumber + 1 // Update total blocks processed

    const results = await Promise.all(blockRange.map((bn) => processBlock(api, bn, outputStream)))
    for (const blockResults of results) {
      for (const { blockNumber, blockTimestamp, member } of blockResults) {
        if (!previousMembers.has(member)) {
          const data = `New member joined at block ${blockNumber} (${new Date(
            blockTimestamp
          ).toISOString()}): ${member}\n`
          outputStream.write(data)
          console.info(data)
        }
        previousMembers.add(member)
      }
    }

    const hash = await api.rpc.chain.getBlockHash(blockNumber)
    const apiAt = await api.at(hash)

    const endTime = Date.now() // End time for performance measurement
    const durationSeconds = (endTime - startTime) / 1000
    const blocksPerSecond = totalBlocksProcessed / durationSeconds

    console.info(
      `Processed ${totalBlocksProcessed} blocks in ${durationSeconds.toFixed(2)} seconds (${blocksPerSecond.toFixed(
        2
      )} blocks/second)`
    )

    const skipBlocks = await apiAt.consts.society.rotationPeriod
    blockNumber += skipBlocks.toNumber() - 10
    console.info(`Skipping to block ${blockNumber}`)
  }
}

async function main() {
  console.log = function () {}
  console.debug = function () {}
  console.warn = function () {}

  const provider = new WsProvider('wss://rpc.ibp.network/kusama')
  const api = await ApiPromise.create({ provider })

  const outputFile = join('.', 'new_members.txt')
  const outputStream = createWriteStream(outputFile, { flags: 'a' })

  const startBlock = 863995
  const endBlock = 20346515
  const batchSize = 20

  await findNewMemberJoinBlock(api, startBlock, endBlock, batchSize, outputStream)

  outputStream.end()
}

main().catch(console.error)
