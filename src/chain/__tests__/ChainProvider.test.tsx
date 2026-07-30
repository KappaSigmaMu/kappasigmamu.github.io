import { act, render, screen, waitFor } from '@testing-library/react'
import { WsEvent, type StatusChange } from 'polkadot-api/ws'
import { ChainProvider, ChainState, useAssetHub } from '@/chain/ChainProvider'
import { createChainClient, getTypedApi } from '@/chain/client'

jest.mock('../client', () => ({
  createChainClient: jest.fn(),
  getTypedApi: jest.fn()
}))

const mockCreateChainClient = createChainClient as jest.MockedFunction<typeof createChainClient>
const mockGetTypedApi = getTypedApi as jest.MockedFunction<typeof getTypedApi>

const ConnectionState = () => {
  const { state } = useAssetHub()
  return <div data-testid="connection-state">{ChainState[state]}</div>
}

describe('ChainProvider', () => {
  let changeStatus: (status: StatusChange) => void
  let getFinalizedBlock: jest.Mock
  let destroy: jest.Mock

  beforeEach(() => {
    getFinalizedBlock = jest.fn().mockResolvedValue({})
    destroy = jest.fn()
    mockGetTypedApi.mockReturnValue({} as ReturnType<typeof getTypedApi>)
    mockCreateChainClient.mockImplementation((_chain, onStatusChanged) => {
      changeStatus = onStatusChanged
      return {
        client: { getFinalizedBlock, destroy } as unknown as ReturnType<typeof createChainClient>['client'],
        endpoint: 'ws://rpc.test'
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('checks the chain again and returns to ready after reconnecting', async () => {
    render(
      <ChainProvider chain="assetHub">
        <ConnectionState />
      </ChainProvider>
    )

    await waitFor(() => expect(screen.getByTestId('connection-state')).toHaveTextContent('ready'))
    expect(getFinalizedBlock).toHaveBeenCalledTimes(1)

    act(() => changeStatus({ type: WsEvent.CONNECTING, uri: 'ws://rpc.test' }))
    expect(screen.getByTestId('connection-state')).toHaveTextContent('connecting')

    act(() => changeStatus({ type: WsEvent.CONNECTED, uri: 'ws://rpc.test' }))
    expect(screen.getByTestId('connection-state')).toHaveTextContent('connected')

    await waitFor(() => expect(screen.getByTestId('connection-state')).toHaveTextContent('ready'))
    expect(getFinalizedBlock).toHaveBeenCalledTimes(2)
  })

  it('does not let an obsolete readiness check overwrite a later disconnect', async () => {
    let resolveReconnect: (() => void) | undefined
    getFinalizedBlock
      .mockResolvedValueOnce({})
      .mockImplementationOnce(() => new Promise<void>((resolve) => (resolveReconnect = resolve)))

    render(
      <ChainProvider chain="assetHub">
        <ConnectionState />
      </ChainProvider>
    )

    await waitFor(() => expect(screen.getByTestId('connection-state')).toHaveTextContent('ready'))

    act(() => changeStatus({ type: WsEvent.CONNECTED, uri: 'ws://rpc.test' }))
    act(() => changeStatus({ type: WsEvent.CLOSE, event: new Event('close') }))
    act(() => resolveReconnect?.())

    expect(screen.getByTestId('connection-state')).toHaveTextContent('disconnected')
  })
})
