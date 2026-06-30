import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

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
      cy.visit('/journey?rpc=ws://localhost:8000&claim=true')
      cy.initWallet(testAccounts, Cypress.env('app_name'))
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
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.connectWallet('Bob')
      cy.verifyAccountLevel('Candidate')

      cy.contains('Proof of Ink', { timeout: 20000 }).should('be.visible')
      cy.getBySel('claim-membership-button').should('not.exist')
    })
  })

})
