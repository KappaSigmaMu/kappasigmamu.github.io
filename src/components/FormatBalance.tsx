import type { Compact } from '@polkadot/types'
import type { Balance } from '@polkadot/types/interfaces'
import { formatBalance } from '@polkadot/util'
import type BN from 'bn.js'
import React from 'react'

const DEFAULT_KSM_PROPERTIES: [number, string] = [12, 'KSM']
const M_LENGTH = 6 + 1
const K_LENGTH = 3 + 1

type ValueType = Compact<any> | BN | string

const applyFormatBalance = (value: ValueType, withCurrency = true, isShort = false): React.ReactNode => {
  console.info(value)
  const [decimals, token] = DEFAULT_KSM_PROPERTIES
  const [prefix, postfix] = formatBalance(value, { decimals, forceUnit: '-', withSi: false }).split('.')
  const _isShort = isShort || prefix.length >= K_LENGTH
  const unitPost = withCurrency ? token : ''

  if (prefix.length > M_LENGTH) {
    const [major, rest] = formatBalance(value, { decimals, withUnit: false }).split('.')
    const minor = rest.substring(0, 4)
    const unit = rest.substring(4)

    return (
      <>
        <span>{major}.</span>
        <span>{minor}</span>
        <span>
          {unit}
          {unit ? unitPost : ` ${unitPost}`}
        </span>
      </>
    )
  }

  return (
    <>
      <span>{`${prefix}${_isShort ? '' : '.'}`}</span>
      <span>{!_isShort && `0000${postfix || ''}`.slice(-4)}</span>
      <span> {unitPost}</span>
    </>
  )
}

type FormatBalanceProps = { balance: Balance; withCurrency?: boolean; isShort?: boolean }

const FormatBalance = ({ balance, withCurrency = true, isShort = false }: FormatBalanceProps): JSX.Element => (
  <>{applyFormatBalance(balance, withCurrency, isShort)}</>
)

export { applyFormatBalance, FormatBalance }
