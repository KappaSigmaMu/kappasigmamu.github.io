function truncateAccountId(str: string) {
  if (!str) { return '' }
  return str.length > 10 ? str.substring(0, 7) + '...' : str
}

export { truncateAccountId }
