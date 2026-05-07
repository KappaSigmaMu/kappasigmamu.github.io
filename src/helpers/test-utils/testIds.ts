import type { Toast } from 'react-hot-toast'

function normalizeTestId(str: string): string {
  return str
    .toLowerCase()
    .replace(/[.\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function walletTestId(walletTitle: string): string {
  const normalized = normalizeTestId(walletTitle).replace(/-js$/, '')
  return `wallet-${normalized}`
}

export function toastTestId(t: Toast): string | undefined {
  if (t.type === 'success') return 'tx-success'
  if (t.type === 'error') return 'tx-error'
  if (t.type !== 'loading') return undefined

  return typeof t.message === 'string' && t.message.includes('Awaiting signature') ? 'tx-signing' : 'tx-pending'
}
