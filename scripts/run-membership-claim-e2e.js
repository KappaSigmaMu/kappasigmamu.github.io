const { spawn, spawnSync, execSync } = require('child_process')
const { readFileSync, writeFileSync } = require('fs')

const CHOPSTICKS_URL = 'http://localhost:8000'
const READY_TIMEOUT_MS = 180000
const VOTING_PERIOD_BLOCK = 18280000

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const killChopsticks = () => {
  try {
    execSync("pkill -f 'acala-network/chopsticks' || true", { stdio: 'ignore' })
    execSync('lsof -ti:8000 | xargs kill -9 2>/dev/null || true', { stdio: 'ignore' })
  } catch {
    // best effort
  }
}

const startChopsticks = () => {
  execSync('rm -f db.sqlite db.sqlite-shm db.sqlite-wal', { stdio: 'ignore' })
  const config = readFileSync('config/kusama.yml', 'utf8')
  writeFileSync('config/kusama-tmp.yml', config.replace(/^block:\s*.+$/m, `block: ${VOTING_PERIOD_BLOCK}`))
  const child = spawn('npx', ['@acala-network/chopsticks@1.4.2', '--config=config/kusama-tmp.yml'], {
    detached: true,
    stdio: 'ignore',
  })
  child.unref()
  return child
}

const waitForChopsticks = async () => {
  const startedAt = Date.now()
  while (Date.now() - startedAt < READY_TIMEOUT_MS) {
    try {
      const res = await fetch(CHOPSTICKS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'chain_getHeader', params: [] }),
      })
      const data = await res.json()
      if (data.result) return
    } catch {
      // not ready yet
    }
    await sleep(2000)
  }
  throw new Error('Chopsticks failed to become ready')
}

const main = async () => {
  killChopsticks()
  await sleep(1000)
  startChopsticks()
  await waitForChopsticks()

  const result = spawnSync(
    'start-server-and-test',
    [
      'start:test:ready',
      'http://localhost:3000',
      'cypress run --spec cypress/e2e/membership-claim.cy.ts --config video=false',
    ],
    { stdio: 'inherit' }
  )

  killChopsticks()
  process.exit(result.status ?? 1)
}

main().catch((error) => {
  console.error(error)
  killChopsticks()
  process.exit(1)
})
