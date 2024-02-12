import Identicon from '@polkadot/react-identicon'
import { Wallet as WalletType, BaseDotsamaWallet, getWallets, WalletAccount } from '@talismn/connect-wallets'
import { useState } from 'react'
import { Col, Modal } from 'react-bootstrap'
import { FaChevronLeft, FaChevronRight, FaDownload, FaXmark } from 'react-icons/fa6'
import styled from 'styled-components'
import { useKusama } from '../kusama'
import { toastByStatus } from '../pages/explore/helpers'
import NovaWalletLogo from '../static/nova-wallet-logo.svg'

// interface LevelStatusType {
//   [key: string]: string
// }

// const LEVELSTATUS: LevelStatusType = {
//   human: 'WAITING BID',
//   bidder: 'BID SUBMITTED',
//   candidate: 'WAITING POI',
//   cyborg: ''
// }

function Wallets({ show, setShow }: { show: boolean; setShow: (show: boolean) => void }) {
  const { keyring, keyringState } = useKusama()

  const [accounts, setAccounts] = useState<WalletAccount[] | undefined>(undefined)

  const [selectedWallet, setSelectedWallet] = useState<WalletType | undefined>(undefined)
  const wallets = [...getWallets(), new NovaWallet()]

  const handleClose = () => setShow(false)

  if (selectedWallet && keyringState === 'READY') {
    selectedWallet.subscribeAccounts((accounts: WalletAccount[] | undefined) => {
      const mappedAccounts = accounts?.map((account) => ({
        ...account,
        address: keyring.encodeAddress(account.address)
      }))
      setAccounts(mappedAccounts)
    })
  }

  return (
    <>
      <StyledModal show={show} onHide={handleClose} centered scrollable>
        <Modal.Header className="px-4" style={{ borderBottom: '0px' }}>
          <Modal.Title>{!selectedWallet ? 'Wallets' : 'Accounts'}</Modal.Title>
          <FaXmark onClick={() => setShow(false)} role="button" />
        </Modal.Header>
        <Modal.Body className="px-0 py-2">
          {!selectedWallet &&
            wallets.map((wallet) => (
              <Wallet wallet={wallet} setSelectedWallet={setSelectedWallet} key={wallet.title} />
            ))}
          {selectedWallet &&
            accounts &&
            accounts.map((account) => (
              <AccountRow key={account.address}>
                <Col xs={2}>
                  <Identicon value={account.address} size={50} theme={'polkadot'} />
                </Col>
                <Col xs={10}>
                  <span>{account.name}</span>
                  <Address className="text-start mb-1">{account.address}</Address>

                  {/* @TODO: fix me - show the correct level of each account
                  <LevelStatusDiv>
                    <label className="pe-3">JOURNEY: {level.toUpperCase()}</label>
                    <label>{LEVELSTATUS[level]}</label>
                  </LevelStatusDiv> */}
                </Col>
              </AccountRow>
            ))}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '0px' }}>
          {selectedWallet && (
            <Col
              xs={4}
              className="d-flex align-items-center justify-content-end"
              onClick={() => setSelectedWallet(undefined)}
              role="button"
            >
              <WalletLogo src={selectedWallet.logo.src} alt={selectedWallet.logo.alt} size={30} />
              <div>{selectedWallet.title}</div>
              <FaChevronLeft className="mx-2" />
            </Col>
          )}
        </Modal.Footer>
      </StyledModal>
    </>
  )
}

async function handleClick(wallet: WalletType, setSelectedWallet: any) {
  if (!wallet.installed) {
    window.open(wallet.installUrl, '_blank')
    return
  }

  try {
    await wallet.enable(process.env.REACT_APP_NAME)
  } catch (e) {
    toastByStatus['error']((e as Error).message, {})
    return
  }

  setSelectedWallet(wallet)
}

const Wallet = ({ wallet, setSelectedWallet }: { wallet: WalletType; setSelectedWallet: any }) => (
  <WalletRow onClick={async () => handleClick(wallet, setSelectedWallet)}>
    <WalletLogo src={wallet.logo.src} alt={wallet.logo.alt} />
    <div>{wallet.title}</div>
    <div className="ms-auto">
      {wallet.installed ? (
        <label>
          Use <FaChevronRight className="ms-2" />
        </label>
      ) : (
        <label>
          Install <FaDownload className="ms-2" />
        </label>
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

type WalletLogoProps = {
  size?: number
}

const WalletLogo = styled.img<WalletLogoProps>`
  width: ${(props) => (props.size ? `${props.size}px` : '50px')};
  height: ${(props) => (props.size ? `${props.size}px` : '50px')};
  margin-right: 15px;
`

const AccountRow = styled.div`
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

const Address = styled.div`
  color: ${(props) => props.theme.colors.secondary};
  font-size: 12px;
`

// const LevelStatusDiv = styled.div`
//   display: flex;
//   justify-content: space-between;

//   label {
//     color: ${(props) => props.theme.colors.grey};
//     font-weight: 700;
//     font-size: 12px;
//   }
// `

export { Wallets }
