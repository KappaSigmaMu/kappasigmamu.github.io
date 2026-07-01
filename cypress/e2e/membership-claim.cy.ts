import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

const CLAIM_PERIOD_BLOCK = 18230000
const CHOPSTICKS_TASK_TIMEOUT = 30000

describe('Membership Claim', () => {
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
    cy.task('resetChopsticksStorage', null, { timeout: CHOPSTICKS_TASK_TIMEOUT })
  })

  describe('Claim Button Visibility', () => {
    beforeEach(() => {
      cy.visit('/journey?rpc=ws://localhost:8000&claim=true')
      cy.initWallet(testAccounts, Cypress.expose('app_name'))
    })

    it('should show claim membership button for candidate when claim period is active', () => {
      cy.connectWallet('Bob')
      cy.verifyAccountLevel('Candidate')

      cy.getBySel('claim-membership-button', { timeout: 20000 }).should('be.visible')
      cy.contains("It's claim time!").should('be.visible')
    })

    it('should not show claim membership button for non-candidate', () => {
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.getBySel('claim-membership-button').should('not.exist')
    })

    it('should not show claim membership button for existing member', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')

      cy.getBySel('claim-membership-button').should('not.exist')
    })
  })

  describe('Voting Period Restrictions', () => {
    it('should not show claim button during voting period without override', () => {
      cy.visit('/journey?rpc=ws://localhost:8000')
      cy.initWallet(testAccounts, Cypress.expose('app_name'))
      cy.connectWallet('Bob')
      cy.verifyAccountLevel('Candidate')

      cy.contains('Proof of Ink', { timeout: 20000 }).should('be.visible')
      cy.getBySel('claim-membership-button').should('not.exist')
    })
  })

  describe('Claim Membership Transaction', () => {
    beforeEach(() => {
      cy.task('setChopsticksHead', CLAIM_PERIOD_BLOCK, { timeout: CHOPSTICKS_TASK_TIMEOUT })
    })

    after(() => {
      cy.task('resetChopsticksStorage', null, { timeout: CHOPSTICKS_TASK_TIMEOUT })
    })

    it('should allow candidate to claim membership and become Cyborg', () => {
      cy.visit('/journey?rpc=ws://localhost:8000&claim=true')
      cy.initWallet(testAccounts, Cypress.expose('app_name'))
      cy.connectWallet('Bob')
      cy.verifyAccountLevel('Candidate')

      cy.getBySel('account-balance', { timeout: 20000 }).should('be.visible')
      cy.getBySel('claim-membership-button', { timeout: 20000 }).should('be.visible')
      cy.contains("It's claim time!").should('be.visible')

      cy.getBySel('claim-membership-button').click()

      cy.contains(/awaiting signature/i, { timeout: 30000 }).should('be.visible')
      cy.approvePendingTransaction()
      cy.task('resetChopsticks', null, { timeout: CHOPSTICKS_TASK_TIMEOUT })
      cy.contains(/claim request sent|transaction submitted/i, { timeout: 60000 }).should('be.visible')

      cy.task('resetChopsticks', null, { timeout: CHOPSTICKS_TASK_TIMEOUT })
      cy.visit('/journey?rpc=ws://localhost:8000')
      cy.verifyAccountLevel('Cyborg')
    })
  })

})
