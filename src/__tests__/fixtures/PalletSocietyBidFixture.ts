/* eslint-disable @typescript-eslint/no-unused-vars */

import type { u128 } from '@polkadot/types'
import rpcMetadata from '@polkadot/types-support/metadata/static-substrate'
import { TypeRegistry } from '@polkadot/types/create/registry'
import type { AccountId32 } from '@polkadot/types/interfaces/runtime'
import type { PalletSocietyBid, PalletSocietyBidKind } from '@polkadot/types/lookup'
import { Metadata } from '@polkadot/types/metadata'
import BN from 'bn.js'
import { PalletSocietyBidKindFixture } from './PalletSocietyBidKindFixture'

const ksmMultiplier = new BN(1e12)
const registry = new TypeRegistry()
const metadata = new Metadata(registry, rpcMetadata)
registry.setMetadata(metadata)

class PalletSocietyBidFixture implements Partial<PalletSocietyBid> {
  public who: AccountId32 = registry.createType('AccountId32', '5DcN2feEKzC23toLBu63N7Q9E2Tc3HE44oyd992WY31iZee4')
  // FIXME: uncomment and find out how to satisfy types
  // public kind: Partial<PalletSocietyBidKind> = PalletSocietyBidKindFixture.createDeposit(20)
  public value: u128 = registry.createType('u128', new BN(20).mul(ksmMultiplier))

  public static createDeposit(who: string, value: number): PalletSocietyBidFixture {
    const bid = new PalletSocietyBidFixture()
    bid.who = registry.createType('AccountId32', who)
    // bid.kind = PalletSocietyBidKindFixture.createDeposit(value)
    bid.value = registry.createType('u128', new BN(value).mul(ksmMultiplier))

    return bid
  }

  public static createVouch(who: string, vouch: string, value: number): PalletSocietyBidFixture {
    const bid = new PalletSocietyBidFixture()
    bid.who = registry.createType('AccountId32', who)
    // bid.kind = PalletSocietyBidKindFixture.createVouch(vouch, value)
    bid.value = registry.createType('u128', new BN(value).mul(ksmMultiplier))

    return bid
  }
}

export { PalletSocietyBidFixture }
