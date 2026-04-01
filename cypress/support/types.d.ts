declare namespace Cypress {
  interface Chainable {
    /**
     * Connect wallet with specified test account.
     * Requires initWallet() to be called before cy.visit().
     * @param accountName - Display name of test account (Alice, Bob, Charlie, Dave, Eve, Ferdie)
     * @example cy.connectWallet('Alice')
     */
    connectWallet(accountName: string): Chainable<void>

    /**
     * Wait for blockchain data to finish loading (spinners disappear).
     * @param timeout - Optional timeout in ms (default 10000)
     * @example cy.waitForBlockchainData()
     */
    waitForBlockchainData(timeout?: number): Chainable<void>

    /**
     * Submit a transaction and wait for on-chain confirmation via toast.
     * Wallet plugin must be configured for auto-approval or tx must be approved manually.
     * @example cy.submitTransaction()
     */
    submitTransaction(): Chainable<void>

    /**
     * Navigate to an explore section with Chopsticks RPC endpoint.
     * Automatically waits for blockchain data to load.
     * @param section - Section name: bidders, candidates, members, payouts, suspended
     * @example cy.visitExplore('bidders')
     */
    visitExplore(section: string): Chainable<void>

    /**
     * Verify the connected account's level badge.
     * @param level - Expected level: Human, Bidder, Candidate, Cyborg
     * @example cy.verifyAccountLevel('Bidder')
     */
    verifyAccountLevel(level: string): Chainable<void>

    /**
     * Verify a toast notification contains the expected message.
     * @param message - Expected toast message text
     * @param timeout - Optional timeout in ms (default 15000)
     * @example cy.verifyToast('Bid submitted successfully')
     */
    verifyToast(message: string, timeout?: number): Chainable<void>
  }
}
