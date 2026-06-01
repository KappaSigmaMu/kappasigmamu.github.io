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

describe('Candidate Voting', () => {
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

  describe('Candidates List UI', () => {
    beforeEach(() => {
      cy.visit('/explore/candidates?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.getBySel('candidates-list', { timeout: 20000 }).should('be.visible')
    })

    it('should display the candidates list', () => {
      cy.getBySel('candidates-list').should('be.visible')
    })

    it('should display candidate rows for Bob and Charlie', () => {
      cy.getBySelLike('candidate-row-').should('have.length', 2)
    })

    it('should display vote tally for each candidate', () => {
      cy.getBySelLike('vote-tally-').should('have.length', 2)
      cy.getBySelLike('vote-tally-').first()
        .should('contain.text', 'approvals')
        .and('contain.text', 'rejections')
    })

    it('should not show vote buttons when wallet is not connected', () => {
      cy.getBySelLike('candidate-approve-button-').should('not.exist')
      cy.getBySelLike('candidate-reject-button-').should('not.exist')
    })
  })

  describe('Candidate Details Panel', () => {
    beforeEach(() => {
      cy.visit('/explore/candidates?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.getBySel('candidates-list', { timeout: 20000 }).should('be.visible')
    })

    it('should open candidate details when clicking on a candidate', () => {
      cy.getBySelLike('candidate-row-').first()
        .find('.text-truncate')
        .click({ force: true })
      cy.get('.offcanvas.show', { timeout: 10000 }).should('be.visible')
      cy.get('.offcanvas.show').contains('Candidate').should('be.visible')
    })
  })

  describe('Vote on Candidate', () => {
    beforeEach(() => {
      cy.visit('/explore/candidates?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.wait(1000)
    })

    it('should show vote buttons for Cyborg members', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')

      cy.getBySelLike('candidate-approve-button-', { timeout: 15000 }).should('have.length.gte', 1)
      cy.getBySelLike('candidate-reject-button-').should('have.length.gte', 1)
    })

    it('should not show vote buttons for non-members', () => {
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')

      cy.getBySelLike('candidate-approve-button-').should('not.exist')
      cy.getBySelLike('candidate-reject-button-').should('not.exist')
    })

    it('should allow member to approve a candidate', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')

      cy.getBySelLike('candidate-approve-button-', { timeout: 15000 }).first().click({ force: true })

      waitForTxAndApprove()

      cy.contains(/finalized|success|sent/i, { timeout: 30000 }).should('be.visible')
    })

    it('should allow member to reject a candidate', () => {
      cy.connectWallet('Ferdie')
      cy.verifyAccountLevel('Cyborg')

      cy.getBySelLike('candidate-reject-button-', { timeout: 15000 }).last().click({ force: true })

      waitForTxAndApprove()

      cy.contains(/finalized|success|sent/i, { timeout: 30000 }).should('be.visible')
    })

    it('should show Voted badge after voting', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')

      cy.getBySelLike('candidate-approve-button-', { timeout: 15000 }).first().click({ force: true })

      waitForTxAndApprove()

      cy.contains(/finalized|success|sent/i, { timeout: 30000 }).should('be.visible')

      cy.task('resetChopsticks')
      cy.visitExplore('candidates')

      cy.getBySelLike('candidate-voted-badge-', { timeout: 15000 })
        .should('be.visible')
        .and('contain.text', 'Voted')
    })
  })

  describe('Drop Candidate', () => {
    beforeEach(() => {
      cy.visit('/explore/candidates?rpc=ws://localhost:8000', { timeout: 20000 })
      cy.initWallet(testAccounts, Cypress.env('app_name'))
      cy.wait(1000)
    })

    it('should not show drop button when conditions are not met', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')

      cy.getBySel('candidates-list', { timeout: 15000 }).should('be.visible')
      cy.getBySelLike('candidate-drop-button-').should('not.exist')
    })
  })

  after(() => {
    cy.task('resetChopsticksToFork')
  })
})
