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
      cy.getBySel('bid-tab').should('be.visible')
      cy.getBySel('bid-tab')
        .closest('.nav-link')
        .should('have.class', 'active')
    })

    it('should display bid amount input and submit button', () => {
      cy.getBySel('bid-amount-input').should('be.visible')
      cy.getBySel('submit-bid-btn').should('be.visible')
    })

    it('should switch to vouch tab and display vouch form fields', () => {
      cy.getBySel('vouch-tab').should('be.visible').click()
      cy.getBySel('vouch-address-input').should('be.visible')
      cy.getBySel('vouch-amount-input').should('be.visible')
      cy.getBySel('vouch-tip-input').should('be.visible')
      cy.getBySel('submit-vouch-btn').should('be.visible')
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
      cy.task('resetChopsticks')
      cy.visit('/explore/bidders?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, 'Kusama Society')
      cy.wait(500)
    })

    it('should allow Human to place a bid successfully', () => {
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.visitExplore('bidders')
      cy.getBySel('bid-tab').click()
      cy.getBySel('bid-amount-input').clear().type('1')
      cy.getBySel('submit-bid-btn').click()

      cy.submitTransaction()

      cy.verifyToast('Bid submitted successfully')

      cy.visitExplore('bidders')
      cy.getBySel('bidders-list', { timeout: 15000 }).should('be.visible')
      cy.verifyAccountLevel('Bidder')
    })

    it('should reject a zero amount bid on chain', () => {
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.visitExplore('bidders')
      cy.getBySel('bid-tab').click()
      cy.getBySel('bid-amount-input').clear().type('0')
      cy.getBySel('submit-bid-btn').click()

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
      cy.getBySel('unbid-btn', { timeout: 15000 }).should('be.visible').click()

      cy.submitTransaction()

      cy.verifyToast('Bid removed successfully')

      cy.visitExplore('bidders')
      cy.verifyAccountLevel('Human')
    })

    it('should not show unbid button for non-bidders', () => {
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.visitExplore('bidders')
      cy.getBySel('bidders-list', { timeout: 15000 }).should('be.visible')
      cy.getBySel('unbid-btn').should('not.exist')
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
      cy.getBySel('vouch-tab').click()

      cy.fixture('accounts').then((accounts) => {
        cy.getBySel('vouch-address-input').clear().type(accounts.dave.address)
      })
      cy.getBySel('vouch-amount-input').clear().type('1')
      cy.getBySel('vouch-tip-input').clear().type('0.1')
      cy.getBySel('submit-vouch-btn').click()

      cy.submitTransaction()

      cy.verifyToast('Vouch submitted successfully')

      cy.visitExplore('bidders')
      cy.getBySel('bidders-list', { timeout: 15000 }).should('be.visible')
    })

    it('should show error for invalid vouch address', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')

      cy.visitExplore('bidders')
      cy.getBySel('vouch-tab').click()

      cy.getBySel('vouch-address-input').clear().type('invalid-address-123')
      cy.getBySel('vouch-amount-input').clear().type('1')
      cy.getBySel('vouch-tip-input').clear().type('0.1')
      cy.getBySel('submit-vouch-btn').click()

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
      cy.getBySel('unvouch-btn', { timeout: 15000 }).should('be.visible').click()

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
      cy.getBySel('bid-tab').click()
      cy.getBySel('bid-amount-input').clear().type('1')
      cy.getBySel('submit-bid-btn').click()

      cy.submitTransaction()
      cy.verifyToast('Bid submitted successfully')

      cy.visitExplore('bidders')
      cy.verifyAccountLevel('Bidder')
    })

    it('should transition from Bidder to Human after unbid', () => {
      cy.connectWallet('Alice')
      cy.verifyAccountLevel('Bidder')

      cy.visitExplore('bidders')
      cy.getBySel('unbid-btn', { timeout: 15000 }).should('be.visible').click()

      cy.submitTransaction()
      cy.verifyToast('Bid removed successfully')

      cy.visitExplore('bidders')
      cy.verifyAccountLevel('Human')
    })
  })
})
