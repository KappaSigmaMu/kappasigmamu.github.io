import type { KeyringPair } from '@polkadot/keyring/types'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { useSubstrate } from '../substrate'

type Props = {
  setAccountAddress: (address: string) => void
}

function Main({ setAccountAddress }: Props) {
  const { keyring } = useSubstrate()
  const [accountSelected, setAccountSelected] = useState('')

  const keyringOptions = keyring?.getPairs().map((account: KeyringPair) => {
    return {
      key: account?.address,
    }
  })

  const initialAddress = keyringOptions?.length > 0 ? keyringOptions[0].key : ''

  useEffect(() => {
    setAccountAddress(initialAddress)
    setAccountSelected(initialAddress)
  }, [setAccountAddress, initialAddress])

  const onChange = (account: HTMLInputElement) => {
    setAccountAddress(account.innerText)
    setAccountSelected(account.innerText)
  }

  const Title = () => {
    return (
      <label
        style={{
          fontSize: '12px',
        }}
      >
        {accountSelected}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <label>JOURNEY: HUMAN</label>
          <label>WAITING BID</label>
        </div>
      </label>
    )
  }

  return (
    <DropdownButton
      variant="gray-dark"
      onSelect={(
        eventKey: string | null,
        e?: React.SyntheticEvent<unknown, Event>,
      ) => onChange(e?.target as HTMLInputElement)}
      title={<Title />}
    >
      {keyringOptions.map((option: { key: string }) => (
        <Dropdown.Item
          style={{ fontSize: '12px' }}
          eventKey={option.key}
          key={option.key}
          href="#"
        >
          {option.key}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  )
}

Main.propTypes = {
  setAccountAddress: PropTypes.func.isRequired,
}

function AccountSelector(props: Props) {
  const { api } = useSubstrate()
  return api?.query ? <Main {...props} /> : null
}

AccountSelector.propTypes = {
  setAccountAddress: PropTypes.func.isRequired,
}

export { AccountSelector }
