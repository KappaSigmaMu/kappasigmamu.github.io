declare namespace Cypress {
  interface Chainable {
    getBySel(selector: string, ...args: any[]): Chainable<JQuery<HTMLElement>>
    getBySelLike(selector: string, ...args: any[]): Chainable<JQuery<HTMLElement>>
    connectWallet(accountName: string): Chainable<void>
    waitForBlockchainData(timeout?: number): Chainable<void>
    submitTransaction(): Chainable<void>
    visitExplore(section: string): Chainable<void>
    verifyAccountLevel(level: string): Chainable<void>
    verifyToast(message: string, timeout?: number): Chainable<void>
  }
}
