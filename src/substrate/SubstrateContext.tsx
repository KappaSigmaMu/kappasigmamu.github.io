/* eslint-disable  @typescript-eslint/no-explicit-any */

import { ApiPromise, WsProvider } from '@polkadot/api'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import jsonrpc from '@polkadot/types/interfaces/jsonrpc'
import keyring from '@polkadot/ui-keyring'
import React, { useReducer, useContext } from 'react'
import { config } from './config'

const RPC = { ...jsonrpc, ...config.RPC }
const SOCKET = config.PROVIDER_SOCKET
const TYPES = config.types

const INIT_STATE = {
  api: null,
  apiError: null,
  apiState: null,
  keyring: null,
  keyringState: null,
}

type StateType = {
  api: ApiPromise | null
  apiError: string | null
  apiState: string | null
  keyring: string | null
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
      return { ...state, apiState: 'CONNECTING' }
    case 'CONNECTED':
      return { ...state, api: action.payload, apiState: 'CONNECTED' }
    case 'READY':
      return { ...state, apiState: 'READY' }
    case 'DISCONNECTED':
      return { ...state, apiState: 'DISCONNECTED' }
    case 'KEYRING_LOADING':
      return { ...state, keyringState: 'LOADING' }
    case 'KEYRING_READY':
      return { ...state, keyringState: 'READY', keyring: action.payload }
    case 'KEYRING_ERROR':
      return { ...state, keyringState: 'ERROR', keyring: null }
    case 'ERROR':
      return { ...state, apiState: 'ERROR', apiError: action.payload }
  }
}

function connect(state: StateType, dispatch: React.Dispatch<ActionType>) {
  const { apiState } = state

  if (apiState && apiState !== 'DISCONNECTED') return

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
  const asyncLoadAccounts = async () => {
    dispatch({ type: 'KEYRING_LOADING' })
    try {
      await web3Enable(config.APP_NAME)
      let allAccounts = await web3Accounts()
      allAccounts = allAccounts.map(({ address, meta }) => ({
        address,
        meta: { ...meta, name: `${meta.name} (${meta.source})` },
      }))
      keyring.loadAll(
        { isDevelopment: config.DEVELOPMENT_KEYRING },
        allAccounts,
      )
      console.log(keyring)
      dispatch({ type: 'KEYRING_READY', payload: keyring })
    } catch (e) {
      console.error(e)
      dispatch({ type: 'KEYRING_ERROR' })
    }
  }

  const { keyringState } = state
  if (keyringState) return
  if (loadAccts) return dispatch({ type: 'KEYRING_READY', payload: keyring })

  loadAccts = true
  asyncLoadAccounts()
}

const SubstrateContext = React.createContext<StateType>(INIT_STATE)

function SubstrateContextProvider(props: { children: JSX.Element }) {
  const [state, dispatch] = useReducer(reducer, INIT_STATE)

  connect(state, dispatch)
  loadAccounts(state, dispatch)

  return (
    <SubstrateContext.Provider value={state}>
      {props.children}
    </SubstrateContext.Provider>
  )
}

const useSubstrate = () => ({ ...useContext(SubstrateContext) })

export {
  SubstrateContextProvider,
  useSubstrate,
  reducer,
  INIT_STATE,
  loadAccounts,
}