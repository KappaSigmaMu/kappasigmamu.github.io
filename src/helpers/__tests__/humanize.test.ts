import { PalletSocietyBidKindFixture } from '../../__tests__/fixtures/PalletSocietyBidKindFixture'
import { humanizeBidKind } from '../humanize'

const deposit = PalletSocietyBidKindFixture.createDeposit(20)
const vouch = PalletSocietyBidKindFixture.createVouch('5DcN2feEKzC23toLBu63N7Q9E2Tc3HE44oyd992WY31iZee4', 20)
const unknown = PalletSocietyBidKindFixture.createUnknown()

test('humanizeBidKind', () => {
  expect(humanizeBidKind(deposit)).toBe('Deposit')
  expect(humanizeBidKind(vouch)).toBe('Vouch: 5DcN2fe...')
  expect(humanizeBidKind(unknown)).toBe('Unknown')
})
