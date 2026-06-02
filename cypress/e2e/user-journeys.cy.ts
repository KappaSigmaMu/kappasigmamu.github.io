import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

const waitForTxAndApprove = () => {
  cy.contains(/awaiting signature/i, { timeout: 30000 }).should('be.visible')
  cy.wait(500)
  const approvePendingTx = (retries = 10): void => {
    cy.getTxRequests().then((txRequests) => {
      const txIds = Object.keys(txRequests)
      if (txIds.length > 0) {
        cy.approveTx(Number(txIds[txIds.length - 1]))
      } else if (retries > 0) {
        cy.wait(500)
        approvePendingTx(retries - 1)
      }
    })
  }
  approvePendingTx()
  cy.wait(5000)
  cy.task('resetChopsticks')
}

describe('User Journeys', () => {
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
  })

  describe('New User Journey (Human → Bidder)', () => {
    before(() => {
      cy.task('resetChopsticksToFork')
      cy.wait(2000)
    })

    it('should guide a human through the journey page to place a bid', () => {
      cy.visit('/journey?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.wait(1000)
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.contains('Submit a Bid').should('be.visible')
      cy.contains('a', 'Submit a Bid').click()
      cy.url({ timeout: 15000 }).should('include', '/explore/bidders')
      cy.getBySel('bid-amount-input', { timeout: 15000 }).should('be.visible')

      cy.getBySel('bid-tab').click()
      cy.getBySel('bid-amount-input').clear().type('1')
      cy.getBySel('submit-bid-button').click()

      waitForTxAndApprove()

      cy.visitExplore('bidders')
      cy.verifyAccountLevel('Bidder')

      cy.visit('/journey?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.contains('Check Bids').should('be.visible')
    })
  })

  describe('Member Participation Journey', () => {
    before(() => {
      cy.task('resetChopsticksToFork')
    })

    beforeEach(() => {
      cy.visit('/journey?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.wait(1000)
    })

    it('should guide a cyborg through journey page to vote on candidates', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')

      cy.contains('Vote on Candidates').should('be.visible')
      cy.contains('a', 'Vote on Candidates').click()
      cy.url({ timeout: 15000 }).should('include', '/explore/candidates')
      cy.getBySel('candidates-list', { timeout: 15000 }).should('be.visible')

      cy.getBySelLike('candidate-approve-button-', { timeout: 15000 }).first().click({ force: true })

      waitForTxAndApprove()
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

  describe('Bidder Lifecycle (Bid → Unbid → Rebid)', () => {
    before(() => {
      cy.task('resetChopsticksToFork')
    })

    it('should place a bid as Human and become Bidder', () => {
      cy.visit('/explore/bidders?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.wait(1000)
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.getBySel('bid-tab').click()
      cy.getBySel('bid-amount-input').clear().type('2')
      cy.getBySel('submit-bid-button').click()

      waitForTxAndApprove()

      cy.visitExplore('bidders')
      cy.verifyAccountLevel('Bidder')
    })

    it('should unbid as Bidder and become Human again', () => {
      cy.visit('/explore/bidders?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.wait(1000)
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Bidder')

      cy.getBySel('unbid-button', { timeout: 15000 }).should('be.visible').click({ force: true })

      waitForTxAndApprove()

      cy.visitExplore('bidders')
      cy.verifyAccountLevel('Human')
    })

    it('should rebid as Human and become Bidder once more', () => {
      cy.visit('/explore/bidders?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.wait(1000)
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.getBySel('bid-tab').click()
      cy.getBySel('bid-amount-input').clear().type('3')
      cy.getBySel('submit-bid-button').click()

      waitForTxAndApprove()

      cy.visitExplore('bidders')
      cy.verifyAccountLevel('Bidder')
    })
  })

  after(() => {
    cy.task('resetChopsticksToFork')
  })
})
