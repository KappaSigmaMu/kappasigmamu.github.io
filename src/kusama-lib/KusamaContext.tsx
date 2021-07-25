import { ApiPromise, WsProvider } from '@polkadot/api'
import jsonrpc from '@polkadot/types/interfaces/jsonrpc'
import React, { useReducer, useContext } from 'react'
import { config } from './config'

const RPC = { ...jsonrpc, ...config.RPC }
const SOCKET = config.PROVIDER_SOCKET
const TYPES = config.types

const INIT_STATE = {
  api: null,
  apiError: null,
  apiState: null,
}

type StateType = {
  api: ApiPromise | null
  apiError: string | null
  apiState: string | null
}

type ActionType =
  | { type: "CONNECTING" }
  | { type: "CONNECTED"; payload: ApiPromise }
  | { type: "READY" }
  | { type: "DISCONNECTED" }
  | { type: "ERROR"; payload: any }

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

const KusamaContext = React.createContext<StateType>(INIT_STATE)

function KusamaContextProvider(props: { children: JSX.Element }) {
  const [state, dispatch] = useReducer(reducer, INIT_STATE)

  connect(state, dispatch)

  return (
    <KusamaContext.Provider value={state}>
      {props.children}
    </KusamaContext.Provider>
  )
}

const useKusama = () => ({ ...useContext(KusamaContext) })

export { KusamaContextProvider, useKusama }
