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

const wallets = [...getWallets(), new NovaWallet()]

export { wallets }
