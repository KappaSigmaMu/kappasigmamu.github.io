interface PinataResponse {
  rows: Array<{ ipfs_pin_hash: string; date_pinned: string }>
}

async function getLatestPinnedHash(): Promise<string> {
  const pinataApiKey = process.env.REACT_APP_PINATA_API_KEY
  const pinataApiSecret = process.env.REACT_APP_PINATA_API_SECRET

  if (!pinataApiKey || !pinataApiSecret) {
    return ''
  }

  const url = 'https://api.pinata.cloud/data/pinList?status=pinned&sort=date_pinned,desc'

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataApiSecret
      }
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data: PinataResponse = await response.json()
    if (data.rows.length > 0) {
      return data.rows[0].ipfs_pin_hash
    }

    return ''
  } catch (error) {
    console.error(error)
    return ''
  }
}

const imageUrl = (folderHash: string, member: string) => {
  const ipfsGateway = process.env.REACT_APP_PINATA_GATEWAY
  return `${ipfsGateway}/ipfs/${folderHash}/${member}.jpg`
}

export { getLatestPinnedHash, imageUrl }
