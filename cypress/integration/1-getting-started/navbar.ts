describe('NavBar', () => {
  it('should render navbar', () => {
    cy.get('[alt="KappaSigmaMu Society canary brand"]').should('exist')
    cy.contains('Home').should('have.attr', 'href')
    cy.contains('About').should('have.attr', 'href').and('include', 'about')

    cy.contains('About').click()
    cy.location('pathname').should('eq', `/about`)
    cy.get('h2').should('have.text', 'About')
  })
})
