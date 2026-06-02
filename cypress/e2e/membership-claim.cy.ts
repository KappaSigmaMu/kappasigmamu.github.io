import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

const CLAIM_PERIOD_BLOCK = 20937600

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
}

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
  })

  describe('Claim Button Visibility', () => {
    beforeEach(() => {
      cy.visit('/journey?rpc=ws://localhost:8000&claim=true', { timeout: 20000 })
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.wait(1000)
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
      cy.visit('/journey?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.wait(1000)
      cy.connectWallet('Bob')
      cy.verifyAccountLevel('Candidate')

      cy.getBySel('claim-membership-button').should('not.exist')
      cy.contains('Proof of Ink').should('be.visible')
    })
  })

  describe('Claim Membership Transaction', () => {
    before(() => {
      cy.task('restartChopsticksAtBlock', CLAIM_PERIOD_BLOCK, { timeout: 180000 })
    })

    it('should allow candidate to claim membership and become Cyborg', () => {
      cy.visit('/journey?rpc=ws://localhost:8000', { timeout: 30000 })
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.wait(2000)
      cy.connectWallet('Bob')
      cy.verifyAccountLevel('Candidate')

      cy.getBySel('claim-membership-button', { timeout: 20000 }).should('be.visible')
      cy.contains("It's claim time!").should('be.visible')

      cy.getBySel('claim-membership-button').click({ force: true })

      cy.contains(/awaiting signature/i, { timeout: 30000 }).should('be.visible')
      cy.wait(2000)
      const approveClaim = (retries = 20): void => {
        cy.getTxRequests().then((txRequests) => {
          const txIds = Object.keys(txRequests)
          if (txIds.length > 0) {
            cy.approveTx(Number(txIds[txIds.length - 1]))
          } else if (retries > 0) {
            cy.wait(1000)
            approveClaim(retries - 1)
          }
        })
      }
      approveClaim()

      cy.contains(/finalized|success|sent|submitted/i, { timeout: 60000 }).should('be.visible')

      cy.task('resetChopsticks', null, { timeout: 120000 })

      cy.visit('/journey?rpc=ws://localhost:8000', { timeout: 30000 })
      cy.verifyAccountLevel('Cyborg')
    })
  })

  after(() => {
    cy.task('restartChopsticksAtBlock', 21000000, { timeout: 180000 })
  })
})
