import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import keyring from '@polkadot/ui-keyring'
import { config } from './config'

async function loadAccounts() {
  const asyncLoadAccounts = async () => {
    try {
      await web3Enable(config.APP_NAME)
      let allAccounts = await web3Accounts()
      allAccounts = allAccounts.map(({ address, meta }) => ({
        address,
        meta: { ...meta, name: `${meta.name} (${meta.source})` },
      }))
      keyring.loadAll(
        { isDevelopment: false },
        allAccounts,
      )

    } catch (e) {
      console.error(e)
    }
  }

  await asyncLoadAccounts()

  const keyringOptions = keyring.getPairs().map((account: any) => ({
    key: account.address,
    value: account.address,
    text: account.meta.name.toUpperCase(),
}))

  return keyringOptions
}

export { loadAccounts }
