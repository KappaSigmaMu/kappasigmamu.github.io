/* eslint-disable  @typescript-eslint/no-explicit-any */

import { ApiPromise, WsProvider } from '@polkadot/api'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import jsonrpc from '@polkadot/types/interfaces/jsonrpc'
import keyring from '@polkadot/ui-keyring'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import React, { useReducer, useContext } from 'react'
import { config } from './config'

const RPC = { ...jsonrpc, ...config.RPC }
const SOCKET = config.PROVIDER_SOCKET
const TYPES = config.types

enum ApiState {
  initializing,
  connecting,
  connected,
  disconnected,
  error,
  ready
}

const INIT_STATE: StateType = {
  api: null,
  apiError: null,
  apiState: ApiState.initializing,
  keyring: null,
  keyringState: null,
}

type StateType = {
  api: ApiPromise | null
  apiError: string | null
  apiState: ApiState
  keyring: any | null
  keyringState: string | null
}

type ActionType =
  | { type: 'CONNECTING' }
  | { type: 'CONNECTED'; payload: ApiPromise }
  | { type: 'READY' }
  | { type: 'DISCONNECTED' }
  | { type: 'ERROR'; payload: any }
  | { type: 'KEYRING_LOADING' }
  | { type: 'KEYRING_ERROR' }
  | { type: 'KEYRING_READY'; payload: any }

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'CONNECTING':
      return { ...state, apiState: ApiState.connecting }
    case 'CONNECTED':
      return { ...state, api: action.payload, apiState: ApiState.connected }
    case 'READY':
      return { ...state, apiState: ApiState.ready }
    case 'DISCONNECTED':
      return { ...state, apiState: ApiState.disconnected }
    case 'KEYRING_LOADING':
      return { ...state, keyringState: 'LOADING' }
    case 'KEYRING_READY':
      return { ...state, keyringState: 'READY', keyring: action.payload }
    case 'KEYRING_ERROR':
      return { ...state, keyringState: 'ERROR', keyring: null }
    case 'ERROR':
      return { ...state, apiState: ApiState.error, apiError: action.payload }
  }
}

function connect(state: StateType, dispatch: React.Dispatch<ActionType>) {
  const { apiState } = state

  if (apiState !== ApiState.initializing && apiState !== ApiState.disconnected) return

  dispatch({ type: 'CONNECTING' })

  const provider = new WsProvider(SOCKET)
  const api = new ApiPromise({ provider, types: TYPES, rpc: RPC })

  api.on('connected', () => {
    dispatch({ type: 'CONNECTED', payload: api })
    api.isReady.then(() => dispatch({ type: 'READY' }))
  })
  api.on('disconnected', () => dispatch({ type: 'DISCONNECTED' }))
  api.on('error', (err) => dispatch({ type: 'ERROR', payload: err }))
  api.on('ready', () => dispatch({ type: 'READY' }))
}

let loadAccts = false
function loadAccounts(state: StateType, dispatch: React.Dispatch<ActionType>) {
  let _keyring = keyring

  const asyncLoadAccounts = async () => {
    await cryptoWaitReady()

    dispatch({ type: 'KEYRING_LOADING' })
    try {
      await web3Enable(config.APP_NAME)
      let allAccounts = await web3Accounts()
      allAccounts = allAccounts.map(({ address, meta }) => ({
        address,
        meta: { ...meta, name: `${meta.name} (${meta.source})` },
      }))

      const kusamaPrefix = 2
      const genericPrefix = 42

      const prefix = config.DEVELOPMENT_KEYRING ? genericPrefix : kusamaPrefix

      keyring.loadAll(
        {
          isDevelopment: config.DEVELOPMENT_KEYRING,
          ss58Format: prefix,
          type: 'ed25519',
          genesisHash: state?.api?.genesisHash
        },
        allAccounts,
      )
      _keyring = keyring
      dispatch({ type: 'KEYRING_READY', payload: _keyring })
    } catch (e) {
      console.error(e)
      dispatch({ type: 'KEYRING_ERROR' })
    }
  }

  const { keyringState, apiState } = state
  if (keyringState || apiState != ApiState.ready) return
  if (loadAccts) return dispatch({ type: 'KEYRING_READY', payload: _keyring })

  loadAccts = true
  asyncLoadAccounts()
}

const KusamaContext = React.createContext<StateType>(INIT_STATE)

function KusamaContextProvider(props: { children: JSX.Element | JSX.Element[] }) {
  const [state, dispatch] = useReducer(reducer, INIT_STATE)

  connect(state, dispatch)
  loadAccounts(state, dispatch)

  return <KusamaContext.Provider value={state}>{props.children}</KusamaContext.Provider>
}

const useKusama = () => {
  return { ...useContext(KusamaContext) }
}

export { KusamaContextProvider, useKusama, ApiState }
