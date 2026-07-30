import type { PolkadotSigner, Transaction, TxEvent } from 'polkadot-api'
import { Subject } from 'rxjs'
import { submitTx, type StatusChangeHandler } from '@/chain/society/tx'

const signer = {} as PolkadotSigner
const txHash = '0x1234'

const event = (value: object): TxEvent => value as TxEvent

describe('submitTx', () => {
  it('shows the waiting state as soon as the transaction is signed', () => {
    const events = new Subject<TxEvent>()
    const onStatusChange = jest.fn() as jest.MockedFunction<StatusChangeHandler>
    const tx = { signSubmitAndWatch: jest.fn(() => events) } as unknown as Transaction

    void submitTx(tx, signer, { finalizedText: 'Finalized.', onStatusChange })
    events.next(event({ type: 'signed', txHash }))

    expect(onStatusChange).toHaveBeenNthCalledWith(1, {
      loading: true,
      message: 'Awaiting signature...',
      status: 'loading'
    })
    expect(onStatusChange).toHaveBeenNthCalledWith(2, {
      loading: true,
      message: 'Request sent. Waiting for response...',
      status: 'loading'
    })
  })

  it('settles on inclusion without returning to loading while finalization is delayed', async () => {
    const events = new Subject<TxEvent>()
    const onStatusChange = jest.fn() as jest.MockedFunction<StatusChangeHandler>
    const tx = { signSubmitAndWatch: jest.fn(() => events) } as unknown as Transaction
    let resolved = false

    const completion = submitTx(tx, signer, { finalizedText: 'Finalized.', onStatusChange }).then(() => {
      resolved = true
    })

    events.next(event({ type: 'signed', txHash }))
    await Promise.resolve()
    expect(resolved).toBe(false)

    events.next(
      event({
        type: 'txBestBlocksState',
        txHash,
        found: true,
        ok: true,
        events: [],
        block: { hash: '0xabcd', number: 1, index: 0 }
      })
    )
    await completion

    expect(resolved).toBe(true)
    expect(onStatusChange).toHaveBeenLastCalledWith({
      loading: false,
      message: 'Transaction submitted.',
      status: 'success'
    })
    expect(events.observed).toBe(false)

    // These are representative events the watcher can produce while the
    // included block is still waiting to be finalized.
    events.next(event({ type: 'txBestBlocksState', txHash, found: false, isValid: true }))
    events.next(event({ type: 'broadcasted', txHash }))
    events.next(
      event({
        type: 'finalized',
        txHash,
        ok: true,
        events: [],
        block: { hash: '0xabcd', number: 1, index: 0 }
      })
    )

    expect(onStatusChange).toHaveBeenCalledTimes(3)
    expect(onStatusChange.mock.calls.slice(2)).not.toContainEqual([
      expect.objectContaining({ status: 'loading' })
    ])
  })

  it('reports a failed inclusion and settles immediately', async () => {
    const events = new Subject<TxEvent>()
    const onStatusChange = jest.fn() as jest.MockedFunction<StatusChangeHandler>
    const tx = { signSubmitAndWatch: jest.fn(() => events) } as unknown as Transaction
    const completion = submitTx(tx, signer, { finalizedText: 'Finalized.', onStatusChange })

    events.next(
      event({
        type: 'txBestBlocksState',
        txHash,
        found: true,
        ok: false,
        events: [],
        block: { hash: '0xabcd', number: 1, index: 0 },
        dispatchError: { type: 'Module', value: { type: 'BadOrigin' } }
      })
    )
    await completion

    expect(onStatusChange).toHaveBeenLastCalledWith({
      loading: false,
      message: 'Module.BadOrigin',
      status: 'error'
    })
    expect(events.observed).toBe(false)
  })
})
