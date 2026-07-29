Cypress.Commands.add('connectWallet', (accountName: string) => {
  cy.get('[data-test="connect-wallet-button"], [data-test="connected-account"]', { timeout: 20000 })
    .first()
    .click()

  cy.getBySel('wallet-modal', { timeout: 20000 }).should('be.visible')

  cy.getBySel('wallet-modal').then(($modal) => {
    if ($modal.find('.modal-title').text().includes('Wallets')) {
      cy.getBySel('wallet-modal').find('[data-test="wallet-polkadot"]').click({ force: true })
      cy.getBySel('wallet-modal').find('.modal-title', { timeout: 20000 }).should('contain.text', 'Accounts')
    }
  })

  cy.getBySel('wallet-modal')
    .find('[data-test="account-switcher"]', { timeout: 20000 })
    .should('have.length.gte', 1)

  cy.getBySel('wallet-modal')
    .contains('[data-test="account-switcher"]', accountName, { timeout: 20000 })
    .click({ force: true })

  cy.getBySel('wallet-modal', { timeout: 10000 }).should('not.exist')
  cy.getBySel('account-balance', { timeout: 20000 }).should('be.visible')
})

const approvedTxRequestIds = new Set<number>()

Cypress.Commands.add('approvePendingTransaction', () => {
  cy.contains(/awaiting signature/i, { timeout: 30000 }).should('be.visible')

  const maxAttempts = 40
  const approvePendingTx = (attempt = 0): void => {
    cy.getTxRequests().then((txRequests) => {
      const txIds = Object.keys(txRequests)
        .map(Number)
        .filter((txId) => !approvedTxRequestIds.has(txId))
      if (txIds.length > 0) {
        const txId = txIds[txIds.length - 1]
        approvedTxRequestIds.add(txId)
        cy.approveTx(txId)
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

Cypress.Commands.add('includePendingTransaction', (options?: { timeout?: number }) => {
  if (options) {
    cy.task('includePendingTransaction', null, options)
    return
  }
  cy.task('includePendingTransaction')
})

Cypress.Commands.add('submitTransaction', () => {
  cy.approvePendingTransaction()
  cy.getBySel('tx-pending', { timeout: 30000 }).find('[data-test="tx-message"]').should('be.visible')
  cy.includePendingTransaction({ timeout: 120000 })
  cy.getBySel('tx-success', { timeout: 30000 }).find('[data-test="tx-message"]').should('be.visible')
  cy.getBySel('tx-pending').should('not.exist')
})

Cypress.Commands.add('verifyTxError', (message?: string | RegExp, timeout?: number) => {
  cy.getBySel('tx-error', { timeout: timeout || 30000 }).should('be.visible')
  if (message) {
    cy.getBySel('tx-message').should(message instanceof RegExp ? 'match' : 'contain.text', message)
  }
})

Cypress.Commands.add('visitExplore', (section: string) => {
  const rpc = Cypress.expose('chopsticks_url') || 'ws://localhost:8000'
  cy.visit(`/explore/${section}?rpc=${rpc}`)
})

Cypress.Commands.add('verifyAccountLevel', (level: string) => {
  cy.getBySel('account-balance', { timeout: 15000 }).should('be.visible')
  cy.getBySel('account-level', { timeout: 15000 }).should('have.text', level.toUpperCase())
})

Cypress.Commands.add('verifyToast', (message: string, timeout?: number) => {
  cy.contains(message, { timeout: timeout || 15000 }).should('be.visible')
})

Cypress.Commands.add('unloadApp', () => {
  cy.window().then((win) => {
    win.location.replace('about:blank')
  })
  cy.window({ timeout: 10000 }).should((win) => {
    expect(win.location.href).to.equal('about:blank')
  })
})

Cypress.Commands.add('resetChopsticksToFork', (options?: { timeout?: number }) => {
  cy.unloadApp()
  return options ? cy.task('resetChopsticksToFork', null, options) : cy.task('resetChopsticksToFork')
})
