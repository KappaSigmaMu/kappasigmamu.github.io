const { spawnSync } = require('child_process')
const { existsSync, readFileSync } = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const FAILED_TESTS_FILE = path.join(ROOT, 'cypress/.cache/failed-tests.json')

const SUITES = {
  smoke: 'cypress/e2e/smoke.cy.ts',
  wallet: 'cypress/e2e/wallet-connection.cy.ts',
  bidding: 'cypress/e2e/bidding.cy.ts',
  payouts: 'cypress/e2e/payouts.cy.ts',
  'candidate-voting': 'cypress/e2e/candidate-voting.cy.ts',
  members: 'cypress/e2e/members.cy.ts',
  'membership-claim': 'cypress/e2e/membership-claim.cy.ts',
  'user-journeys': 'cypress/e2e/user-journeys.cy.ts',
  'error-handling': 'cypress/e2e/error-handling.cy.ts',
  suspended: 'cypress/e2e/suspended.cy.ts',
}

const SUITE_ENV = {
  'membership-claim': { KUSAMA_BLOCK_NUMBER: '18280000' },
}

function parseArgs(argv) {
  const flags = new Set(['--failed', '--headed'])
  const positional = []
  let failed = false
  let headed = false

  for (const arg of argv) {
    if (arg === '--failed') failed = true
    else if (arg === '--headed') headed = true
    else if (flags.has(arg)) {
      // reserved for future flags
    } else positional.push(arg)
  }

  return { positional, failed, headed }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function loadFailedTests(spec) {
  if (!existsSync(FAILED_TESTS_FILE)) {
    console.error(`No failed-test cache at ${FAILED_TESTS_FILE}. Run the suite first without --failed.`)
    process.exit(1)
  }

  let failedTests
  try {
    failedTests = JSON.parse(readFileSync(FAILED_TESTS_FILE, 'utf8'))
  } catch (error) {
    console.error(`Could not read failed-test cache: ${(error).message}`)
    process.exit(1)
  }

  if (!Array.isArray(failedTests) || failedTests.length === 0) {
    console.error('No failed tests recorded from the last run.')
    process.exit(1)
  }

  if (spec) {
    failedTests = failedTests.filter((entry) => entry.spec === spec)
    if (failedTests.length === 0) {
      console.error(`No failed tests recorded for ${spec}.`)
      process.exit(1)
    }
  }

  return failedTests
}

function buildGrepPattern(titles) {
  const uniqueTitles = [...new Set(titles)]
  if (uniqueTitles.length === 1) return escapeRegex(uniqueTitles[0])
  return uniqueTitles.map(escapeRegex).join('|')
}

function buildCypressCommand({ mode, spec, grep, headed }) {
  const parts = []

  if (mode === 'open') {
    parts.push('cypress open')
  } else {
    parts.push('cypress run')
    if (headed) parts.push('--headed')
  }

  if (spec) {
    parts.push(`--spec ${spec}`)
  }

  parts.push('--config video=false')

  if (grep) {
    const escapedGrep = grep.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    parts.push(`--expose grep="${escapedGrep}",grepFilterSpecs=true,grepOmitFiltered=true`)
  }

  return parts.join(' ')
}

function runWithServers(cypressCommand, env = {}) {
  const withApp = `start-server-and-test start:test:ready http://localhost:3000 "${cypressCommand}"`
  const command = `start-server-and-test chopsticks http://localhost:8000 '${withApp}'`

  return spawnSync(command, {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ...env },
  })
}

function printUsage() {
  const suiteNames = Object.keys(SUITES).join(', ')
  console.error(`Usage:
  yarn test:e2e:<suite> [--failed]
  yarn test:e2e:all [--failed]
  yarn test:e2e:grep "<title substring>" [--failed]
  yarn test:e2e:open
  yarn test:e2e:headed

Suites: ${suiteNames}, all, grep

Options:
  --failed   Re-run only tests that failed in the last run (cached in cypress/.cache/failed-tests.json)
  --headed   Run Cypress in headed mode (local debugging)
`)
}

function main() {
  const { positional, failed, headed } = parseArgs(process.argv.slice(2))

  if (positional.length === 0) {
    printUsage()
    process.exit(1)
  }

  const target = positional[0]

  if (target === 'open') {
    const result = runWithServers(buildCypressCommand({ mode: 'open' }))
    process.exit(result.status ?? 1)
  }

  if (target === 'headed') {
    const result = spawnSync(buildCypressCommand({ mode: 'run', headed: true }), {
      stdio: 'inherit',
      shell: true,
      env: process.env,
    })
    process.exit(result.status ?? 1)
  }

  if (target === 'grep') {
    const grepPattern = positional.slice(1).join(' ').trim()
    if (!grepPattern) {
      console.error('Usage: yarn test:e2e:grep "<test title substring>" [--failed]')
      process.exit(1)
    }

    let grep = grepPattern
    if (failed) {
      const failedTests = loadFailedTests()
      const failedTitles = failedTests.map((entry) => entry.title).filter((title) => title.includes(grepPattern))
      if (failedTitles.length === 0) {
        console.error(`No failed tests match grep pattern "${grepPattern}".`)
        process.exit(1)
      }
      grep = buildGrepPattern(failedTitles)
    }

    const result = runWithServers(buildCypressCommand({ mode: 'run', grep }))
    process.exit(result.status ?? 1)
  }

  if (target === 'all') {
    let grep
    if (failed) {
      const failedTests = loadFailedTests()
      grep = buildGrepPattern(failedTests.map((entry) => entry.title))
    }

    const result = runWithServers(buildCypressCommand({ mode: 'run', grep, headed }))
    process.exit(result.status ?? 1)
  }

  const spec = SUITES[target]
  if (!spec) {
    console.error(`Unknown e2e suite "${target}".`)
    printUsage()
    process.exit(1)
  }

  let grep
  if (failed) {
    const failedTests = loadFailedTests(spec)
    grep = buildGrepPattern(failedTests.map((entry) => entry.title))
  }

  const result = runWithServers(
    buildCypressCommand({ mode: 'run', spec, grep, headed }),
    SUITE_ENV[target] ?? {}
  )
  process.exit(result.status ?? 1)
}

main()
