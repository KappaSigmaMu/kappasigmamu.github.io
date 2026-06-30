const { spawnSync } = require('child_process')

const grep = process.argv.slice(2).join(' ').trim()

if (!grep) {
  console.error('Usage: yarn test:e2e:grep "<test title substring>"')
  process.exit(1)
}

const escapedGrep = grep.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
const cypress = `cypress run --config video=false --expose grepFilterSpecs=true,grepOmitFiltered=true,grep="${escapedGrep}"`
const withApp = `start-server-and-test start:test:ready http://localhost:3000 "${cypress}"`
const command = `start-server-and-test chopsticks http://localhost:8000 '${withApp}'`

const result = spawnSync(command, {
  stdio: 'inherit',
  shell: true,
  env: process.env,
})

process.exit(result.status ?? 1)
