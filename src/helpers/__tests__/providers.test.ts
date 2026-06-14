import { getProviderEndpoints, productionProviders } from '../providers'

describe('RPC providers', () => {
  it('uses the ordered production fallback list by default', () => {
    expect(getProviderEndpoints()).toEqual(productionProviders.map(({ url }) => url))
    expect(productionProviders.slice(0, 3).map(({ name }) => name)).toEqual(['Parity', 'Dwellir', 'Dotters'])
    expect(productionProviders.at(-1)?.name).toBe('IBP (legacy)')
  })

  it('uses a query-string override without fallbacks', () => {
    expect(getProviderEndpoints('ws://localhost:8000')).toEqual(['ws://localhost:8000'])
  })

  it('supports a comma-separated configured fallback list', () => {
    expect(getProviderEndpoints(null, 'wss://one.example, wss://two.example')).toEqual([
      'wss://one.example',
      'wss://two.example'
    ])
  })
})
