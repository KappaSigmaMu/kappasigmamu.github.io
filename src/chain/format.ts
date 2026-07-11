export type TimeParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export const KSM_DECIMALS = 12
export const KSM_TOKEN = 'KSM'
export const ASSET_HUB_BLOCK_TIME = 12_000
export const RELAY_CHAIN_BLOCK_TIME = 6_000

export function formatBalance(value: bigint | number | string | undefined, withCurrency = true, isShort = false): string {
  if (value === undefined || value === null) return withCurrency ? `0 ${KSM_TOKEN}` : '0'

  const raw = typeof value === 'bigint' ? value : BigInt(value)
  const negative = raw < 0n
  const absolute = negative ? -raw : raw
  const whole = absolute / 10n ** BigInt(KSM_DECIMALS)
  const fraction = (absolute % 10n ** BigInt(KSM_DECIMALS)).toString().padStart(KSM_DECIMALS, '0').slice(0, 4)
  const wholeText = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(whole)
  const result = `${negative ? '-' : ''}${wholeText}${isShort ? '' : `.${fraction}`}`
  return withCurrency ? `${result} ${KSM_TOKEN}` : result
}

export function extractTime(milliseconds: number): TimeParts {
  const seconds = Math.floor(Math.abs(milliseconds) / 1000)
  return {
    days: Math.floor(seconds / 86_400),
    hours: Math.floor((seconds % 86_400) / 3_600),
    minutes: Math.floor((seconds % 3_600) / 60),
    seconds: seconds % 60
  }
}

export function formatTime(milliseconds: number): string {
  const time = extractTime(milliseconds)
  return [
    time.days ? `${time.days} ${time.days === 1 ? 'day' : 'days'}` : null,
    time.hours ? `${time.hours} ${time.hours === 1 ? 'hr' : 'hrs'}` : null,
    time.minutes ? `${time.minutes} ${time.minutes === 1 ? 'min' : 'mins'}` : null,
    time.seconds ? `${time.seconds} ${time.seconds === 1 ? 's' : 's'}` : null
  ]
    .filter((part): part is string => Boolean(part))
    .slice(0, 2)
    .join(' ')
}
