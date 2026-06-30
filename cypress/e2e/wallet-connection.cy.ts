import { InjectedAccountWitMnemonic } from '@chainsafe/cypress-polkadot-wallet/dist/types'

describe('Wallet Connection UI Flow', () => {
  beforeEach(() => {
    cy.visit('/explore?rpc=ws://localhost:8000')
    cy.getBySel('blockchain-data', { timeout: 20000 }).should('be.visible')
  })

  it('should display Connect Wallet button', () => {
    cy.contains('button', /connect/i)
      .should('be.visible')
      .and('contain.text', 'Connect Wallet')
  })

  it('should open wallet selection modal when Connect Wallet is clicked', () => {
    cy.contains('button', /connect/i).should('be.visible').click()

    cy.getBySel('wallet-modal').should('be.visible')
    cy.get('.modal-title').should('contain.text', 'Wallets')
    cy.contains('Polkadot').should('be.visible')
  })

  it('should have data-test attributes on wallet components', () => {
    cy.contains('button', /connect/i).should('be.visible').click()

    cy.getBySel('wallet-modal').should('be.visible')
    cy.getBySel('wallet-polkadot').should('exist')
    cy.getBySel('disconnect-button').should('exist')
  })

  it('should close modal when X is clicked', () => {
    cy.contains('button', /connect/i).should('be.visible').click()

    cy.getBySel('wallet-modal').should('be.visible')
    cy.get('.modal-header').find('[role="button"]').click()
    cy.get('.modal-content').should('not.exist')
  })

  it('should display disconnect option in modal footer', () => {
    cy.contains('button', /connect/i).should('be.visible').click()

    cy.getBySel('disconnect-button')
      .should('be.visible')
      .and('contain.text', 'Disconnect')
  })
})

describe('Wallet Configuration Verification', () => {
  it('should have correct Cypress configuration for blockchain operations', () => {
    cy.wrap(Cypress.config('defaultCommandTimeout')).should('eq', 10000)
    cy.wrap(Cypress.config('requestTimeout')).should('eq', 15000)
    cy.wrap(Cypress.config('responseTimeout')).should('eq', 15000)
  })

  it('should have retry configuration', () => {
    const retries = Cypress.config('retries')
    cy.wrap(retries).should('deep.equal', { runMode: 1, openMode: 0 })
  })
})

describe('Connect Wallet with Plugin', () => {
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

  beforeEach(() => {
    cy.visit('/explore/bidders?rpc=ws://localhost:8000')
    cy.initWallet(testAccounts, Cypress.env('app_name'))
    cy.getBySel('blockchain-data', { timeout: 20000 }).should('be.visible')
  })

  describe('Connect Wallet Flow', () => {
    it('should connect wallet successfully with test account', () => {
      cy.getBySel('connect-wallet-button').should('be.visible').click()
      cy.getBySel('wallet-modal').should('be.visible')
      cy.getBySel('wallet-polkadot').should('be.visible').click()
      cy.getBySel('account-switcher', { timeout: 10000 }).should('be.visible')
      cy.contains('[data-test="account-switcher"]', 'Alice', { timeout: 10000 }).click()
      cy.get('[role="dialog"]', { timeout: 10000 }).should('not.exist')
      cy.getBySel('account-balance').should('be.visible')
    })

    it('should disconnect wallet', () => {
      cy.connectWallet('Alice')

      cy.getBySel('account-balance').parents('button').click()
      cy.getBySel('disconnect-button').should('be.visible').click()

      cy.contains('button', /connect/i).should('be.visible')
      cy.getBySel('account-balance').should('not.exist')
    })

    it('should persist wallet across page refresh', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')

      cy.reload()

      cy.getBySel('account-balance', { timeout: 15000 }).should('be.visible')
    })
  })

  describe('Account Level Detection', () => {
    it('should show Human level for accounts with no society role (Dave)', () => {
      cy.connectWallet('Dave')
      cy.verifyAccountLevel('Human')
    })

    it('should show Bidder level for accounts with active bid (Alice)', () => {
      cy.connectWallet('Alice')
      cy.verifyAccountLevel('Bidder')
    })

    it('should show Candidate level for candidate accounts (Bob)', () => {
      cy.connectWallet('Bob')
      cy.verifyAccountLevel('Candidate')
    })

    it('should show Cyborg level for member accounts (Eve)', () => {
      cy.connectWallet('Eve')
      cy.verifyAccountLevel('Cyborg')
    })
  })
})
