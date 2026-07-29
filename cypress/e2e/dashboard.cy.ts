const CHOPSTICKS_TASK_TIMEOUT = 120000
const DASHBOARD_URL = '/explore?rpc=ws://localhost:8000'
const DASHBOARD_CARDS = [
  'dashboard-pot',
  'dashboard-bidders',
  'dashboard-candidates',
  'dashboard-proof-of-ink',
  'dashboard-members',
  'dashboard-suspended',
]

const visitDashboard = () => {
  cy.visit(DASHBOARD_URL)
  cy.getBySel('explore-dashboard', { timeout: 20000 }).should('be.visible')
}

describe('Explore Dashboard', () => {
  beforeEach(() => {
    cy.task('resetChopsticksStorage', null, { timeout: CHOPSTICKS_TASK_TIMEOUT })
    visitDashboard()
  })

  it('renders the overview and every dashboard card', () => {
    cy.contains('h1', 'ROUND OVERVIEW').should('be.visible')
    cy.getBySel('dashboard-round').should('contain.text', 'ROUND').and('contain.text', '6')
    cy.getBySel('dashboard-challenge-time')
      .invoke('text')
      .should('match', /\d+d \d+h \d+m \d+s remaining/)

    DASHBOARD_CARDS.forEach((selector) => cy.getBySel(selector).should('be.visible'))
  })

  it('shows the seeded society state and the kickable candidate', () => {
    cy.getBySel('dashboard-pot').should('contain.text', 'Current').and('contain.text', 'Next Update')
    cy.getBySel('dashboard-bidders').should('contain.text', 'Bidders (1)')
    cy.getBySel('dashboard-candidates').should('contain.text', 'Candidates (2)')
    cy.getBySel('dashboard-members').should('contain.text', 'Members (2)')
    cy.getBySel('dashboard-suspended').should('contain.text', 'Suspended Members (1)')
    cy.getBySel('dashboard-candidates').find('[data-test*="candidate-drop-button-"]').should('have.length', 1)
  })

  it('orders member roles and explains the Defender Skeptic warning', () => {
    cy.getBySel('dashboard-members').find('.badge').then(($badges) => {
      expect([...$badges].map((badge) => badge.textContent?.trim())).to.deep.equal([
        'Defender',
        'Defender Skeptic',
        'Candidate Skeptic',
      ])
    })

    cy.getBySel('defender-skeptic-warning').should('be.visible').trigger('mouseover')
    cy.get('#defender-skeptic-warning-tooltip')
      .should('be.visible')
      .and('contain.text', 'become the Defender next round')
  })

  it('shows the indexed Society Head without a warning', () => {
    cy.getBySel('dashboard-proof-of-ink').within(() => {
      cy.getBySel('society-head-badge').should('be.visible').and('contain.text', 'Society Head')
      cy.getBySel('society-head-index', { timeout: 30000 }).should('contain.text', 'Index:')
      cy.getBySel('society-head-index-warning').should('not.exist')
    })
  })

  it('warns when the Society Head has no account index', () => {
    cy.unloadApp()
    cy.task('clearChopsticksIndices', null, { timeout: CHOPSTICKS_TASK_TIMEOUT })
    visitDashboard()

    cy.getBySel('society-head-index', { timeout: 30000 }).should('contain.text', '(index not set)')
    cy.getBySel('society-head-index-warning').should('be.visible').trigger('mouseover')
    cy.get('#society-head-index-warning-tooltip')
      .should('be.visible')
      .and('contain.text', 'has not set up an index yet')
  })

  it('preserves the RPC parameter through dashboard links', () => {
    cy.getBySel('dashboard-pot').contains('a', 'Place bid').click()
    cy.url().should('include', '/explore/bidders').and('include', 'rpc=ws://localhost:8000')
  })
})
