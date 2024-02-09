import { WalletAggregator } from '@polkadot-onboard/core'
import { InjectedWalletProvider } from '@polkadot-onboard/injected-wallets'
import { PolkadotWalletsContextProvider } from '@polkadot-onboard/react'

const WalletProvider = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  const walletAggregator = new WalletAggregator([new InjectedWalletProvider({}, process.env.REACT_APP_NAME)])

  return <PolkadotWalletsContextProvider walletAggregator={walletAggregator}>{children}</PolkadotWalletsContextProvider>
}

export { WalletProvider }
