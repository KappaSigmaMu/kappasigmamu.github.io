declare namespace Cypress {
  interface Chainable {
    getBySel(selector: string, ...args: any[]): Chainable<JQuery<HTMLElement>>
    getBySelLike(selector: string, ...args: any[]): Chainable<JQuery<HTMLElement>>
    connectWallet(accountName: string): Chainable<void>
    approvePendingTransaction(): Chainable<void>
    waitForTransactionInclusion(options?: { timeout?: number }): Chainable<null>
    submitTransaction(): Chainable<void>
    visitExplore(section: string): Chainable<void>
    verifyAccountLevel(level: string, timeout?: number): Chainable<void>
    verifyToast(message: string, timeout?: number): Chainable<void>
    verifyTxError(message?: string | RegExp, timeout?: number): Chainable<void>
    unloadApp(): Chainable<void>
    resetChopsticksStorage(options?: { timeout?: number }): Chainable<void>
  }
}
