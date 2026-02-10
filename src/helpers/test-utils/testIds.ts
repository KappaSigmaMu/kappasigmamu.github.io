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
