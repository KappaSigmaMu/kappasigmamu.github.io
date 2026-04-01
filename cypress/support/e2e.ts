import '@chainsafe/cypress-polkadot-wallet'
import './commands'

Cypress.on('uncaught:exception', (err) => {
  console.log('Uncaught exception:', err.message)
  return false
})
