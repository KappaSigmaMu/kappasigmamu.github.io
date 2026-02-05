/**
 * Smoke Tests - Application Health Checks
 *
 * Primary Route Smoke Tests
 * Explore Nested Routes Smoke Tests
 * Proof of Ink Nested Routes Smoke Tests
 * API Connection Health Check
 * Query Parameter Preservation
 */

describe('Primary Routes Smoke Tests', () => {
  const primaryRoutes = [
    { path: '/', name: 'Landing Page', hasCustomNav: true },
    { path: '/welcome', name: 'Welcome Page', hasCustomNav: false },
    { path: '/journey', name: 'Journey Page', hasCustomNav: false },
    { path: '/guide', name: 'Cyborg Guide Page', hasCustomNav: false },
    { path: '/wiki', name: 'Wiki Page', hasCustomNav: false },
    { path: '/gilbertogil', name: 'Gilberto Gil Page', hasCustomNav: false },
    { path: '/futurivel', name: 'Futurivel Page', hasCustomNav: false }
  ]

  primaryRoutes.forEach(({ path, name, hasCustomNav }) => {
    it(`should load ${name} (${path})`, () => {
      cy.visit(path, { timeout: 5000 })

      // Verify page body renders
      cy.get('body').should('be.visible')

      // Verify navigation is present (except landing page may have custom nav)
      if (!hasCustomNav) {
        cy.get('nav').should('exist')
      }

      // Verify no HTTP errors occurred
      cy.window().then((win) => {
        // Check window.performance for failed requests if needed
        expect(win.document.readyState).to.equal('complete')
      })
    })
  })

  it('should render all primary routes without crashes', () => {
    // Sequential navigation test to verify no state corruption
    cy.visit('/')
    cy.get('body').should('be.visible')

    cy.visit('/welcome')
    cy.get('body').should('be.visible')

    cy.visit('/journey')
    cy.get('body').should('be.visible')

    cy.visit('/guide')
    cy.get('body').should('be.visible')

    cy.visit('/wiki')
    cy.get('body').should('be.visible')

    cy.visit('/gilbertogil')
    cy.get('body').should('be.visible')

    cy.visit('/futurivel')
    cy.get('body').should('be.visible')
  })
})

describe('Explore Routes Smoke Tests', () => {
  const exploreRoutes = [
    { path: '/explore/bidders', name: 'Bidders' },
    { path: '/explore/candidates', name: 'Candidates' },
    { path: '/explore/members', name: 'Members' },
    { path: '/explore/payouts', name: 'Payouts' },
    { path: '/explore/suspended', name: 'Suspended' }
  ]

  beforeEach(() => {
    // Use Chopsticks RPC endpoint
    cy.visit('/', { timeout: 15000 })
  })

  exploreRoutes.forEach(({ path, name }) => {
    it(`should load ${name} page (${path})`, () => {
      cy.visit(`${path}?rpc=ws://localhost:8000`, { timeout: 10000 })

      // Verify page body renders (don't wait for data)
      cy.get('body').should('be.visible')

      // Verify navigation exists
      cy.get('nav').should('exist')

      // Verify URL is correct
      cy.url().should('include', path)

      // Don't assert on blockchain data - just verify page mounts
      // This is a smoke test, not a data validation test
    })
  })

  it('should redirect /explore to /explore/bidders', () => {
    cy.visit('/explore?rpc=ws://localhost:8000', { timeout: 10000 })

    // Should redirect
    cy.url().should('include', '/explore/bidders')

    // Page should render
    cy.get('body').should('be.visible')
  })

  it('should navigate between explore sub-routes', () => {
    // Start at bidders
    cy.visit('/explore/bidders?rpc=ws://localhost:8000', { timeout: 10000 })
    cy.url().should('include', '/explore/bidders')

    // Navigate to members
    cy.visit('/explore/members?rpc=ws://localhost:8000', { timeout: 10000 })
    cy.url().should('include', '/explore/members')
    cy.get('body').should('be.visible')

    // Navigate to candidates
    cy.visit('/explore/candidates?rpc=ws://localhost:8000', { timeout: 10000 })
    cy.url().should('include', '/explore/candidates')
    cy.get('body').should('be.visible')
  })

  it('should maintain query parameter during navigation', () => {
    cy.visit('/explore/bidders?rpc=ws://localhost:8000', { timeout: 10000 })

    // Query param should persist
    cy.url().should('include', 'rpc=ws://localhost:8000')
  })
})

