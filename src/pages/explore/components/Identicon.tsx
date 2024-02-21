import IIdenticon from '@polkadot/react-identicon'
import { IconTheme } from '@polkadot/react-identicon/types'
import { toastByStatus } from '../helpers'

type IdenticonProps = {
  value: string | Uint8Array | null | undefined
  size: number
  theme: IconTheme | undefined
  className?: string
}

const Identicon = ({ value, size, theme, className = '' }: IdenticonProps) => {
  const showMessage = () => {
    const msg = 'Address copied.'
    toastByStatus['success'](msg, { id: msg, duration: 2500 })
  }

  return <IIdenticon value={value} size={size} theme={theme} className={className} onCopy={showMessage} />
}

export { Identicon }
