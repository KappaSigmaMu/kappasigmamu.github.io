import '@chainsafe/cypress-polkadot-wallet'
import './commands'

Cypress.on('uncaught:exception', (err) => {
  console.log('Uncaught exception:', err.message)
  return false
})

Cypress.Commands.add('getBySel', (selector: string, ...args: any[]) => {
  return cy.get(`[data-test="${selector}"]`, ...args)
})

Cypress.Commands.add('getBySelLike', (selector: string, ...args: any[]) => {
  return cy.get(`[data-test*="${selector}"]`, ...args)
})
