import React from 'react'
import { formatBalance } from '../chain/format'
import type { Balance } from '../chain/types'

type ValueType = Balance | bigint | number | string | { toString(): string } | undefined

const applyFormatBalance = (value: ValueType, withCurrency = true, isShort = false): React.ReactNode => (
  <>
    {formatBalance(
      value === undefined ? undefined : typeof value === 'object' ? value.toString() : value,
      withCurrency,
      isShort
    )}
  </>
)

type FormatBalanceProps = { balance: ValueType; withCurrency?: boolean; isShort?: boolean }

const FormatBalance = ({ balance, withCurrency = true, isShort = false }: FormatBalanceProps): JSX.Element => (
  <>{applyFormatBalance(balance, withCurrency, isShort)}</>
)

export { applyFormatBalance, FormatBalance }
