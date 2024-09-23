import type { ApiPromise } from '@polkadot/api'
import { WalletAccount } from '@talismn/connect-wallets'
import { useState, useEffect } from 'react'
import { Badge, Col } from 'react-bootstrap'
import styled from 'styled-components'
import { DataHeaderRow, DataRow } from '../../../../components/base'
import { FormatBalance } from '../../../../components/FormatBalance'
import { useBlockTime } from '../../../../hooks/useBlockTime'
import { Identicon } from '../../components/Identicon'

const StyledDataRow = styled(DataRow)`
  background-color: ${(props) => (props.$isDefender ? props.theme.colors.black : '')};
  border: ${(props) => (props.$isDefender ? `2px solid ${props.theme.colors.secondary}` : '')};
  &:hover {
    cursor: pointer;
  }
  @media (max-width: 992px) {
    padding-block: 12px;
    margin-inline: 2px;
  }
`

type PayoutsListProps = {
  api: ApiPromise
  members: ExtendedSocietyMember[]
  activeAccount: WalletAccount | undefined
  handleUpdate: () => void
}

const TimeRemaining = ({ block, latestBlock, api }: { block: number; latestBlock: number | null; api: ApiPromise }) => {
  if (!latestBlock)
    return (
      <Badge pill bg="black" className="me-2 p-2">
        Calculating...
      </Badge>
    )

  const blocksLeft = block - latestBlock
  const [, time] = useBlockTime(blocksLeft, api)

  if (!time)
    return (
      <Badge pill bg="black" className="me-2 p-2">
        Calculating...
      </Badge>
    )

  if (blocksLeft <= 0)
    return (
      <Badge pill bg="primary" className="me-2 p-2">
        Matured
      </Badge>
    )

  return (
    <Badge pill bg="secondary" text="black" className="me-2 p-2">
      Maturing in {time}
    </Badge>
  )
}

const PayoutsList = ({ api, members }: PayoutsListProps): JSX.Element => {
  const [latestBlock, setLatestBlock] = useState<number | null>(null)

  useEffect(() => {
    const fetchLatestBlock = async () => {
      const header = await api.rpc.chain.getHeader()
      setLatestBlock(header.number.toNumber())
    }

    fetchLatestBlock()
    const unsub = api.rpc.chain.subscribeNewHeads((header) => {
      setLatestBlock(header.number.toNumber())
    })

    return () => {
      unsub.then((u) => u())
    }
  }, [api])

  if (members.length === 0) return <>No members</>

  return (
    <>
      <DataHeaderRow className="d-none d-lg-flex text-center">
        <Col lg={1}>#</Col>
        <Col lg={5} className="text-center text-lg-start">
          Wallet Hash
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          Paid
        </Col>
        <Col lg={2} className="text-center text-lg-start">
          Pending
        </Col>
        <Col lg={2}></Col>
      </DataHeaderRow>

      {members.map((member: ExtendedSocietyMember) => (
        <StyledDataRow key={member.accountId.toString()}>
          <Col lg={1} className="text-center">
            <Identicon value={member.accountId.toHuman()} size={32} theme={'polkadot'} />
          </Col>
          <Col lg={5} className="text-center text-lg-start">
            {member.accountId.toHuman()}
          </Col>
          <Col lg={2} className="text-center text-lg-start">
            <FormatBalance balance={member.extendedPayouts.paid} />
          </Col>
          <Col lg={2} className="text-center text-lg-start">
            <FormatBalance balance={member.extendedPayouts.pending} />
          </Col>
          <Col lg={2} className="text-center text-lg-end">
            {member.isFounder && (
              <Badge pill bg="dark" className="me-2 p-2">
                Founder
              </Badge>
            )}
            {member.rank.toNumber() > 0 && (
              <Badge pill bg="dark" className="me-2 p-2">
                Ranked
              </Badge>
            )}
            {member.hasPayouts && (
              <>
                <TimeRemaining block={member.extendedPayouts.block} latestBlock={latestBlock} api={api} />
              </>
            )}
            {member.extendedPayouts.pending == 0 && member.extendedPayouts.paid > 0 && (
              <Badge pill bg="black" className="me-2 p-2">
                Paid
              </Badge>
            )}
            {!member.hasPayouts && member.extendedPayouts.paid == 0 && (
              <Badge pill bg="black" className="me-2 p-2">
                Paid before V2
              </Badge>
            )}
          </Col>
        </StyledDataRow>
      ))}
    </>
  )
}

export { PayoutsList }
