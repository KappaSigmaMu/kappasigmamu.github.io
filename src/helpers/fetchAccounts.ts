import keyring from '@polkadot/ui-keyring'

const fetchAccounts = (
  setAccounts: (accounts: { name: string | undefined; address: string }[]) => void,
  setActiveAccount: (account: { name: string | undefined; address: string }) => void,
) => {
  async function _fetchAccounts() {
    try {
      const accounts = keyring.getAccounts().map((account) => ({
        name: account.meta.name,
        address: keyring.encodeAddress(account.address),
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
