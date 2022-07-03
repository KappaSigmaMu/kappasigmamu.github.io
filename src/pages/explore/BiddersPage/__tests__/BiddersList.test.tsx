import TestRenderer from 'react-test-renderer'
import { ThemeProvider } from 'styled-components'
import { PalletSocietyBidFixture } from '../../../../__tests__/fixtures/PalletSocietyBidFixture'
import { Theme } from '../../../../styles/Theme'
import { BiddersList } from '../BiddersList'

const bidDeposit = PalletSocietyBidFixture.createDeposit('5GrpknVvGGrGH3EFuURXeMrWHvbpj3VfER1oX5jFtuGbfzCE', 20)
const bidVouch = PalletSocietyBidFixture.createDeposit('CxDDSH8gS7jecsxaRL9Txf8H5kqesLXAEAEgp76Yz632J9M', 10)
const bids = [bidVouch, bidDeposit]

test('renders BiddersList', () => {
  const tree = TestRenderer.create(
    <ThemeProvider theme={Theme}>
      {/* <BiddersList bids={bids} /> */}
    </ThemeProvider>
  )

  expect(tree).toMatchSnapshot()
})
