import { decodeAddress, encodeAddress } from '@polkadot/util-crypto'
import { Wallet as WalletType, WalletAccount } from '@talismn/connect-wallets'
import { useEffect, useState } from 'react'
import { Col, Modal, Row } from 'react-bootstrap'
import { FaChevronLeft, FaChevronRight, FaCircleCheck, FaDownload, FaPowerOff, FaXmark } from 'react-icons/fa6'
import styled from 'styled-components'
import { useAccount } from '../account/AccountContext'
import { walletTestId } from '../helpers/test-utils/testIds'
import { wallets } from '../helpers/wallets'
import { Identicon } from '../pages/explore/components/Identicon'
import { toastByStatus } from '../pages/explore/helpers'

const APP_NAME = process.env.REACT_APP_NAME
const KUSAMA_PREFIX = Number(process.env.REACT_APP_KEYRING_PREFIX)

function isSubstrateAccount(account: WalletAccount & { type?: string }): boolean {
  return account.type !== 'ethereum'
}

function mapWalletAccounts(accounts: WalletAccount[]): WalletAccount[] {
  return accounts
    .filter(isSubstrateAccount)
    .map((account) => ({
      ...account,
      address: encodeAddress(decodeAddress(account.address), KUSAMA_PREFIX)
    }))
}

function Wallets({ show, setShow }: { show: boolean; setShow: (show: boolean) => void }) {
  const { activeAccount, setActiveAccount } = useAccount()
  const [accounts, setAccounts] = useState<WalletAccount[] | undefined>(undefined)
  const [selectedWallet, setSelectedWallet] = useState<WalletType | undefined>(undefined)

  const handleDisconnect = () => {
    setShow(false)
    setActiveAccount(undefined)
    setSelectedWallet(undefined)
    setAccounts(undefined)
  }

  const handleAccountSelect = (account: WalletAccount) => {
    setShow(false)
    setActiveAccount(account)
  }

  const handleBackToWallets = () => {
    setSelectedWallet(undefined)
    setAccounts(undefined)
  }

  useEffect(() => {
    if (!show || !activeAccount) return

    const wallet = wallets.find((w) => w.title === activeAccount.wallet?.title)
    setSelectedWallet(wallet)
  }, [activeAccount, show])

  useEffect(() => {
    if (!selectedWallet) {
      setAccounts(undefined)
      return
    }

    let cancelled = false

    selectedWallet
      .getAccounts()
      .then((walletAccounts) => {
        if (!cancelled) {
          setAccounts(mapWalletAccounts(walletAccounts))
        }
      })
      .catch((e) => {
        if (!cancelled) {
          toastByStatus['error']((e as Error).message, {})
          setAccounts([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [selectedWallet])

  useEffect(() => {
    if (!show) {
      setSelectedWallet(undefined)
      setAccounts(undefined)
    }
  }, [show])

  return (
    <>
      <StyledModal
        show={show}
        onHide={() => setShow(false)}
        centered
        scrollable
        animation={false}
        enforceFocus={false}
        restoreFocus={false}
        data-test="wallet-modal"
      >
        <Modal.Header className="px-4" style={{ borderBottom: '0px' }}>
          <Modal.Title>{!selectedWallet ? 'Wallets' : 'Accounts'}</Modal.Title>
          <FaXmark onClick={() => setShow(false)} role="button" />
        </Modal.Header>
        <Modal.Body>
          {!selectedWallet &&
            wallets.map((wallet) => (
              <Wallet
                wallet={wallet}
                setSelectedWallet={setSelectedWallet}
                setAccounts={setAccounts}
                key={wallet.title}
              />
            ))}
          {selectedWallet &&
            accounts &&
            accounts.map((account) => (
              <AccountRow
                key={account.address}
                onClick={() => handleAccountSelect(account)}
                data-test="account-switcher"
              >
                <Col xs={2}>
                  <Identicon value={account.address} size={42} theme={'polkadot'} />
                </Col>
                <Col xs={10}>
                  <div className="d-flex justify-content-start align-items-center">
                    <span>{account.name}</span>
                    {activeAccount && activeAccount.address === account.address && <FaCircleCheck className="ms-2" />}
                  </div>
                  <Address className="text-start mb-1">{account.address}</Address>
                </Col>
              </AccountRow>
            ))}
          {selectedWallet && accounts?.length === 0 && (
            <div className="text-center mt-3">
              <p>No accounts connected</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '0px' }}>
          <Row className="d-flex w-100 align-items-center justify-content-between">
            <Col
              className="d-flex align-items-center justify-content-start"
              onClick={handleDisconnect}
              role="button"
              data-test="disconnect-button"
            >
              Disconnect <FaPowerOff className="mx-2" />
            </Col>
            {selectedWallet && (
              <Col
                className="d-flex align-items-center justify-content-end"
                onClick={handleBackToWallets}
                role="button"
              >
                <WalletLogo src={selectedWallet.logo.src} alt={selectedWallet.logo.alt} size={30} />
                <div>{selectedWallet.title}</div>
                <FaChevronLeft className="mx-2" />
              </Col>
            )}
          </Row>
        </Modal.Footer>
      </StyledModal>
    </>
  )
}

async function selectWallet(
  wallet: WalletType,
  setSelectedWallet: (wallet: WalletType) => void,
  setAccounts: (accounts: WalletAccount[] | undefined) => void
) {
  if (!wallet.installed) {
    window.open(wallet.installUrl, '_blank')
    return
  }

  try {
    await wallet.enable(APP_NAME)
    setSelectedWallet(wallet)
  } catch (e) {
    toastByStatus['error']((e as Error).message, {})
  }
}

const Wallet = ({
  wallet,
  setSelectedWallet,
  setAccounts
}: {
  wallet: WalletType
  setSelectedWallet: (wallet: WalletType) => void
  setAccounts: (accounts: WalletAccount[] | undefined) => void
}) => {
  return (
    <WalletRow
      onClick={() => selectWallet(wallet, setSelectedWallet, setAccounts)}
      data-test={walletTestId(wallet.title)}
    >
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
}

const StyledModal = styled(Modal)`
  .modal-dialog {
    pointer-events: none;
  }

  .modal-content {
    pointer-events: auto;
    max-height: 65vh;
    background-color: ${(props) => props.theme.colors.darkGrey};

    .modal-body {
      background-color: #3e454c;
      padding: 0;
      margin: 0;
    }
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
  padding-inline: 5%;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export { Wallets }
