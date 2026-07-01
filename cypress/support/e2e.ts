import '@chainsafe/cypress-polkadot-wallet'
import { register as registerCypressGrep } from '@cypress/grep'
import './commands'

registerCypressGrep()

Cypress.Commands.add('getBySel', (selector: string, ...args: any[]) => {
  return cy.get(`[data-test="${selector}"]`, ...args)
})

Cypress.Commands.add('getBySelLike', (selector: string, ...args: any[]) => {
  return cy.get(`[data-test*="${selector}"]`, ...args)
})
