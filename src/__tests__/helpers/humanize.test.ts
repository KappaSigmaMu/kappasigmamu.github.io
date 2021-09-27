import { humanizeBidKind, humanizeBidValue } from '../../helpers/humanize'
import { PalletSocietyBidKindFixture } from '../fixtures/PalletSocietyBidKindFixture'

const deposit = PalletSocietyBidKindFixture.createDeposit(20)
const vouch = PalletSocietyBidKindFixture.createVouch('5DcN2feEKzC23toLBu63N7Q9E2Tc3HE44oyd992WY31iZee4', 20)
const unknown = PalletSocietyBidKindFixture.createUnknown()

test('humanizeBidKind', () => {
  expect(humanizeBidKind(deposit)).toBe('Deposit')
  expect(humanizeBidKind(vouch)).toBe('Vouch: 5DcN2fe...')
  expect(humanizeBidKind(unknown)).toBe('<UNKNOWN KIND>')
})

test('humanizeBidValue', () => {
  expect(humanizeBidValue(deposit)).toBe('20')
  expect(humanizeBidValue(vouch)).toBe('20')
  expect(humanizeBidValue(unknown)).toBe('<UNKNOWN VALUE>')
})
