Cypress.Commands.add('connectWallet', (accountName: string) => {
  cy.contains('button', /connect/i).should('be.visible').click({ force: true })
  cy.get('[data-testid="wallet-polkadot"]').should('be.visible').click({ force: true })
  cy.get('.modal-title', { timeout: 10000 }).should('contain.text', 'Accounts')
  cy.get('[data-testid="account-switcher"]', { timeout: 10000 }).should('have.length.gte', 1)
  cy.contains('[data-testid="account-switcher"]', accountName).click({ force: true })
  cy.get('[role="dialog"]', { timeout: 10000 }).should('not.exist')
  cy.get('[data-testid="account-balance"]', { timeout: 15000 }).should('be.visible')
})

Cypress.Commands.add('waitForBlockchainData', (timeout?: number) => {
  cy.get('.spinner-border', { timeout: timeout || 10000 }).should('not.exist')
})

Cypress.Commands.add('submitTransaction', () => {
  cy.contains(/awaiting signature/i, { timeout: 30000 }).should('be.visible')
  cy.getTxRequests().then((txRequests) => {
    const txIds = Object.keys(txRequests)
    if (txIds.length > 0) {
      cy.approveTx(Number(txIds[txIds.length - 1]))
    }
  })
  cy.contains(/finalized|success/i, { timeout: 30000 }).should('be.visible')
})

Cypress.Commands.add('visitExplore', (section: string) => {
  const rpc = Cypress.env('chopsticks_url') || 'ws://localhost:8000'
  cy.visit(`/explore/${section}?rpc=${rpc}`, { timeout: 20000 })
  cy.waitForBlockchainData()
})

Cypress.Commands.add('verifyAccountLevel', (level: string) => {
  cy.get('[data-testid="account-balance"]', { timeout: 15000 })
    .should('be.visible')
    .and('contain.text', level.toUpperCase())
})

Cypress.Commands.add('verifyToast', (message: string, timeout?: number) => {
  cy.contains(message, { timeout: timeout || 15000 }).should('be.visible')
})
