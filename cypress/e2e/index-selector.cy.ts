import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

const CHOPSTICKS_TASK_TIMEOUT = 120000
const EXPLORE_URL = '/explore?rpc=ws://localhost:8000'

// Seeded in config/kusama.yml: index 0 is frozen to Eve; all other indices are free after reset.
const SEEDED_CLAIMED_INDEX = 0
const AVAILABLE_INDEX = 1

const visitExplore = () => {
  cy.visit(EXPLORE_URL)
  cy.getBySel('blockchain-data', { timeout: 20000 }).should('be.visible')
  cy.getBySel('explore-dashboard', { timeout: 20000 }).should('be.visible')
}

const visitExploreWithWallet = (testAccounts: InjectedAccountWitMnemonic[]) => {
  visitExplore()
  cy.initWallet(testAccounts, Cypress.expose('app_name'))
  cy.getBySel('blockchain-data', { timeout: 20000 }).should('be.visible')
}

const openIndexSelector = () => {
  cy.getBySel('index-selector-button', { timeout: 10000 }).should('be.visible').click()
  cy.getBySel('index-selector-modal', { timeout: 10000 }).should('be.visible')
  cy.getBySel('index-list', { timeout: 30000 }).should('be.visible')
}

const selectAvailableIndex = (index = AVAILABLE_INDEX) => {
  cy.getBySel(`index-row-${index}`, { timeout: 30000 }).should('be.visible').click()
  cy.getBySel('selected-index-summary').should('contain.text', `ID: ${index}`)
}

