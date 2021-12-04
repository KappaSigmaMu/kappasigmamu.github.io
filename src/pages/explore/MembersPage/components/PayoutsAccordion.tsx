import type { Balance, BlockNumber } from '@polkadot/types/interfaces'
import { Accordion, Card, useAccordionButton } from 'react-bootstrap'
import { BlockTime } from '../../../../components/BlockTime'
import { FormatBalance } from '../../../../components/FormatBalance'

const PayoutsAccordionToggle = ({ children, eventKey }: { children: any, eventKey: any }) => (
  <a href="javascript:void(0)" onClick={useAccordionButton(eventKey)} >
    {children}
  </a>
)

const PayoutsAccordion = ({ payouts }: { payouts: [BlockNumber, Balance][] }) => (
  <Accordion>
    <PayoutsAccordionToggle eventKey="0">{payouts.length} payouts</PayoutsAccordionToggle>
    <Accordion.Collapse eventKey="0">
      <Card.Body>
        {payouts.map((payout: [BlockNumber, Balance], index: number) => {
          const [block, balance] = payout
          return(
            <div key={index}>
              <p className="mb-0">
                <FormatBalance balance={balance} />
              </p>
              <p className="mb-0">
                <BlockTime block={block} />
              </p>
            </div>
          )
        })}
      </Card.Body>
    </Accordion.Collapse>
  </Accordion>
)

export { PayoutsAccordion }
