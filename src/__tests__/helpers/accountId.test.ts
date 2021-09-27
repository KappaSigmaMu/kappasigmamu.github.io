import { truncateAccountId } from '../../helpers/accountId'

test('truncateAccountId', () => {
  expect(truncateAccountId('5DcN2feEKzC23toLBu63N7Q9E2Tc3HE44oyd992WY31iZee4')).toBe('5DcN2fe...')
})
