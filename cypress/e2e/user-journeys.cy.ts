import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

const approveTxAndAdvance = () => {
  cy.approvePendingTransaction()
  cy.contains(/finalized|success|sent|submitted/i, { timeout: 60000 }).should('be.visible')
  cy.task('resetChopsticks', null, { timeout: 120000 })
}

describe('User Journeys', () => {
  let testAccounts: InjectedAccountWitMnemonic[]

  before(() => {
    cy.task('rememberForkPoint')
    cy.fixture('accounts').then((accounts) => {
      testAccounts = Object.values(accounts).map((acc: any) => ({
        address: acc.address,
        name: acc.name,
        type: acc.type,
        mnemonic: acc.mnemonic,
      }))
    })
  })

  describe('New User Journey (Human → Bidder)', () => {
    before(() => {
      cy.task('resetChopsticksToFork', null, { timeout: 120000 })
    })

    it('should guide a human through the journey page to place a bid', () => {
      cy.visit('/journey?rpc=ws://localhost:8000')
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.contains('Submit a Bid').should('be.visible')
      cy.contains('a', 'Submit a Bid').click()
      cy.url({ timeout: 15000 }).should('include', '/explore/bidders')
      cy.getBySel('bid-amount-input', { timeout: 15000 }).should('be.visible')

      cy.getBySel('bid-tab').click()
      cy.getBySel('bid-amount-input').clear().type('1')
      cy.getBySel('submit-bid-button').click()

      approveTxAndAdvance()

      cy.visitExplore('bidders')
      cy.verifyAccountLevel('Bidder')

      cy.visit('/journey?rpc=ws://localhost:8000')
      cy.contains('Check Bids').should('be.visible')
    })
  })

  describe('Member Participation Journey', () => {
    before(() => {
      cy.task('resetChopsticksToFork', null, { timeout: 120000 })
    })

    beforeEach(() => {
      cy.visit('/journey?rpc=ws://localhost:8000')
      cy.initWallet(testAccounts, Cypress.env('app_name'))
    })

    it('should guide a cyborg through journey page to vote on candidates', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')

      cy.contains('Vote on Candidates').should('be.visible')
      cy.contains('a', 'Vote on Candidates').click()
      cy.url({ timeout: 15000 }).should('include', '/explore/candidates')
      cy.getBySel('candidates-list', { timeout: 15000 }).should('be.visible')

      cy.getBySelLike('candidate-approve-button-', { timeout: 15000 }).first().click()

      approveTxAndAdvance()
    })

    it('should allow a cyborg to navigate to vouch from journey page', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')

      cy.contains('Vouch for someone').should('be.visible')
      cy.contains('a', 'Vouch for someone').click()
      cy.url({ timeout: 15000 }).should('include', '/explore/bidders')
      cy.getBySel('vouch-tab', { timeout: 15000 }).should('be.visible')
    })
  })

  describe('Bidder Lifecycle (Bid → Unbid)', () => {
    beforeEach(() => {
      cy.task('resetChopsticksToFork', null, { timeout: 120000 })
      cy.visit('/explore/bidders?rpc=ws://localhost:8000')
      cy.initWallet(testAccounts, Cypress.env('app_name'))
    })

    it('should place a bid as Human and become Bidder', () => {
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.getBySel('bid-tab').click()
      cy.getBySel('bid-amount-input').clear().type('2')
      cy.getBySel('submit-bid-button').click()
      approveTxAndAdvance()

      cy.visitExplore('bidders')
      cy.verifyAccountLevel('Bidder')
    })

    it('should unbid as Bidder and become Human again', () => {
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.getBySel('bid-tab').click()
      cy.getBySel('bid-amount-input').clear().type('2')
      cy.getBySel('submit-bid-button').click()
      approveTxAndAdvance()

      cy.getBySel('unbid-button', { timeout: 30000 }).should('be.visible').click()
      approveTxAndAdvance()

      cy.getBySel('submit-bid-button', { timeout: 30000 }).should('be.visible')
      cy.getBySel('account-level').should('have.text', 'HUMAN')
    })
  })

  after(() => {
    cy.task('resetChopsticksToFork')
  })
})
