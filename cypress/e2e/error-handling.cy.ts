describe('Error Handling', () => {
  describe('UI Edge Cases', () => {
    it('should render the bidders list read-only without a connected wallet', () => {
      cy.visit('/explore/bidders?rpc=ws://localhost:8000')

      cy.getBySel('bidders-list', { timeout: 20000 }).should('be.visible')
      cy.getBySel('connect-wallet-button').should('be.visible')
      cy.getBySel('account-level').should('not.exist')
    })

    it('should keep the page read-only after a refresh without a wallet', () => {
      cy.visit('/explore/bidders?rpc=ws://localhost:8000')
      cy.getBySel('bidders-list', { timeout: 20000 }).should('be.visible')

      cy.reload()

      cy.getBySel('bidders-list', { timeout: 20000 }).should('be.visible')
      cy.getBySel('connect-wallet-button').should('be.visible')
      cy.getBySel('account-level').should('not.exist')
    })

    it('should load the members list without a connected wallet', () => {
      cy.visit('/explore/members?rpc=ws://localhost:8000')

      cy.getBySel('members-list', { timeout: 20000 }).should('be.visible')
      cy.getBySel('connect-wallet-button').should('be.visible')
    })
  })
})
