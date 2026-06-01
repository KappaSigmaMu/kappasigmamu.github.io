import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

const waitForTxAndApprove = () => {
  cy.contains(/awaiting signature/i, { timeout: 30000 }).should('be.visible')
  cy.wait(500)
  const approvePendingTx = (retries = 5): void => {
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

describe('Payouts Page', () => {
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

  describe('Payouts List UI', () => {
    beforeEach(() => {
      cy.visit('/explore/payouts?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.waitForBlockchainData(20000)
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
      cy.visit('/explore/payouts?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.getBySel('payouts-list', { timeout: 20000 }).should('be.visible')
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
      cy.getBySelLike('claim-payout-button-').click({ force: true })

      waitForTxAndApprove()
      cy.contains(/successfully|submitted/i, { timeout: 30000 }).should('be.visible')
    })
  })

  after(() => {
    cy.task('resetChopsticksToFork')
  })
})
