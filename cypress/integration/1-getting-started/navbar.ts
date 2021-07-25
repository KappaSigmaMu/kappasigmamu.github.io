describe('NavBar', () => {
  it('should render navbar', () => {
    cy.get('[alt="KappaSigmaMu"]').should('exist')

    cy.contains('Kusama Network').should('have.attr', 'href')
    cy.contains('About').should('have.attr', 'href').and('include', 'about')
    cy.contains('Blog').should('have.attr', 'href')
    cy.contains('Cyborg Journey').should('have.attr', 'href')

    cy.contains('About').click()
    cy.location('pathname').should('eq', `/about`)
    cy.get('h2').should('have.text', 'About')
  })
})
