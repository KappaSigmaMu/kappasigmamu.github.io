import { ApiPromise, WsProvider } from '@polkadot/api'
import jsonrpc from '@polkadot/types/interfaces/jsonrpc'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import React, { useReducer, useContext } from 'react'
import { config } from './config'

const parsedQuery = queryString.parse(window.location.search)
const connectedSocket = parsedQuery.rpc || config.PROVIDER_SOCKET
console.log(`Connected socket: ${connectedSocket}`)

const INIT_STATE = {
  socket: connectedSocket,
  jsonrpc: { ...jsonrpc, ...config.RPC },
  types: config.types,
  keyring: null,
  keyringState: null,
  api: null,
  apiError: null,
  apiState: null,
}

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'CONNECT_INIT':
      return { ...state, apiState: 'CONNECT_INIT' }

    case 'CONNECT':
      return { ...state, api: action.payload, apiState: 'CONNECTING' }

    case 'CONNECT_SUCCESS':
      return { ...state, apiState: 'READY' }

    case 'CONNECT_ERROR':
      return { ...state, apiState: 'ERROR', apiError: action.payload }

    case 'LOAD_KEYRING':
      return { ...state, keyringState: 'LOADING' }

    case 'SET_KEYRING':
      return { ...state, keyring: action.payload, keyringState: 'READY' }

    case 'KEYRING_ERROR':
      return { ...state, keyring: null, keyringState: 'ERROR' }

    default:
      throw new Error(`Unknown type: ${action.type}`)
  }
}

const connect = (state: any, dispatch: any) => {
  const { apiState, socket, jsonrpc, types } = state

  if (apiState) return

  dispatch({ type: 'CONNECT_INIT' })

  const provider = new WsProvider(socket)
  const _api = new ApiPromise({ provider, types, rpc: jsonrpc })

  _api.on('connected', () => {
    dispatch({ type: 'CONNECT', payload: _api })

    _api.isReady.then(() => dispatch({ type: 'CONNECT_SUCCESS' }))
  })
  _api.on('ready', () => dispatch({ type: 'CONNECT_SUCCESS' }))
  _api.on('error', (err) => dispatch({ type: 'CONNECT_ERROR', payload: err }))
}

const KusamaContext = React.createContext<any>('')

const KusamaContextProvider = (props: any) => {
  const initState: any = { ...INIT_STATE }
  const neededPropNames = ['socket', 'types']
  neededPropNames.forEach((key) => {
    initState[key] =
      typeof props[key] === 'undefined' ? initState[key] : props[key]
  })

  const [state, dispatch] = useReducer(reducer, initState)
  connect(state, dispatch)

  return (
    <KusamaContext.Provider value={state}>
      {props.children}
    </KusamaContext.Provider>
  )
}

KusamaContextProvider.propTypes = {
  socket: PropTypes.string,
  types: PropTypes.object,
}

const useKusama = () => ({ ...useContext(KusamaContext) })

export { KusamaContextProvider, useKusama }
