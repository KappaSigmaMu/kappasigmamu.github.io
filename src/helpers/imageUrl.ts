const imageUrl = (member: string) => {
  const ipfsGateway = 'https://lime-resident-bat-500.mypinata.cloud'
  const folderHash = 'QmNwB2TcyszjGFhuA32SJwbEKQuywG6NGhAAAgqEQFzamb'

  return `${ipfsGateway}/ipfs/${folderHash}/${member}.jpg`
}

export { imageUrl }
