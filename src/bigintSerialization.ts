
declare global {
  interface BigInt {
    toJSON(): string
  }
}

// JSON.stringify throws on bigint, which PAPI uses for all balances. This crashes
// React 19's dev-mode performance-track logging whenever props contain bigint arrays
// (JSON.stringify inside addValueToProperties) and any wallet that serializes
// payloads. Serializing as a decimal string is lossless for display purposes.
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
