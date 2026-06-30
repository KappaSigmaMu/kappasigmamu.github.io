import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

describe('Membership Claim Transaction', () => {
  let testAccounts: InjectedAccountWitMnemonic[]

  before(() => {
    cy.fixture('accounts').then((accounts) => {
      testAccounts = Object.values(accounts).map((acc: any) => ({
        address: acc.address,
        name: acc.name,
        type: acc.type,
        mnemonic: acc.mnemonic,
      }))
    })

    cy.task('resetChopsticks', null, { timeout: 120000 })
  })

  it('should allow candidate to claim membership and become Cyborg', () => {
    cy.visit('/journey?rpc=ws://localhost:8000&claim=true')
    cy.initWallet(testAccounts, Cypress.env('app_name'))
    cy.connectWallet('Bob')
    cy.verifyAccountLevel('Candidate')

    cy.getBySel('account-balance', { timeout: 20000 }).should('be.visible')
    cy.getBySel('claim-membership-button', { timeout: 20000 }).should('be.visible')
    cy.contains("It's claim time!").should('be.visible')

    cy.getBySel('claim-membership-button').click()

    cy.contains(/awaiting signature/i, { timeout: 30000 }).should('be.visible')
    cy.approvePendingTransaction()
    cy.task('resetChopsticks', null, { timeout: 120000 })
    cy.contains(/claim request sent|transaction submitted/i, { timeout: 60000 }).should('be.visible')

    cy.task('resetChopsticks', null, { timeout: 120000 })
    cy.visit('/journey?rpc=ws://localhost:8000')
    cy.verifyAccountLevel('Cyborg')
  })
})
