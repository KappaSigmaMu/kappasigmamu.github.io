import { web3FromAddress } from '@polkadot/extension-dapp'

const doTx = async (
  tx : any,
  finalizedText : string,
  otherText : string,
  activeAccount : accountType,
  onStatusChange : any,
) => {
  const injector = await web3FromAddress(activeAccount.address)

  tx?.signAndSend(activeAccount.address, { signer: injector.signer }, ({ status } : { status : any }) => {
    const _status = status.type.toString()
    if (_status === 'Finalized') {
      onStatusChange({ loading: false, text: finalizedText })
    } else {
      onStatusChange({ loading: true, text: otherText })
    }
  })
}

export const unbid = async (
  tx : any,
  activeAccount : accountType,
  onStatusChange : any
) => {
  const finalizedText = 'Bid removed successfully. You became Human again'
  const otherText = 'Unbid request sent. Waiting for response...'

  await doTx(tx, finalizedText, otherText, activeAccount, onStatusChange)
}

export const unvouch = async (
  tx : any,
  activeAccount : accountType,
  onStatusChange : any
) => {
  const finalizedText = 'Vouch removed successfully.'
  const otherText = 'Unvouch request sent. Waiting for response...'

  await doTx(tx, finalizedText, otherText, activeAccount, onStatusChange)
}

export const bid = async (
  tx : any,
  activeAccount : accountType,
  onStatusChange : any
) => {
  const finalizedText = 'Bid submitted successfully. You are now a Bidder'
  const otherText = 'Bid request sent. Waiting for response...'

  await doTx(tx, finalizedText, otherText, activeAccount, onStatusChange)
}

export const vouch = async (
  tx : any,
  activeAccount : accountType,
  onStatusChange : any
) => {
  const finalizedText = 'Vouch submitted successfully.'
  const otherText = 'Vouch request sent. Waiting for response...'

  await doTx(tx, finalizedText, otherText, activeAccount, onStatusChange)
}
