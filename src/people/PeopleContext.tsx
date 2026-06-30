import { ApiPromise, WsProvider } from '@polkadot/api'
import jsonrpc from '@polkadot/types/interfaces/jsonrpc'
import React, { useReducer, useContext } from 'react'
import { getPeopleProviderEndpoints } from '../helpers/peopleProviders'

const RPC = { ...jsonrpc, ...process.env.REACT_APP_RPC }

const queryParams = new URLSearchParams(window.location.search)
const overridePeopleProviderSocket = queryParams.get('peopleRpc')

const PEOPLE_SOCKETS = getPeopleProviderEndpoints(
  overridePeopleProviderSocket,
  process.env.REACT_APP_PEOPLE_PROVIDER_SOCKET
)

enum PeopleApiState {
  initializing,
  connecting,
  connected,
  disconnected,
  error,
  ready
}

const INIT_STATE: StateType = {
  peopleApi: null,
  peopleApiError: null,
  peopleApiState: PeopleApiState.initializing,
  activePeopleProviderEndpoint: null
}

export type StateType = {
  peopleApi: ApiPromise | null
  peopleApiError: string | null
  peopleApiState: PeopleApiState
  activePeopleProviderEndpoint: string | null
}

type ActionType =
  | { type: 'CONNECTING' }
  | { type: 'CONNECTED'; payload: { peopleApi: ApiPromise; endpoint: string } }
  | { type: 'READY' }
  | { type: 'DISCONNECTED' }
  | { type: 'ERROR'; payload: any }

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case 'CONNECTING':
      return { ...state, peopleApiState: PeopleApiState.connecting }
    case 'CONNECTED':
      return {
        ...state,
        peopleApi: action.payload.peopleApi,
        peopleApiState: PeopleApiState.connected,
        activePeopleProviderEndpoint: action.payload.endpoint
      }
    case 'READY':
      return { ...state, peopleApiState: PeopleApiState.ready }
    case 'DISCONNECTED':
      return { ...state, peopleApiState: PeopleApiState.disconnected }
    case 'ERROR':
      return { ...state, peopleApiState: PeopleApiState.error, peopleApiError: action.payload }
  }
}

function connect(state: StateType, dispatch: React.Dispatch<ActionType>) {
  const { peopleApiState } = state

  if (peopleApiState !== PeopleApiState.initializing) return

  dispatch({ type: 'CONNECTING' })

  const provider = new WsProvider(PEOPLE_SOCKETS)
  const peopleApi = new ApiPromise({ provider, rpc: RPC })

  peopleApi.on('connected', () => {
    dispatch({ type: 'CONNECTED', payload: { peopleApi, endpoint: provider.endpoint } })
  })
  peopleApi.on('disconnected', () => dispatch({ type: 'DISCONNECTED' }))
  peopleApi.on('error', (err) => dispatch({ type: 'ERROR', payload: err }))
  peopleApi.on('ready', () => dispatch({ type: 'READY' }))
}

const PeopleContext = React.createContext<StateType>(INIT_STATE)

function PeopleContextProvider(props: { children: JSX.Element | JSX.Element[] }) {
  const [state, dispatch] = useReducer(reducer, INIT_STATE)

  connect(state, dispatch)

  return <PeopleContext.Provider value={state}>{props.children}</PeopleContext.Provider>
}

const usePeople = () => {
  return { ...useContext(PeopleContext) }
}

export { PeopleContextProvider, usePeople, PeopleApiState }
