Cypress.Commands.add('connectWallet', (accountName: string) => {
  cy.getBySel('blockchain-data', { timeout: 20000 }).should('be.visible')
  cy.getBySel('connect-wallet-button').should('be.visible').click()
  cy.getBySel('wallet-modal').should('be.visible')
  cy.getBySel('wallet-polkadot').should('be.visible').click()
  cy.get('.modal-title', { timeout: 10000 }).should('contain.text', 'Accounts')
  cy.getBySel('account-switcher', { timeout: 10000 }).should('have.length.gte', 1)
  cy.contains('[data-test="account-switcher"]', accountName).click()
  cy.get('[role="dialog"]', { timeout: 10000 }).should('not.exist')
  cy.getBySel('account-balance', { timeout: 15000 }).should('be.visible')
})

Cypress.Commands.add('waitForBlockchainData', (timeout?: number) => {
  cy.get('.spinner-border', { timeout: timeout || 10000 }).should('not.exist')
})

Cypress.Commands.add('approvePendingTransaction', () => {
  cy.contains(/awaiting signature/i, { timeout: 30000 }).should('be.visible')

  const maxAttempts = 40
  const approvePendingTx = (attempt = 0): void => {
    cy.getTxRequests().then((txRequests) => {
      const txIds = Object.keys(txRequests)
      if (txIds.length > 0) {
        cy.approveTx(Number(txIds[txIds.length - 1]))
        return
      }
      if (attempt >= maxAttempts) {
        throw new Error('approvePendingTransaction: no transaction request appeared to approve within timeout')
      }
      cy.wait(500)
      approvePendingTx(attempt + 1)
    })
  }
  approvePendingTx()
})

Cypress.Commands.add('submitTransaction', () => {
  cy.approvePendingTransaction()
  cy.contains(/finalized|success/i, { timeout: 30000 }).should('be.visible')
})

Cypress.Commands.add('verifyTxError', (message?: string | RegExp, timeout?: number) => {
  cy.getBySel('tx-error', { timeout: timeout || 30000 }).should('be.visible')
  if (message) {
    cy.getBySel('tx-message').should(message instanceof RegExp ? 'match' : 'contain.text', message)
  }
})

Cypress.Commands.add('visitExplore', (section: string) => {
  const rpc = Cypress.env('chopsticks_url') || 'ws://localhost:8000'
  cy.visit(`/explore/${section}?rpc=${rpc}`, { timeout: 20000 })
  cy.waitForBlockchainData()
})

Cypress.Commands.add('verifyAccountLevel', (level: string) => {
  cy.getBySel('account-balance', { timeout: 15000 }).should('be.visible')
  cy.getBySel('account-level', { timeout: 15000 }).should('have.text', level.toUpperCase())
})

Cypress.Commands.add('verifyToast', (message: string, timeout?: number) => {
  cy.contains(message, { timeout: timeout || 15000 }).should('be.visible')
})
