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
      cy.visit('/explore?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, 'Kusama Society')
      cy.wait(1000)
    })

    it('should inject all test accounts into wallet', () => {
      cy.contains('button', /connect/i).should('be.visible').click({ force: true })
      cy.get('[data-testid="wallet-polkadot"]', { timeout: 15000 }).should('be.visible')
        .parent().should('contain.text', 'Use')
      cy.get('[data-testid="wallet-polkadot"]').click({ force: true })

      cy.get('[data-testid="account-switcher"]', { timeout: 10000 }).should('have.length', 6)
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
      cy.get('[data-testid="account-balance"]').should('be.visible')
    })

    it('should connect with Bob account', () => {
      cy.connectWallet('Bob')
      cy.get('[data-testid="account-balance"]').should('be.visible')
    })

    it('should connect with Dave account', () => {
      cy.connectWallet('Dave')
      cy.get('[data-testid="account-balance"]').should('be.visible')
    })

    it('should connect with Eve account', () => {
      cy.connectWallet('Eve')
      cy.get('[data-testid="account-balance"]').should('be.visible')
    })

    it('should connect with Ferdie account', () => {
      cy.connectWallet('Ferdie')
      cy.get('[data-testid="account-balance"]').should('be.visible')
    })
  })

  describe('Wallet Disconnect', () => {
    beforeEach(() => {
      cy.visit('/explore?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, 'Kusama Society')
      cy.wait(500)
    })

    it('should disconnect wallet and return to initial state', () => {
      cy.connectWallet('Alice')
      cy.get('[data-testid="account-balance"]').should('be.visible')

      cy.get('[data-testid="account-balance"]').parents('button').click()
      cy.get('[data-testid="disconnect-button"]').should('be.visible').click()

      cy.contains('button', /connect/i).should('be.visible')
      cy.get('[data-testid="account-balance"]').should('not.exist')
    })

    it('should allow reconnection after disconnect', () => {
      cy.connectWallet('Alice')
      cy.get('[data-testid="account-balance"]').should('be.visible')

      cy.get('[data-testid="account-balance"]').parents('button').click()
      cy.get('[data-testid="disconnect-button"]').should('be.visible').click()
      cy.contains('button', /connect/i).should('be.visible')

      cy.connectWallet('Bob')
      cy.get('[data-testid="account-balance"]').should('be.visible')
    })
  })

  describe('Wallet Persistence', () => {
    beforeEach(() => {
      cy.visit('/explore?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, 'Kusama Society')
      cy.wait(500)
    })

    it('should persist wallet across page navigation', () => {
      cy.connectWallet('Eve')
      cy.get('[data-testid="account-balance"]').should('be.visible')

      cy.visit('/explore/members?rpc=ws://localhost:8000', { timeout: 20000 })

      cy.get('[data-testid="account-balance"]', { timeout: 15000 }).should('be.visible')
    })
  })

  describe('Transaction Approval', () => {
    beforeEach(() => {
      cy.visit('/explore?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, 'Kusama Society')
      cy.wait(500)
    })

    it('should handle transaction request queue', () => {
      cy.connectWallet('Alice')
      cy.getTxRequests().then((txRequests) => {
        expect(Object.keys(txRequests).length).to.eq(0)
      })
    })
  })
})
