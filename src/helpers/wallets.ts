import { BaseDotsamaWallet, getWallets } from '@talismn/connect-wallets'
import NovaWalletLogo from '../static/nova-wallet-logo.svg'

class NovaWallet extends BaseDotsamaWallet {
  public extensionName = 'polkadot-js'
  public title = 'Nova Wallet'
  public installUrl = 'https://novawallet.io'
  public logo = {
    src: NovaWalletLogo,
    alt: 'Nova Wallet Logo'
  }
  public get installed() {
    const injectedExtension = (window as any)?.injectedWeb3?.[this.extensionName]
    const isNovaWallet = (window as any)?.walletExtension?.isNovaWallet

    return !!(injectedExtension && isNovaWallet)
  }
}

// Define supported wallet extensions to ensure compatibility.
// We introduced the SUPPORTED_WALLETS constant to filter out unsupported wallets returned by getWallets(),
// reducing the risk of errors from untested or incompatible wallets.
const SUPPORTED_WALLETS = ['talisman', 'subwallet-js', 'polkadot-js', 'enkrypt', 'polkagate']

const filteredWallets = getWallets().filter(({ extensionName }) => SUPPORTED_WALLETS.includes(extensionName))

const wallets = [...filteredWallets, new NovaWallet()]

export { wallets }
