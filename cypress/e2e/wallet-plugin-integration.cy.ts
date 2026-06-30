import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

describe('Wallet Plugin Integration', () => {
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

  describe('Account Injection', () => {
    beforeEach(() => {
      cy.visit('/explore?rpc=ws://localhost:8000')
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.getBySel('blockchain-data', { timeout: 20000 }).should('be.visible')
    })

    it('should inject all test accounts into wallet', () => {
      cy.contains('button', /connect/i).should('be.visible').click()
      cy.getBySel('wallet-modal', { timeout: 15000 }).should('be.visible')
      cy.getBySel('wallet-modal')
        .find('[data-test="wallet-polkadot"]')
        .should('exist')
        .parent()
        .should('contain.text', 'Use')
      cy.getBySel('wallet-modal').find('[data-test="wallet-polkadot"]').click({ force: true })

      cy.getBySel('wallet-modal')
        .find('[data-test="account-switcher"]', { timeout: 10000 })
        .should('have.length', 6)
      cy.get('.modal-body').within(() => {
        cy.contains('Alice').should('exist')
        cy.contains('Bob').should('exist')
        cy.contains('Charlie').should('exist')
        cy.contains('Dave').should('exist')
        cy.contains('Eve').should('exist')
        cy.contains('Ferdie').should('exist')
      })
    })

    it('should connect with Alice account', () => {
      cy.connectWallet('Alice')
      cy.getBySel('account-balance').should('be.visible')
    })

    it('should connect with Bob account', () => {
      cy.connectWallet('Bob')
      cy.getBySel('account-balance').should('be.visible')
    })

    it('should connect with Dave account', () => {
      cy.connectWallet('Dave')
      cy.getBySel('account-balance').should('be.visible')
    })

    it('should connect with Eve account', () => {
      cy.connectWallet('Eve')
      cy.getBySel('account-balance').should('be.visible')
    })

    it('should connect with Ferdie account', () => {
      cy.connectWallet('Ferdie')
      cy.getBySel('account-balance').should('be.visible')
    })
  })

  describe('Wallet Disconnect', () => {
    beforeEach(() => {
      cy.visit('/explore?rpc=ws://localhost:8000')
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.getBySel('blockchain-data', { timeout: 20000 }).should('be.visible')
    })

    it('should disconnect wallet and return to initial state', () => {
      cy.connectWallet('Alice')
      cy.getBySel('account-balance').should('be.visible')

      cy.getBySel('account-balance').parents('button').click()
      cy.getBySel('disconnect-button').should('be.visible').click()

      cy.contains('button', /connect/i).should('be.visible')
      cy.getBySel('account-balance').should('not.exist')
    })

    it('should allow reconnection after disconnect', () => {
      cy.connectWallet('Alice')
      cy.getBySel('account-balance').should('be.visible')

      cy.getBySel('account-balance').parents('button').click()
      cy.getBySel('disconnect-button').should('be.visible').click()
      cy.contains('button', /connect/i).should('be.visible')

      cy.connectWallet('Bob')
      cy.getBySel('account-balance').should('be.visible')
    })
  })

  describe('Wallet Persistence', () => {
    beforeEach(() => {
      cy.visit('/explore?rpc=ws://localhost:8000')
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.getBySel('blockchain-data', { timeout: 20000 }).should('be.visible')
    })

    it('should persist wallet across page navigation', () => {
      cy.connectWallet('Eve')
      cy.getBySel('account-balance').should('be.visible')

      cy.visit('/explore/members?rpc=ws://localhost:8000')

      cy.getBySel('account-balance', { timeout: 15000 }).should('be.visible')
    })
  })

  describe('Transaction Approval', () => {
    beforeEach(() => {
      cy.visit('/explore?rpc=ws://localhost:8000')
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.getBySel('blockchain-data', { timeout: 20000 }).should('be.visible')
    })

    it('should handle transaction request queue', () => {
      cy.connectWallet('Alice')
      cy.getTxRequests().then((txRequests) => {
        expect(Object.keys(txRequests).length).to.eq(0)
      })
    })
  })
})
