declare namespace Cypress {
  interface Chainable {
    connectWallet(accountName: string): Chainable<void>
    waitForBlockchainData(timeout?: number): Chainable<void>
    submitTransaction(): Chainable<void>
    visitExplore(section: string): Chainable<void>
    verifyAccountLevel(level: string): Chainable<void>
    verifyToast(message: string, timeout?: number): Chainable<void>
  }
}
