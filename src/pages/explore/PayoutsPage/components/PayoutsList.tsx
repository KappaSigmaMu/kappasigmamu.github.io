import type { WalletAccount } from '@talismn/connect-wallets'
import { Badge, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { ClaimPayoutButton } from './ClaimPayoutButton'
import { isSameAddress } from '../../../../chain/ss58'
import type { ExtendedSocietyMember, ExtrinsicResult } from '../../../../chain/types'
import { DataHeaderRow, DataRow } from '../../../../components/base'
import { FormatBalance } from '../../../../components/FormatBalance'
import { useBlockTime } from '../../../../hooks/useBlockTime'
import { useRelayChainBlockNumber } from '../../../../hooks/useRelayChainBlockNumber'
import { Identicon } from '../../components/Identicon'
import { toastByStatus } from '../../helpers'

const StyledDataRow = styled(DataRow)`background-color: ${(props) => (props.$isDefender ? props.theme.colors.black : '')}; border: ${(props) => (props.$isDefender ? `2px solid ${props.theme.colors.secondary}` : '')}; &:hover { cursor: pointer; } @media (max-width: 992px) { padding-block: 12px; margin-inline: 2px; }`
type Props = { members: ExtendedSocietyMember[]; activeAccount: WalletAccount | undefined; handleUpdate: () => void }

const TimeRemaining = ({ block, latestBlock, member, activeAccount, handleUpdate, dataTest }: { block: number; latestBlock: number | null; member: ExtendedSocietyMember; activeAccount: WalletAccount | undefined; handleUpdate: () => void; dataTest?: string }) => {
  const blocksLeft = latestBlock === null ? 0 : block - latestBlock; const [, formattedTime] = useBlockTime(blocksLeft, undefined, true)
  if (latestBlock === null || !formattedTime) return <Badge pill bg="black" className="me-2 p-2">Calculating...</Badge>
  if (blocksLeft <= 0) return <><Badge pill bg="primary" className="me-2 p-2">Matured</Badge>{activeAccount && isSameAddress(activeAccount.address, member.accountId) && <ClaimPayoutButton activeAccount={activeAccount} showMessage={(result: ExtrinsicResult) => toastByStatus[result.status](result.message, { id: result.message })} handleUpdate={handleUpdate} disabled={false} data-test={dataTest} />}</>
  return <Badge pill bg="secondary" text="black" className="me-2 p-2">Maturing in {formattedTime}</Badge>
}

const PayoutsList = ({ members, activeAccount, handleUpdate }: Props): JSX.Element => {
  const latestBlock = useRelayChainBlockNumber()
  if (members.length === 0) return <>No members</>
  return <div data-test="payouts-list"><DataHeaderRow className="d-none d-lg-flex text-center"><Col lg={1}>#</Col><Col lg={5} className="text-center text-lg-start">Wallet Hash</Col><Col lg={2} className="text-center text-lg-start">Paid</Col><Col lg={2} className="text-center text-lg-start">Pending</Col><Col lg={2}></Col></DataHeaderRow>{members.map((member) => <StyledDataRow key={member.accountId} data-test={`payout-row-${member.accountId}`}><Col lg={1} className="text-center"><Identicon value={member.accountId} size={32} theme="polkadot" /></Col><Col lg={5} className="text-center text-lg-start">{member.accountId}</Col><Col lg={2} className="text-center text-lg-start" data-test={`payout-total-${member.accountId}`}><FormatBalance balance={member.extendedPayouts.paid} /></Col><Col lg={2} className="text-center text-lg-start" data-test={`payout-pending-${member.accountId}`}><FormatBalance balance={member.extendedPayouts.pending} /></Col><Col lg={2} className="text-center text-lg-end" data-test={`payout-maturity-${member.accountId}`}>{member.isFounder && <Badge pill bg="dark" className="me-2 p-2">Founder</Badge>}{member.rank > 0 && <Badge pill bg="dark" className="me-2 p-2">Ranked</Badge>}{member.hasPayouts && <TimeRemaining block={member.extendedPayouts.block} latestBlock={latestBlock} member={member} activeAccount={activeAccount} handleUpdate={handleUpdate} dataTest={`claim-payout-button-${member.accountId}`} />}{member.extendedPayouts.pending === 0n && member.extendedPayouts.paid > 0n && <Badge pill bg="black" className="me-2 p-2">Paid</Badge>}{!member.hasPayouts && member.extendedPayouts.paid === 0n && <Badge pill bg="black" className="me-2 p-2">Paid V1</Badge>}</Col></StyledDataRow>)}</div>
}

export { PayoutsList }
