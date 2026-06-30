import { getPeopleProviderEndpoints, peopleProductionProviders } from '../peopleProviders'

describe('People chain RPC providers', () => {
  it('uses the ordered production fallback list by default', () => {
    expect(getPeopleProviderEndpoints()).toEqual(peopleProductionProviders.map(({ url }) => url))
    expect(peopleProductionProviders.map(({ name }) => name)).toEqual(['Parity', 'Dwellir'])
  })

  it('uses a query-string override without fallbacks', () => {
    expect(getPeopleProviderEndpoints('ws://localhost:9000')).toEqual(['ws://localhost:9000'])
  })

  it('supports a comma-separated configured fallback list', () => {
    expect(getPeopleProviderEndpoints(null, 'wss://one.example, wss://two.example')).toEqual([
      'wss://one.example',
      'wss://two.example'
    ])
  })
})
