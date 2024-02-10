import { Wallet as WalletType, BaseDotsamaWallet, getWallets } from '@talismn/connect-wallets'
import { Modal } from 'react-bootstrap'
import { FaChevronRight, FaDownload, FaXmark } from 'react-icons/fa6'
import styled from 'styled-components'
import NovaWalletLogo from '../static/nova-wallet-logo.svg'

function Wallets({ show, setShow }: { show: boolean; setShow: (show: boolean) => void }) {
  const handleClose = () => setShow(false)

  const wallets = [...getWallets(), new NovaWallet()]

  return (
    <>
      <StyledModal show={show} onHide={handleClose} centered>
        <Modal.Header className="px-4" style={{ borderBottom: '0px' }}>
          <Modal.Title>Wallets</Modal.Title>
          <FaXmark onClick={() => setShow(false)} style={{ cursor: 'pointer' }} />
        </Modal.Header>
        <Modal.Body className="px-0 py-2">
          {wallets.map((wallet) => (
            <Wallet wallet={wallet} key={wallet.title} />
          ))}
        </Modal.Body>
      </StyledModal>
    </>
  )
}

function handleClick(wallet: WalletType) {
  console.info(wallet)
  console.info(wallet.installed)
  // wallet.installed ? enable() : openInstallUrl(wallet.installUrl)
}

const Wallet = ({ wallet }: { wallet: WalletType }) => (
  <WalletRow onClick={() => handleClick(wallet)}>
    <WalletLogo src={wallet.logo.src} alt={wallet.logo.alt} />
    <div>{wallet.title}</div>
    <div className="ms-auto">
      {wallet.installed ? (
        <>
          Select
          <FaChevronRight className="ms-2" />
        </>
      ) : (
        <>
          Download
          <FaDownload className="ms-2" />
        </>
      )}
    </div>
  </WalletRow>
)

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

const StyledModal = styled(Modal)`
  .modal-content {
    background-color: ${(props) => props.theme.colors.darkGrey};
  }
`

const WalletLogo = styled.img`
  width: 50px;
  height: 50px;
  margin-right: 15px;
`

const WalletRow = styled.div`
  display: flex;
  align-items: center;
  padding-block: 1rem;
  padding-inline: 2rem;
  cursor: pointer;
  color: ${(props) => props.theme.colors.primary} !important;

  &:hover {
    background-color: ${(props) => props.theme.colors.lightGrey};
  }
`

export { Wallets }
