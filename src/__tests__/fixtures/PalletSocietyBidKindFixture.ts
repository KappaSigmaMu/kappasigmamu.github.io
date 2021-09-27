import { TypeRegistry } from '@polkadot/types/create/registry'
import type { AccountId32 } from '@polkadot/types/interfaces/runtime'
import type { PalletSocietyBidKind } from '@polkadot/types/lookup'
import { u128 } from '@polkadot/types/primitive'
import type { ITuple } from '@polkadot/types/types'
import BN from 'bn.js'

const registry = new TypeRegistry()

class PalletSocietyBidKindFixture implements Partial<PalletSocietyBidKind> {
  public asDeposit: u128 = registry.createType('u128', new BN(20))
  public asVouch: ITuple<[AccountId32, u128]> = registry.createType(
    '(AccountId32, u128)',
    [
      registry.createType('AccountId32', '5DcN2feEKzC23toLBu63N7Q9E2Tc3HE44oyd992WY31iZee4'),
      registry.createType('u128', new BN(20))
    ]
  )
  public isDeposit = false
  public isVouch = true

  public static createDeposit(deposit: number): PalletSocietyBidKindFixture {
    const kind = new PalletSocietyBidKindFixture()
    kind.asDeposit = registry.createType('u128', new BN(deposit))
    kind.isDeposit = true
    kind.isVouch = false

    return kind
  }

  public static createVouch(accountId: string, vouch: number): PalletSocietyBidKindFixture {
      const kind = new PalletSocietyBidKindFixture()
      kind.asVouch = registry.createType(
        '(AccountId32, u128)',
        [registry.createType('AccountId32', accountId), registry.createType('u128', new BN(vouch))]
      )
      kind.isVouch = true
      kind.isDeposit = false

      return kind
  }

  public static createUnknown(): PalletSocietyBidKindFixture {
    const kind = new PalletSocietyBidKindFixture()
    kind.isDeposit = false
    kind.isVouch = false

    return kind
  }
}

export { PalletSocietyBidKindFixture }
