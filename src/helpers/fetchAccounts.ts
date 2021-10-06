import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'
import keyring from '@polkadot/ui-keyring'
import { config } from '../kusama/config'

const fetchAccounts = (
  setAccounts: (accounts: { name: string | undefined; address: string }[]) => void,
  setActiveAccount: (account: { name: string | undefined; address: string }) => void,
) => {
  async function _fetchAccounts() {
    try {
      await web3Enable(config.APP_NAME)
      let allAccounts = await web3Accounts()
      allAccounts = allAccounts.map(({ address, meta }) => ({
        address,
        meta: { ...meta, name: `${meta.name} (${meta.source})` },
      }))

      keyring.loadAll({ ss58Format: 42, type: 'sr25519' })

      const accounts = allAccounts.map((account) => ({
        name: account.meta.name,
        address: account.address,
      }))

      setAccounts(accounts)
      localStorage.setItem("accounts", JSON.stringify(accounts))

      setActiveAccount(accounts[0])
      localStorage.setItem("activeAccount", JSON.stringify(accounts[0]))
    } catch (e) {
      console.error(e)
    }
  }

  _fetchAccounts()
}

export { fetchAccounts }
