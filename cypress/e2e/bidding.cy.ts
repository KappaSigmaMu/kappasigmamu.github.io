import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

const visitBiddersPage = () => {
  cy.visit('/explore/bidders?rpc=ws://localhost:8000', { timeout: 20000 })
  cy.getBySel('blockchain-data', { timeout: 20000 }).should('be.visible')
}

const visitBiddersPageWithWallet = (testAccounts: InjectedAccountWitMnemonic[]) => {
  visitBiddersPage()
  cy.initWallet(testAccounts, Cypress.env('app_name'))
}

const expectTransactionSuccess = () => {
  cy.contains(/finalized|success/i, { timeout: 30000 }).should('be.visible')
}

describe('Bidding Operations', () => {
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

  describe('Bidders Page UI', () => {
    beforeEach(() => {
      visitBiddersPage()
    })

    it('should load the bidders page with bid tab active by default', () => {
      cy.getBySel('bid-tab').should('be.visible')
      cy.getBySel('bid-tab')
        .closest('.nav-link')
        .should('have.class', 'active')
    })

    it('should display bid amount input and submit button', () => {
      cy.getBySel('bid-amount-input').should('be.visible')
      cy.getBySel('submit-bid-button').should('be.visible')
    })

    it('should switch to vouch tab and display vouch form fields', () => {
      cy.getBySel('vouch-tab').should('be.visible').click()
      cy.getBySel('vouch-address-input').should('be.visible')
      cy.getBySel('vouch-amount-input').should('be.visible')
      cy.getBySel('vouch-tip-input').should('be.visible')
      cy.getBySel('submit-vouch-button').should('be.visible')
    })

    it('should display the society pot value', () => {
      cy.getBySel('society-pot-value').should('be.visible')
    })

    it('should display the bidders list with existing bids', () => {
      cy.getBySel('bidders-list', { timeout: 15000 }).should('be.visible')
    })
  })

  describe('Place a Bid', () => {
    beforeEach(() => {
      visitBiddersPageWithWallet(testAccounts)
    })

    it('should allow Human to place a bid successfully', () => {
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.getBySel('bid-tab').click()
      cy.getBySel('bid-amount-input').clear().type('1')
      cy.getBySel('submit-bid-button').click()

      cy.approvePendingTransaction()
      expectTransactionSuccess()
    })
  })

  describe('Vouch for Someone', () => {
    beforeEach(() => {
      visitBiddersPageWithWallet(testAccounts)
    })

    it('should allow Member to vouch for an address', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')

      cy.getBySel('vouch-tab').click()

      cy.fixture('accounts').then((accounts) => {
        cy.getBySel('vouch-address-input').clear().type(accounts.dave.address)
      })
      cy.getBySel('vouch-amount-input').clear().type('1')
      cy.getBySel('vouch-tip-input').clear().type('0.1')
      cy.getBySel('submit-vouch-button').click()

      cy.approvePendingTransaction()
      expectTransactionSuccess()
    })

    it('should show error for invalid vouch address', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')

      cy.getBySel('vouch-tab').click()

      cy.getBySel('vouch-address-input').clear().type('invalid-address-123')
      cy.getBySel('vouch-amount-input').clear().type('1')
      cy.getBySel('vouch-tip-input').clear().type('0.1')
      cy.getBySel('submit-vouch-button').click()

      cy.verifyToast('The provided address is not a valid Kusama address')
    })
  })

  describe('Remove a Vouch (Unvouch)', () => {
    beforeEach(() => {
      visitBiddersPageWithWallet(testAccounts)
    })

    it('should allow voucher to remove their vouch', () => {
      cy.connectWallet('Ferdie')
      cy.verifyAccountLevel('Cyborg')

      cy.getBySel('vouch-tab').click()
      cy.fixture('accounts').then((accounts) => {
        cy.getBySel('vouch-address-input').clear().type(accounts.dave.address)
      })
      cy.getBySel('vouch-amount-input').clear().type('1')
      cy.getBySel('vouch-tip-input').clear().type('0.1')
      cy.getBySel('submit-vouch-button').click()

      cy.approvePendingTransaction()
      expectTransactionSuccess()

      cy.getBySel('unvouch-button', { timeout: 15000 }).should('be.visible').click()

      cy.approvePendingTransaction()
      expectTransactionSuccess()
    })
  })

  describe('Account Level Transitions', () => {
    beforeEach(() => {
      visitBiddersPageWithWallet(testAccounts)
    })

    it('should transition from Human to Bidder after placing a bid', () => {
      cy.connectWallet('Dave')

      cy.getBySel('bid-tab').click()
      cy.getBySel('bid-amount-input').clear().type('1')
      cy.getBySel('submit-bid-button').click()

      cy.approvePendingTransaction()
      expectTransactionSuccess()

      cy.task('resetChopsticks')
      cy.visitExplore('bidders')
      cy.verifyAccountLevel('Bidder')
    })

    it('should transition from Bidder to Human after unbid', () => {
      cy.connectWallet('Alice')
      cy.verifyAccountLevel('Bidder')

      cy.getBySel('unbid-button', { timeout: 15000 }).should('be.visible').click()

      cy.approvePendingTransaction()
      expectTransactionSuccess()

      cy.task('resetChopsticks')
      cy.visitExplore('bidders')
      cy.verifyAccountLevel('Human')
    })
  })

  describe('Remove a Bid (Unbid)', () => {
    beforeEach(() => {
      visitBiddersPageWithWallet(testAccounts)
    })

    it('should allow Bidder to remove their bid', () => {
      cy.connectWallet('Alice')
      cy.verifyAccountLevel('Bidder')

      cy.getBySel('unbid-button', { timeout: 15000 }).should('be.visible').click()

      cy.approvePendingTransaction()
      expectTransactionSuccess()
    })

    it('should not show unbid button for non-bidders', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')

      cy.getBySel('bid-tab', { timeout: 15000 }).should('be.visible')
      cy.getBySel('unbid-button').should('not.exist')
    })
  })

  after(() => {
    cy.task('resetChopsticksToFork')
  })
})
