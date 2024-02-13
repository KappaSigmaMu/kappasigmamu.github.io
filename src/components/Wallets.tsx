import Identicon from '@polkadot/react-identicon'
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto'
import { Wallet as WalletType, WalletAccount } from '@talismn/connect-wallets'
import { useEffect, useState } from 'react'
import { Col, Modal, Row } from 'react-bootstrap'
import { FaChevronLeft, FaChevronRight, FaCircleCheck, FaDownload, FaPowerOff, FaXmark } from 'react-icons/fa6'
import styled from 'styled-components'
import { useAccount } from '../account/AccountContext'
import { wallets } from '../helpers/wallets'
import { toastByStatus } from '../pages/explore/helpers'

// interface LevelStatusType {
//   [key: string]: string
// }

// const LEVELSTATUS: LevelStatusType = {
//   human: 'WAITING BID',
//   bidder: 'BID SUBMITTED',
//   candidate: 'WAITING POI',
//   cyborg: ''
// }

const APP_NAME = process.env.REACT_APP_NAME
const KUSAMA_PREFIX = process.env.REACT_APP_KEYRING_PREFIX

function Wallets({ show, setShow }: { show: boolean; setShow: (show: boolean) => void }) {
  const { activeAccount, setActiveAccount } = useAccount()
  const [accounts, setAccounts] = useState<WalletAccount[] | undefined>(undefined)
  const [selectedWallet, setSelectedWallet] = useState<WalletType | undefined>(undefined)

  const handleDisconnect = () => {
    setShow(false)
    setActiveAccount(undefined)
  }

  const handleClick = (account: WalletAccount) => {
    setShow(false)
    setActiveAccount(account)
  }

  useEffect(() => {
    if (!selectedWallet) return

    function isSubstrateAccount(account: any): account is WalletAccount & { type: string } {
      return account?.type !== 'ethereum'
    }

    selectedWallet.subscribeAccounts((accounts: WalletAccount[] | undefined) => {
      const substrateAccounts = accounts?.filter(isSubstrateAccount)
      const mappedAccounts = substrateAccounts?.map((account) => ({
        ...account,
        address: encodeAddress(decodeAddress(account.address), KUSAMA_PREFIX)
      }))
      setAccounts(mappedAccounts)
    })
  }, [selectedWallet, activeAccount, setActiveAccount])

  return (
    <>
      <StyledModal show={show} onHide={() => setShow(false)} centered scrollable>
        <Modal.Header className="px-4" style={{ borderBottom: '0px' }}>
          <Modal.Title>{!selectedWallet ? 'Wallets' : 'Accounts'}</Modal.Title>
          <FaXmark onClick={() => setShow(false)} role="button" />
        </Modal.Header>
        <Modal.Body>
          {!selectedWallet &&
            wallets.map((wallet) => (
              <Wallet wallet={wallet} setSelectedWallet={setSelectedWallet} key={wallet.title} />
            ))}
          {selectedWallet &&
            accounts &&
            accounts.map((account) => (
              <AccountRow key={account.address} onClick={() => handleClick(account)}>
                <Col xs={2}>
                  <Identicon value={account.address} size={50} theme={'polkadot'} />
                </Col>
                <Col xs={10}>
                  <div className="d-flex justify-content-start align-items-center">
                    <span>{account.name}</span>
                    {activeAccount && activeAccount.address === account.address && <FaCircleCheck className="ms-2" />}
                  </div>
                  <Address className="text-start mb-1">{account.address}</Address>

                  {/* @TODO: fix me - show the correct level of each account
                  <LevelStatusDiv>
                    <label className="pe-3">JOURNEY: {level.toUpperCase()}</label>
                    <label>{LEVELSTATUS[level]}</label>
                  </LevelStatusDiv> */}
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
            <Col className="d-flex align-items-center justify-content-start" onClick={handleDisconnect} role="button">
              Disconnect <FaPowerOff className="mx-2" />
            </Col>
            {selectedWallet && (
              <Col
                className="d-flex align-items-center justify-content-end"
                onClick={() => setSelectedWallet(undefined)}
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

async function handleClick(wallet: WalletType, setSelectedWallet: any) {
  if (!wallet.installed) {
    window.open(wallet.installUrl, '_blank')
    return
  }

  try {
    await wallet?.enable(APP_NAME)
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

const StyledModal = styled(Modal)`
  .modal-content {
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
