import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

describe('Member Operations', () => {
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

  describe('Members List UI', () => {
    beforeEach(() => {
      cy.visit('/explore/members?rpc=ws://localhost:8000')
      cy.getBySel('members-list', { timeout: 20000 }).should('be.visible')
    })

    it('should display the members list', () => {
      cy.getBySel('members-list').should('be.visible')
    })

    it('should display member rows', () => {
      cy.getBySelLike('member-row-').should('have.length.gte', 1)
    })

    it('should display strikes for each member', () => {
      cy.getBySelLike('member-strikes-').should('have.length.gte', 1)
    })

    it('should display member badges', () => {
      cy.getBySelLike('member-badges-').should('have.length.gte', 1)
    })

    it('should highlight high strikes with red color', () => {
      cy.getBySelLike('member-strikes-').each(($el) => {
        const strikesText = $el.find('span').first().text().trim()
        const strikesCount = parseInt(strikesText, 10)
        if (strikesCount > 5) {
          cy.wrap($el).find('span').first().should('have.css', 'color', 'rgb(255, 0, 0)')
        }
      })
    })

    it('should not show defender vote buttons when wallet is not connected', () => {
      cy.getBySel('defender-approve-button').should('not.exist')
      cy.getBySel('defender-reject-button').should('not.exist')
    })
  })

  describe('Member Details Panel', () => {
    beforeEach(() => {
      cy.visit('/explore/members?rpc=ws://localhost:8000')
      cy.getBySel('members-list', { timeout: 20000 }).should('be.visible')
    })

    it('should open member details when clicking on a member', () => {
      cy.getBySelLike('member-row-').first()
        .find('.text-truncate')
        .first()
        .click()
      cy.get('.offcanvas.show', { timeout: 10000 }).should('be.visible')
    })
  })

  describe('Defender Voting', () => {
    beforeEach(() => {
      cy.visit('/explore/members?rpc=ws://localhost:8000')
      cy.getBySel('members-list', { timeout: 20000 }).should('be.visible')
      cy.initWallet(testAccounts, Cypress.env('app_name'))
    })

    it('should show defender vote buttons for Cyborg members', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')

      cy.getBySel('defender-section', { timeout: 15000 }).should('exist')
      cy.getBySel('defender-approve-button').should('have.length.gte', 1)
      cy.getBySel('defender-reject-button').should('have.length.gte', 1)
    })

    it('should not show defender vote buttons for non-members', () => {
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.getBySel('defender-approve-button').should('not.exist')
      cy.getBySel('defender-reject-button').should('not.exist')
    })

    it('should allow member to approve defender', () => {
      cy.connectWallet('Ferdie')
      cy.verifyAccountLevel('Cyborg')

      cy.getBySel('defender-approve-button', { timeout: 15000 }).first().click()

      cy.approvePendingTransaction()
      cy.task('resetChopsticks', null, { timeout: 120000 })
      cy.contains(/vote sent/i, { timeout: 30000 }).should('be.visible')
    })

    it('should allow member to reject defender', () => {
      cy.connectWallet('Ferdie')
      cy.verifyAccountLevel('Cyborg')

      cy.getBySel('defender-reject-button', { timeout: 15000 }).first().click()

      cy.approvePendingTransaction()
      cy.task('resetChopsticks', null, { timeout: 120000 })
      cy.contains(/vote sent/i, { timeout: 30000 }).should('be.visible')
    })

    it('should show Voted badge after voting on defender', () => {
      cy.connectWallet('Ferdie')
      cy.verifyAccountLevel('Cyborg')

      cy.getBySel('defender-approve-button', { timeout: 15000 }).first().click()

      cy.approvePendingTransaction()
      cy.task('resetChopsticks', null, { timeout: 120000 })
      cy.contains(/vote sent/i, { timeout: 30000 }).should('be.visible')

      cy.visitExplore('members')

      cy.contains('Voted', { timeout: 15000 }).should('be.visible')
    })
  })

  after(() => {
    cy.task('resetChopsticksToFork')
  })
})
