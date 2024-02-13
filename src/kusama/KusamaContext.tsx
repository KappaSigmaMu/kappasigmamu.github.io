import { ApiPromise, WsProvider } from '@polkadot/api'
import jsonrpc from '@polkadot/types/interfaces/jsonrpc'
import React, { useReducer, useContext } from 'react'
import { LoadingContainer } from '../components/LoadingContainer'

const RPC = { ...jsonrpc, ...process.env.REACT_APP_RPC }

const queryParams = new URLSearchParams(window.location.search)
const overrideProviderSocket = queryParams.get('rpc')

const SOCKET = overrideProviderSocket ? overrideProviderSocket : process.env.REACT_APP_PROVIDER_SOCKET

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
  apiState: ApiState.initializing
}

export type StateType = {
  api: ApiPromise | null
  apiError: string | null
  apiState: ApiState
}

type ActionType =
  | { type: 'CONNECTING' }
  | { type: 'CONNECTED'; payload: ApiPromise }
  | { type: 'READY' }
  | { type: 'DISCONNECTED' }
  | { type: 'ERROR'; payload: any }

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
    case 'ERROR':
      return { ...state, apiState: ApiState.error, apiError: action.payload }
  }
}

function connect(state: StateType, dispatch: React.Dispatch<ActionType>) {
  const { apiState } = state

  if (apiState !== ApiState.initializing) return

  dispatch({ type: 'CONNECTING' })

  const provider = new WsProvider(SOCKET)
  const api = new ApiPromise({ provider, rpc: RPC })

  api.on('connected', () => {
    dispatch({ type: 'CONNECTED', payload: api })
  })
  api.on('disconnected', () => dispatch({ type: 'DISCONNECTED' }))
  api.on('error', (err) => dispatch({ type: 'ERROR', payload: err }))
  api.on('ready', () => dispatch({ type: 'READY' }))
}

const KusamaContext = React.createContext<StateType>(INIT_STATE)

function KusamaContextProvider(props: { children: JSX.Element | JSX.Element[] }) {
  const [state, dispatch] = useReducer(reducer, INIT_STATE)

  connect(state, dispatch)

  return (
    <KusamaContext.Provider value={state}>
      <LoadingContainer state={state} />

      {props.children}
    </KusamaContext.Provider>
  )
}

const useKusama = () => {
  return { ...useContext(KusamaContext) }
}

export { KusamaContextProvider, useKusama, ApiState }
