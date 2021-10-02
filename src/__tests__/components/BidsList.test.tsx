import TestRenderer from 'react-test-renderer'
import { BidsList } from '../../components/BidsList'
import { PalletSocietyBidFixture } from '../fixtures/PalletSocietyBidFixture'

const bidDeposit = PalletSocietyBidFixture.createDeposit('5GrpknVvGGrGH3EFuURXeMrWHvbpj3VfER1oX5jFtuGbfzCE', 20)
const bidVouch = PalletSocietyBidFixture.createDeposit('CxDDSH8gS7jecsxaRL9Txf8H5kqesLXAEAEgp76Yz632J9M', 10)
const bids = [bidVouch, bidDeposit]

test('renders BidsList', () => {
  const tree = TestRenderer.create(
    <BidsList bids={bids} />
  )

  expect(tree).toMatchSnapshot()
})
