
declare global {
  interface BigInt {
    toJSON(): string
  }
}

if (typeof BigInt.prototype.toJSON !== 'function') {
  Object.defineProperty(BigInt.prototype, 'toJSON', {
    value: function toJSON(this: bigint) {
      return this.toString()
    },
    configurable: true,
    writable: true
  })
}

export {}