describe('Account Index Selector', () => {
  let testAccounts: InjectedAccountWitMnemonic[]

  before(() => {
    cy.fixture('accounts').then((accounts) => {
      testAccounts = Object.values(accounts).map((acc: any) => ({
        address: acc.address,
        name: acc.name,
        type: acc.type,
        mnemonic: acc.mnemonic
      }))
    })
  })

  describe('Modal UI', () => {
    beforeEach(() => {
      cy.resetChopsticksStorage({ timeout: CHOPSTICKS_TASK_TIMEOUT })
      visitExplore()
    })

    it('opens from the navbar warning button', () => {
      openIndexSelector()
      cy.contains('.modal-title', 'Select Account Index').should('be.visible')
      cy.getBySel('index-deposit').should('be.visible')

      cy.getBySel('index-process-help').should('be.visible').click()
      cy.getBySel('index-process-hint').should('be.visible').and('contain.text', 'claim')
    })

    it('lists available indices and hides claimed ones by default', () => {
      openIndexSelector()

      cy.getBySel('only-available-checkbox').should('be.checked')
      cy.getBySel(`index-row-${AVAILABLE_INDEX}`).should('be.visible').and('contain.text', 'Available')
      cy.getBySel(`index-row-${SEEDED_CLAIMED_INDEX}`).should('not.exist')
    })

    it('shows claimed indices when only-available is unchecked', () => {
      openIndexSelector()

      cy.getBySel('only-available-checkbox').uncheck({ force: true })
      cy.getBySel(`index-row-${SEEDED_CLAIMED_INDEX}`)
        .should('be.visible')
        .and('contain.text', 'Frozen')
      cy.getBySel(`index-row-${AVAILABLE_INDEX}`).should('be.visible').and('contain.text', 'Available')
    })

    it('paginates showing a full page of available indices, shifted around claimed ones', () => {
      openIndexSelector()

      cy.getBySel('index-page-first').should('be.disabled')
      cy.getBySel('index-page-prev').should('be.disabled')
      cy.getBySel('index-row-0').should('not.exist')
      cy.getBySel('index-row-1').should('be.visible')
      cy.getBySel('index-row-100', { timeout: 10000 }).should('be.visible')

      cy.getBySel('index-page-next').click()
      cy.getBySel('index-row-101', { timeout: 10000 }).should('be.visible')
      cy.getBySel('index-row-1').should('not.exist')
      cy.getBySel('index-row-100').should('not.exist')

      cy.getBySel('index-page-first').should('not.be.disabled').click()
      cy.getBySel('index-row-1').should('be.visible')
    })

    it('keeps claim and freeze disabled until an available index is selected', () => {
      openIndexSelector()

      cy.getBySel('claim-index-button').should('be.disabled')
      cy.getBySel('freeze-index-button').should('be.disabled')
      cy.getBySel('index-wallet-hint').should('be.visible')

      selectAvailableIndex()
      // Still disabled without a connected wallet / signer
      cy.getBySel('claim-index-button').should('be.disabled')
      cy.getBySel('freeze-index-button').should('be.disabled')
    })

    it('closes when the close control is clicked', () => {
      openIndexSelector()
      cy.getBySel('index-selector-close').click()
      cy.getBySel('index-selector-modal').should('not.exist')
    })
  })

  describe('Claim and Freeze Transactions', () => {
    beforeEach(() => {
      cy.resetChopsticksStorage({ timeout: CHOPSTICKS_TASK_TIMEOUT })
      visitExploreWithWallet(testAccounts)
    })

    it('enables claim for an available index after connecting a wallet', () => {
      cy.connectWallet('Dave')
      openIndexSelector()
      selectAvailableIndex()

      cy.getBySel('claim-index-button').should('not.be.disabled')
      cy.getBySel('freeze-index-button').should('be.disabled')
    })

    it('claims then freezes an available index', () => {
      cy.connectWallet('Dave')
      openIndexSelector()
      selectAvailableIndex()

      cy.getBySel('claim-index-button').should('not.be.disabled').click()
      cy.approvePendingTransaction()
      cy.waitForTransactionInclusion({ timeout: CHOPSTICKS_TASK_TIMEOUT })

      cy.getBySel('freeze-index-button', { timeout: 30000 }).should('not.be.disabled')
      cy.getBySel('free-index-button').should('not.be.disabled')
      cy.getBySel('claim-index-button').should('be.disabled')
      cy.getBySel(`index-row-${AVAILABLE_INDEX}`, { timeout: 30000 }).should('contain.text', 'Yours')

      cy.getBySel('freeze-index-button').click()
      cy.approvePendingTransaction()
      cy.waitForTransactionInclusion({ timeout: CHOPSTICKS_TASK_TIMEOUT })

      // After freeze, buttons are replaced by the owned frozen index card
      cy.getBySel('owned-frozen-index', { timeout: 30000 })
        .should('be.visible')
        .and('contain.text', `ID: ${AVAILABLE_INDEX}`)
      cy.getBySel('claim-index-button').should('not.exist')
      cy.getBySel('freeze-index-button').should('not.exist')
      cy.getBySel('free-index-button').should('not.exist')
    })

    it('does not allow claiming an already claimed index', () => {
      cy.connectWallet('Dave')
      openIndexSelector()

      cy.getBySel('only-available-checkbox').uncheck({ force: true })
      cy.getBySel(`index-row-${SEEDED_CLAIMED_INDEX}`).should('be.visible').click()
      cy.getBySel('selected-index-summary').should('contain.text', `ID: ${SEEDED_CLAIMED_INDEX}`)
      cy.getBySel('selected-index-summary').should('contain.text', 'permanently frozen to its owner')
      cy.getBySel('claim-index-button').should('not.exist')
      cy.getBySel('freeze-index-button').should('not.exist')
      cy.getBySel('free-index-button').should('not.exist')
    })

    it('shows the frozen index and hides claim/freeze when the account already has one', () => {
      cy.connectWallet('Eve')
      openIndexSelector()

      cy.getBySel('owned-frozen-index', { timeout: 30000 })
        .should('be.visible')
        .and('contain.text', `ID: ${SEEDED_CLAIMED_INDEX}`)
      cy.getBySel('claim-index-button').should('not.exist')
      cy.getBySel('freeze-index-button').should('not.exist')
      cy.getBySel('free-index-button').should('not.exist')
    })
  })
})
