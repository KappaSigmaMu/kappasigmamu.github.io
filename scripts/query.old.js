import { ApiPromise, WsProvider } from '@polkadot/api'

async function processBlock(api, blockNumber) {
  try {
    const hash = await api.rpc.chain.getBlockHash(blockNumber)
    const apiAt = await api.at(hash)

    console.log(`Block ${blockNumber} hash: ${hash}`)

    if (!apiAt.query.society) {
      console.log(`Society module not available at block ${blockNumber}`)
      return
    }

    const blockTimestamp = (await api.query.timestamp.now.at(hash)).toJSON()
    const currentMembers = new Set((await apiAt.query.society.members()).map((member) => member.toString()))

    console.log(`Block ${blockNumber} (${new Date(blockTimestamp).toISOString()}):`, currentMembers)
  } catch (error) {
    console.error(`Error processing block ${blockNumber}:`, error)
  }
}

async function querySocietyMembers() {
  const provider = new WsProvider('wss://rpc.ibp.network/kusama')
  const api = await ApiPromise.create({ provider })

  // Society genesis block: 653183
  // Society founded block: 696507
  // Society non-founder first member: 864000
  // Society V2: 20346515
  const latestBlock = await api.rpc.chain.getHeader()
  const startBlock = 6385140
  const endBlock = latestBlock.number.toNumber()

  const MAX_CONCURRENT_REQUESTS = 1
  const promises = []

  for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
    promises.push(processBlock(api, blockNumber))

    if (promises.length >= MAX_CONCURRENT_REQUESTS) {
      await Promise.all(promises)
      promises.length = 0
    }
  }

  await Promise.all(promises)
}

querySocietyMembers().catch(console.error)
