function truncate(str: string, strLength = 7) {
  if (!str) { return '' }
  return str.length > 10 ? str.substring(0, strLength) + '...' : str
}

function truncateMiddle(str: string, strLength = 23, separator = '...') {
  if (str.length <= strLength) return str

  const separatorLength = separator.length
  const strLengthWithoutSeparator = strLength - separatorLength
  const beginStr = Math.ceil(strLengthWithoutSeparator/2)
  const endStr = Math.floor(strLengthWithoutSeparator/2)

  return str.substring(0, beginStr) +
         separator +
         str.substring(str.length - endStr)
}

export { truncate, truncateMiddle }
