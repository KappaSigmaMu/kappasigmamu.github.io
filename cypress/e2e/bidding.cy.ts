import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

describe('Bidding Operations', () => {
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

  describe('Bidders Page UI', () => {
    beforeEach(() => {
      cy.visit('/explore/bidders?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.wait(1000)
    })

    it('should load the bidders page with bid tab active by default', () => {
      cy.get('[data-testid="bid-tab"]').should('be.visible')
      cy.get('[data-testid="bid-tab"]')
        .closest('.nav-link')
        .should('have.class', 'active')
    })

    it('should display bid amount input and submit button', () => {
      cy.get('[data-testid="bid-amount-input"]').should('be.visible')
      cy.get('[data-testid="submit-bid-btn"]').should('be.visible')
    })

    it('should switch to vouch tab and display vouch form fields', () => {
      cy.get('[data-testid="vouch-tab"]').should('be.visible').click()
      cy.get('[data-testid="vouch-address-input"]').should('be.visible')
      cy.get('[data-testid="vouch-amount-input"]').should('be.visible')
      cy.get('[data-testid="vouch-tip-input"]').should('be.visible')
      cy.get('[data-testid="submit-vouch-btn"]').should('be.visible')
    })

    it('should display the society pot value', () => {
      cy.get('[data-testid="society-pot-value"]').should('be.visible')
    })

    it('should display the bidders list with existing bids', () => {
      cy.get('[data-testid="bidders-list"]', { timeout: 15000 }).should('be.visible')
    })
  })

  describe('Place a Bid', () => {
    beforeEach(() => {
      cy.task('resetChopsticks')
      cy.visit('/explore/bidders?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, 'Kusama Society')
      cy.wait(500)
    })

    it('should allow Human to place a bid successfully', () => {
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.visitExplore('bidders')
      cy.get('[data-testid="bid-tab"]').click()
      cy.get('[data-testid="bid-amount-input"]').clear().type('1')
      cy.get('[data-testid="submit-bid-btn"]').click()

      cy.submitTransaction()

      cy.verifyToast('Bid submitted successfully')

      cy.visitExplore('bidders')
      cy.get('[data-testid="bidders-list"]', { timeout: 15000 }).should('be.visible')
      cy.verifyAccountLevel('Bidder')
    })

    it('should reject a zero amount bid on chain', () => {
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.visitExplore('bidders')
      cy.get('[data-testid="bid-tab"]').click()
      cy.get('[data-testid="bid-amount-input"]').clear().type('0')
      cy.get('[data-testid="submit-bid-btn"]').click()

      cy.contains(/awaiting signature/i, { timeout: 10000 }).should('be.visible')
      cy.getTxRequests().then((txRequests) => {
        const txIds = Object.keys(txRequests)
        if (txIds.length > 0) {
          cy.approveTx(Number(txIds[txIds.length - 1]))
        }
      })

      cy.get('.go2072408551', { timeout: 30000 }).should('exist')
    })
  })

  describe('Remove a Bid (Unbid)', () => {
    beforeEach(() => {
      cy.task('resetChopsticks')
      cy.visit('/explore/bidders?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, 'Kusama Society')
      cy.wait(500)
    })

    it('should allow Bidder to remove their bid', () => {
      cy.connectWallet('Alice')
      cy.verifyAccountLevel('Bidder')

      cy.visitExplore('bidders')
      cy.get('[data-testid="unbid-btn"]', { timeout: 15000 }).should('be.visible').click()

      cy.submitTransaction()

      cy.verifyToast('Bid removed successfully')

      cy.visitExplore('bidders')
      cy.verifyAccountLevel('Human')
    })

    it('should not show unbid button for non-bidders', () => {
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.visitExplore('bidders')
      cy.get('[data-testid="bidders-list"]', { timeout: 15000 }).should('be.visible')
      cy.get('[data-testid="unbid-btn"]').should('not.exist')
    })
  })

  describe('Vouch for Someone', () => {
    beforeEach(() => {
      cy.task('resetChopsticks')
      cy.visit('/explore/bidders?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, 'Kusama Society')
      cy.wait(500)
    })

    it('should allow Member to vouch for an address', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')

      cy.visitExplore('bidders')
      cy.get('[data-testid="vouch-tab"]').click()

      cy.fixture('accounts').then((accounts) => {
        cy.get('[data-testid="vouch-address-input"]').clear().type(accounts.dave.address)
      })
      cy.get('[data-testid="vouch-amount-input"]').clear().type('1')
      cy.get('[data-testid="vouch-tip-input"]').clear().type('0.1')
      cy.get('[data-testid="submit-vouch-btn"]').click()

      cy.submitTransaction()

      cy.verifyToast('Vouch submitted successfully')

      cy.visitExplore('bidders')
      cy.get('[data-testid="bidders-list"]', { timeout: 15000 }).should('be.visible')
    })

    it('should show error for invalid vouch address', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')

      cy.visitExplore('bidders')
      cy.get('[data-testid="vouch-tab"]').click()

      cy.get('[data-testid="vouch-address-input"]').clear().type('invalid-address-123')
      cy.get('[data-testid="vouch-amount-input"]').clear().type('1')
      cy.get('[data-testid="vouch-tip-input"]').clear().type('0.1')
      cy.get('[data-testid="submit-vouch-btn"]').click()

      cy.verifyToast('The provided address is not a valid Kusama address')
    })
  })

  describe('Remove a Vouch (Unvouch)', () => {
    beforeEach(() => {
      cy.task('resetChopsticks')
      cy.visit('/explore/bidders?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, 'Kusama Society')
      cy.wait(500)
    })

    it('should allow voucher to remove their vouch', () => {
      cy.connectWallet('Ferdie')
      cy.verifyAccountLevel('Cyborg')

      cy.visitExplore('bidders')
      cy.get('[data-testid="unvouch-btn"]', { timeout: 15000 }).should('be.visible').click()

      cy.submitTransaction()

      cy.verifyToast('Vouch removed successfully')
    })
  })

  describe('Account Level Transitions', () => {
    beforeEach(() => {
      cy.task('resetChopsticks')
      cy.visit('/explore/bidders?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, 'Kusama Society')
      cy.wait(500)
    })

    it('should transition from Human to Bidder after placing a bid', () => {
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.visitExplore('bidders')
      cy.get('[data-testid="bid-tab"]').click()
      cy.get('[data-testid="bid-amount-input"]').clear().type('1')
      cy.get('[data-testid="submit-bid-btn"]').click()

      cy.submitTransaction()
      cy.verifyToast('Bid submitted successfully')

      cy.visitExplore('bidders')
      cy.verifyAccountLevel('Bidder')
    })

    it('should transition from Bidder to Human after unbid', () => {
      cy.connectWallet('Alice')
      cy.verifyAccountLevel('Bidder')

      cy.visitExplore('bidders')
      cy.get('[data-testid="unbid-btn"]', { timeout: 15000 }).should('be.visible').click()

      cy.submitTransaction()
      cy.verifyToast('Bid removed successfully')

      cy.visitExplore('bidders')
      cy.verifyAccountLevel('Human')
    })
  })
})
