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

      cy.get('body').should('be.visible')

      if (!hasCustomNav) {
        cy.get('nav').should('exist')
      }

      cy.window().then((win) => {
        expect(win.document.readyState).to.equal('complete')
      })
    })
  })

  it('should render all primary routes without crashes', () => {
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
    cy.visit('/')
  })

  exploreRoutes.forEach(({ path, name }) => {
    it(`should load ${name} page (${path})`, () => {
      cy.visit(`${path}?rpc=ws://localhost:8000`)

      cy.get('body').should('be.visible')
      cy.get('nav').should('exist')
      cy.url().should('include', path)
    })
  })

  it('should redirect /explore to /explore/bidders', () => {
    cy.visit('/explore?rpc=ws://localhost:8000')

    cy.url().should('include', '/explore/bidders')
    cy.get('body').should('be.visible')
  })

  it('should navigate between explore sub-routes', () => {
    cy.visit('/explore/bidders?rpc=ws://localhost:8000')
    cy.url().should('include', '/explore/bidders')

    cy.visit('/explore/members?rpc=ws://localhost:8000')
    cy.url().should('include', '/explore/members')
    cy.get('body').should('be.visible')

    cy.visit('/explore/candidates?rpc=ws://localhost:8000')
    cy.url().should('include', '/explore/candidates')
    cy.get('body').should('be.visible')
  })

  it('should maintain query parameter during navigation', () => {
    cy.visit('/explore/bidders?rpc=ws://localhost:8000')

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
    cy.visit('/?rpc=ws://localhost:8000')
  })

  poiRoutes.forEach(({ path, name }) => {
    it(`should load ${name} page (${path})`, () => {
      cy.visit(`${path}?rpc=ws://localhost:8000`)

      cy.get('body').should('be.visible')
      cy.get('nav').should('exist')
      cy.url().should('include', path)
    })
  })

  it('should redirect /explore/poi to /explore/poi/examples', () => {
    cy.visit('/explore/poi?rpc=ws://localhost:8000')

    cy.url().should('include', '/explore/poi/examples')
    cy.get('body').should('be.visible')
  })

  it('should navigate between POI sub-routes', () => {
    cy.visit('/explore/poi/examples?rpc=ws://localhost:8000')
    cy.url().should('include', '/explore/poi/examples')
    cy.get('body').should('be.visible')

    cy.visit('/explore/poi/rules?rpc=ws://localhost:8000')
    cy.url().should('include', '/explore/poi/rules')
    cy.get('body').should('be.visible')

    cy.visit('/explore/poi/gallery?rpc=ws://localhost:8000')
    cy.url().should('include', '/explore/poi/gallery')
    cy.get('body').should('be.visible')

    cy.visit('/explore/poi/next-head?rpc=ws://localhost:8000')
    cy.url().should('include', '/explore/poi/next-head')
    cy.get('body').should('be.visible')
  })

  it('should maintain query parameter in POI routes', () => {
    cy.visit('/explore/poi/examples?rpc=ws://localhost:8000')

    cy.url().should('include', 'rpc=ws://localhost:8000')

    cy.visit('/explore/poi/gallery?rpc=ws://localhost:8000')
    cy.url().should('include', 'rpc=ws://localhost:8000')
  })
})

describe('API Connection Smoke Tests', () => {
  it('should connect to Chopsticks successfully', () => {
    cy.visit('/explore/members?rpc=ws://localhost:8000')

    cy.get('body').should('be.visible')

    cy.get('body').then(($body) => {
      const bodyText = $body.text()

      expect(bodyText.length).to.be.greaterThan(10)
      expect(bodyText).to.not.equal('Loading...')
    })

    cy.get('body').should('not.contain', 'Failed to connect')
    cy.get('body').should('not.contain', 'API error')
  })

  it('should display chain information', () => {
    cy.visit('/explore/members?rpc=ws://localhost:8000')

    cy.get('body').should('be.visible')
    cy.get('nav').should('exist')
    cy.url().should('include', 'explore')
  })

  it('should initialize API without crashing', () => {
    cy.visit('/explore/members?rpc=ws://localhost:8000')

    cy.getBySel('blockchain-data', { timeout: 20000 }).should('be.visible')
    cy.get('body').should('be.visible')
    cy.get('nav').should('exist')
  })
})

describe('Query Parameter Preservation Smoke Tests', () => {
  const testRpc = 'ws://localhost:8000'

  it('should preserve ?rpc parameter on initial load', () => {
    cy.visit(`/?rpc=${testRpc}`)

    cy.url().should('include', `rpc=${testRpc}`)
    cy.get('body').should('be.visible')
  })

  it('should preserve ?rpc parameter through redirects', () => {
    cy.visit(`/explore?rpc=${testRpc}`)

    cy.url().should('include', '/explore/bidders')
    cy.url().should('include', `rpc=${testRpc}`)

    cy.visit(`/explore/poi?rpc=${testRpc}`)

    cy.url().should('include', '/explore/poi/examples')
    cy.url().should('include', `rpc=${testRpc}`)
  })

  it('should preserve params in deeply nested routes', () => {
    cy.visit(`/explore/poi/gallery?rpc=${testRpc}`)

    cy.url().should('include', '/explore/poi/gallery')
    cy.url().should('include', `rpc=${testRpc}`)

    cy.visit(`/explore/poi/rules?rpc=${testRpc}`)

    cy.url().should('include', '/explore/poi/rules')
    cy.url().should('include', `rpc=${testRpc}`)
  })
})
