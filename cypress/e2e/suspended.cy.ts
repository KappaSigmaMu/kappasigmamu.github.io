describe('Suspended Members', () => {
  beforeEach(() => {
    cy.visit('/explore/suspended?rpc=ws://localhost:8000')
  })

  it('should display the seeded suspended member', () => {
    cy.contains('Suspended Member', { timeout: 20000 }).should('be.visible')
    cy.contains('No suspended members').should('not.exist')
    cy.get('.text-truncate')
      .filter((_i, el) => /^[1-9A-HJ-NP-Za-km-z]{46,48}$/.test(el.textContent?.trim() || ''))
      .should('have.length', 1)
  })

  it('should list exactly one suspended member', () => {
    cy.get('.badge', { timeout: 20000 }).filter(':contains("Suspended Member")').should('have.length', 1)
  })
})
