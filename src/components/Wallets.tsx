import Identicon from '@polkadot/react-identicon'
import { Wallet as WalletType, BaseDotsamaWallet, getWallets, WalletAccount } from '@talismn/connect-wallets'
import { useState } from 'react'
import { Col, Modal, Row } from 'react-bootstrap'
import { FaChevronRight, FaDownload, FaXmark } from 'react-icons/fa6'
import styled from 'styled-components'
import { useAccount } from '../account/AccountContext'
import { truncateMiddle } from '../helpers/truncate'
import { toastByStatus } from '../pages/explore/helpers'
import NovaWalletLogo from '../static/nova-wallet-logo.svg'

interface LevelStatusType {
  [key: string]: string
}

const LEVELSTATUS: LevelStatusType = {
  human: 'WAITING BID',
  bidder: 'BID SUBMITTED',
  candidate: 'WAITING POI',
  cyborg: ''
}

function Wallets({ show, setShow }: { show: boolean; setShow: (show: boolean) => void }) {
  const { level } = useAccount()

  const [accounts, setAccounts] = useState<WalletAccount[] | undefined>(undefined)

  const [selectedWallet, setSelectedWallet] = useState<WalletType | undefined>(undefined)
  const wallets = [...getWallets(), new NovaWallet()]

  const handleClose = () => setShow(false)

  if (selectedWallet) {
    selectedWallet.subscribeAccounts((accounts: WalletAccount[] | undefined) => {
      setAccounts(accounts)
    })
  }

  return (
    <>
      <StyledModal show={show} onHide={handleClose} centered>
        <Modal.Header className="px-4" style={{ borderBottom: '0px' }}>
          <Modal.Title>Wallets</Modal.Title>
          <FaXmark onClick={() => setShow(false)} style={{ cursor: 'pointer' }} />
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
                  <LevelStatusDiv>
                    <label className="pe-3">JOURNEY: {level.toUpperCase()}</label>
                    <label>{LEVELSTATUS[level]}</label>
                  </LevelStatusDiv>
                </Col>
              </AccountRow>
            ))}
        </Modal.Body>
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

const LevelStatusDiv = styled.div`
  display: flex;
  justify-content: space-between;

  label {
    color: ${(props) => props.theme.colors.grey};
    font-weight: 700;
    font-size: 12px;
  }
`

export { Wallets }