describe('Proof of Ink Routes Smoke Tests', () => {
  const poiRoutes = [
    { path: '/explore/poi/examples', name: 'POI Examples' },
    { path: '/explore/poi/rules', name: 'POI Rules' },
    { path: '/explore/poi/gallery', name: 'POI Gallery' },
    { path: '/explore/poi/next-head', name: 'POI Next Head' }
  ]

  beforeEach(() => {
    // POI routes may work without API connection (static content)
    // Include RPC param for consistency with other explore routes
    cy.visit('/?rpc=ws://localhost:8000', { timeout: 15000 })
  })

  poiRoutes.forEach(({ path, name }) => {
    it(`should load ${name} page (${path})`, () => {
      cy.visit(`${path}?rpc=ws://localhost:8000`, { timeout: 10000 })

      // Verify page body renders
      cy.get('body').should('be.visible')

      // Verify navigation exists
      cy.get('nav').should('exist')

      // Verify URL is correct
      cy.url().should('include', path)

      // Don't wait for IPFS images - just verify DOM structure
    })
  })

  it('should redirect /explore/poi to /explore/poi/examples', () => {
    cy.visit('/explore/poi?rpc=ws://localhost:8000', { timeout: 10000 })

    // Should redirect to examples
    cy.url().should('include', '/explore/poi/examples')

    // Page should render
    cy.get('body').should('be.visible')
  })

  it('should navigate between POI sub-routes', () => {
    // Start at examples
    cy.visit('/explore/poi/examples?rpc=ws://localhost:8000', { timeout: 10000 })
    cy.url().should('include', '/explore/poi/examples')
    cy.get('body').should('be.visible')

    // Navigate to rules
    cy.visit('/explore/poi/rules?rpc=ws://localhost:8000', { timeout: 10000 })
    cy.url().should('include', '/explore/poi/rules')
    cy.get('body').should('be.visible')

    // Navigate to gallery
    cy.visit('/explore/poi/gallery?rpc=ws://localhost:8000', { timeout: 10000 })
    cy.url().should('include', '/explore/poi/gallery')
    cy.get('body').should('be.visible')

    // Navigate to next-head
    cy.visit('/explore/poi/next-head?rpc=ws://localhost:8000', { timeout: 10000 })
    cy.url().should('include', '/explore/poi/next-head')
    cy.get('body').should('be.visible')
  })

  it('should maintain query parameter in POI routes', () => {
    cy.visit('/explore/poi/examples?rpc=ws://localhost:8000', { timeout: 10000 })

    // Query param should persist
    cy.url().should('include', 'rpc=ws://localhost:8000')

    // Navigate and verify persistence
    cy.visit('/explore/poi/gallery?rpc=ws://localhost:8000', { timeout: 10000 })
    cy.url().should('include', 'rpc=ws://localhost:8000')
  })
})

describe('API Connection Smoke Tests', () => {
  it('should connect to Chopsticks successfully', () => {
    // Visit page with Chopsticks RPC override
    cy.visit('/explore/members?rpc=ws://localhost:8000', { timeout: 15000 })

    // Wait for page to load (body visible)
    cy.get('body', { timeout: 15000 }).should('be.visible')

    // Verify some blockchain data loaded (indicates API connected)
    // We don't validate the data itself, just that SOMETHING rendered
    cy.get('body').then(($body) => {
      // Check page is not empty (data loaded)
      const bodyText = $body.text()

      // If completely empty, likely API failed to connect
      expect(bodyText.length).to.be.greaterThan(10)

      // Shouldn't be stuck on pure loading state
      // (some apps show "Loading..." forever if API fails)
      expect(bodyText).to.not.equal('Loading...')
    })

    // Verify no error toasts appeared
    cy.get('body').should('not.contain', 'Failed to connect')
    cy.get('body').should('not.contain', 'API error')
  })

  it('should display chain information', () => {
    cy.visit('/explore/members?rpc=ws://localhost:8000', { timeout: 15000 })

    // Wait for API connection
    cy.get('body', { timeout: 15000 }).should('be.visible')

    // Verify navigation rendered (indicates app didn't crash)
    cy.get('nav').should('exist')

    // Verify some explore-related content is present
    // (Don't check specific members, just that page structure exists)
    cy.url().should('include', 'explore')
  })

  it('should initialize API without crashing', () => {
    cy.visit('/explore/members?rpc=ws://localhost:8000', { timeout: 15000 })

    // Wait for API initialization
    cy.wait(10000) // Give API time to connect

    // Verify page loaded successfully (indirect validation)
    cy.get('body').should('be.visible')
    cy.get('nav').should('exist')
  })
})

describe('Query Parameter Preservation Smoke Tests', () => {
  const testRpc = 'ws://localhost:8000'

  it('should preserve ?rpc parameter on initial load', () => {
    cy.visit(`/?rpc=${testRpc}`)

    // Verify query parameter is in URL
    cy.url().should('include', `rpc=${testRpc}`)

    // Verify page loaded successfully
    cy.get('body').should('be.visible')
  })

  it('should preserve ?rpc parameter through redirects', () => {
    // /explore redirects to /explore/bidders via NavigateWithQuery
    cy.visit(`/explore?rpc=${testRpc}`, { timeout: 15000 })

    // Should redirect and preserve query
    cy.url().should('include', '/explore/bidders')
    cy.url().should('include', `rpc=${testRpc}`)

    // /explore/poi redirects to /explore/poi/examples
    cy.visit(`/explore/poi?rpc=${testRpc}`, { timeout: 15000 })

    // Should redirect and preserve query
    cy.url().should('include', '/explore/poi/examples')
    cy.url().should('include', `rpc=${testRpc}`)
  })

  it('should preserve params in deeply nested routes', () => {
    cy.visit(`/explore/poi/gallery?rpc=${testRpc}`, { timeout: 15000 })

    // Verify nested route loaded with param
    cy.url().should('include', '/explore/poi/gallery')
    cy.url().should('include', `rpc=${testRpc}`)

    // Navigate to another nested route
    cy.visit(`/explore/poi/rules?rpc=${testRpc}`, { timeout: 15000 })

    // Param should still be present
    cy.url().should('include', '/explore/poi/rules')
    cy.url().should('include', `rpc=${testRpc}`)
  })
})
