import React from 'react'
import ReactDOM from 'react-dom'
import { App } from './pages/App'
import { reportWebVitals } from './reportWebVitals'

import keyring from '@polkadot/ui-keyring'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { config } from './kusama/config'

import './styles/bootstrap.scss'

cryptoWaitReady().then(async () => {
  await web3Enable(config.APP_NAME)
  let allAccounts = await web3Accounts()
  allAccounts = allAccounts.map(({ address, meta }) => ({
    address,
    meta: { ...meta, name: meta.name },
  }))

  const kusamaPrefix = 2
  const genericPrefix = 42

  const prefix = config.DEVELOPMENT_KEYRING ? genericPrefix : kusamaPrefix

  keyring.loadAll({ ss58Format: prefix, type: 'ed25519', isDevelopment: config.DEVELOPMENT_KEYRING }, allAccounts)

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root'),
  )
})


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
