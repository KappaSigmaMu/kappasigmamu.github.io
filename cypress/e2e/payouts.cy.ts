import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

const visitPayoutsPage = () => {
  cy.visit('/explore/payouts?rpc=ws://localhost:8000')
  cy.getBySel('payouts-list').should('be.visible')
}

const visitPayoutsPageWithWallet = (testAccounts: InjectedAccountWitMnemonic[]) => {
  visitPayoutsPage()
  cy.initWallet(testAccounts, Cypress.env('app_name'))
}

describe('Payouts Page', () => {
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

  beforeEach(() => {
    cy.task('resetChopsticksToFork')
  })

  describe('Payouts List UI', () => {
    beforeEach(() => {
      visitPayoutsPage()
    })

    it('should display the payouts list', () => {
      cy.getBySel('payouts-list').should('be.visible')
    })

    it('should display payout rows for society members', () => {
      cy.getBySelLike('payout-row-').should('have.length.gte', 1)
    })

    it('should display paid and pending columns', () => {
      cy.getBySelLike('payout-total-').first().should('be.visible')
      cy.getBySelLike('payout-pending-').first().should('be.visible')
    })

    it('should display maturity status for members with payouts', () => {
      cy.getBySelLike('payout-maturity-').should('have.length.gte', 1)
    })

    it('should show Matured badge for Ferdie (payout past due block)', () => {
      cy.getBySelLike('payout-maturity-').contains('Matured').should('be.visible')
    })

    it('should show Ranked badge for members with rank > 0 (Ferdie)', () => {
      cy.getBySel('payouts-list').contains('Ranked').should('be.visible')
    })
  })

  describe('Claim Payout', () => {
    beforeEach(() => {
      visitPayoutsPageWithWallet(testAccounts)
    })

    it('should not show claim button when not connected as payout owner', () => {
      cy.connectWallet('Dave')
      cy.getBySelLike('claim-payout-button-').should('not.exist')
    })

    it('should show claim button when connected as Ferdie (matured payout)', () => {
      cy.connectWallet('Ferdie')
      cy.getBySelLike('claim-payout-button-').should('be.visible')
    })

    it('should claim matured payout successfully', () => {
      cy.connectWallet('Ferdie')
      cy.getBySelLike('claim-payout-button-').should('be.visible').click()

      cy.approvePendingTransaction()
      cy.contains(/successfully/i, { timeout: 30000 }).should('be.visible')
    })
  })

  after(() => {
    cy.task('resetChopsticksToFork')
  })
})
