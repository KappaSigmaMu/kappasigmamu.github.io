import { web3FromAddress } from '@polkadot/extension-dapp'
import Identicon from '@polkadot/react-identicon'
import type { Vec } from '@polkadot/types'
import type { PalletSocietyBid } from '@polkadot/types/lookup'
import { useState } from 'react'
import { Col, Badge } from 'react-bootstrap'
import styled from 'styled-components'
import { DataHeaderRow, DataRow } from '../../../components/base'
import { humanizeBidKind } from '../../../helpers/humanize'
import { truncateMiddle } from '../../../helpers/truncate'
import { useKusama } from '../../../kusama'

type Props = { bids: Vec<PalletSocietyBid>, activeAccount: accountType; handleResult: any }

// TODO: move this to a `components` directory to follow the convention of other pages 
const BiddersList = ({ bids, activeAccount, handleResult } : Props) : JSX.Element => {
  const { api, apiState } = useKusama()
  const [loading, setLoading] = useState(false)
  const isBidder = (bidAddress : string) => activeAccount?.address === bidAddress

  const apiReady = apiState === 'READY'

  const handleUnbid = (index : any) => {
    const unbid = async () => {
      const _unbid = api?.tx?.society?.unbid(index)
      const injector = await web3FromAddress(activeAccount.address)
      let text

      _unbid?.signAndSend(activeAccount.address, { signer: injector.signer }, ({ status }) => {
        const _status = status.type.toString()

        if (_status === 'Finalized') {
          setLoading(false)
          text = 'Bid removed successfully. You became Human again'
        } else {
          setLoading(true)
          text = `Unbid request sent. Waiting for response...`
        }

        handleResult(text)
      })
    }

    apiReady && unbid()
  }

  if (bids.length === 0) return <>No bids</>

  return (
    <>
      <DataHeaderRow>
        <Col xs={1} className="text-center">#</Col>
        <Col xs={4} className="text-start">Wallet Hash</Col>
        <Col xs={2} className="text-start">Bid Kind</Col>
        <Col xs={4} className="text-end" style={{ paddingRight: 0 }}>Value</Col>
      </DataHeaderRow>
      {bids.map((bid : PalletSocietyBid, index : any) => {
        const _isBidder = isBidder(bid.who.toString())
        return (
          <StyledDataRow isBidder={_isBidder} key={bid.who?.toString()}>
            <Col xs={1} className="text-center">
              <Identicon value={bid.who} size={32} theme={'polkadot'} />
            </Col>
            <Col xs={4} className="text-start text-truncate">
              {truncateMiddle(bid.who?.toString())}
            </Col>
            <Col xs={2} className="text-start text-truncate">
              {humanizeBidKind(bid.kind)}
            </Col>
            <Col xs={4} className="text-end" style={{ paddingRight: 0 }}>
              {_isBidder && <Badge pill bg="primary">My bid</Badge>}{' '}
              {bid.value.toHuman()} KSM
            </Col>
            <Col xs={1} className="text-start">
              {_isBidder &&
                <StyledUnbid disabled={loading} onClick={() => handleUnbid(index)} href="#">UNBID</StyledUnbid>}
            </Col>
          </StyledDataRow>
        )
      })}
    </>
  )
}

const StyledDataRow = styled(DataRow)`
  background-color: ${(props) => props.isBidder ? '#73003d' : ''};
  border: ${(props) => props.isBidder ? '2px solid #E6007A' : ''};
`

type PropsUnbid = {
  disabled: boolean;
};

const StyledUnbid = styled.a.attrs((props : PropsUnbid) => ({
  disabled: props.disabled
}))<PropsUnbid>`
  color: ${(props) => props.disabled ? 'grey' : '#E6007A'};
  font-weight: 800;
  font-size: 13px;
  pointer-events: ${(props) => props.disabled ? 'none' : ''};
`

export { BiddersList }
