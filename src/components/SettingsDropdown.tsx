import React, { useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { isMobile } from 'react-device-detect'
import { FaGear, FaCircleCheck, FaCircle } from 'react-icons/fa6'
import styled from 'styled-components'
import { providers, type Provider } from '../helpers/providers'
import { useKusama } from '../kusama/KusamaContext'
import { StyledDropdownMenu } from './StyledDropdownMenu'

const SettingsDropdown = () => {
  const queryParams = new URLSearchParams(window.location.search)
  const overrideProviderSocket = queryParams.get('rpc')
  let currentProvider = overrideProviderSocket ? overrideProviderSocket : process.env.REACT_APP_PROVIDER_SOCKET

  const currentUrl = new URL(window.location.href)

  const prodProviders = providers.filter((provider) => provider.dev === false)
  const devProviders = providers.filter((provider) => provider.dev === true)

  const { api } = useKusama()
  if (api) {
    // @ts-ignore - fix me: find a better way to verify which endpoint the api is connected
    // this is just a sanity-check, mostly used for development, to avoid submitting unintended extrinsics to production
    currentProvider = api?._options?.provider?.endpoint
  }

  const ProvidersList = ({ providers }: { providers: Provider[] }): JSX.Element => {
    const [hoveredItem, setHoveredItem] = useState('')

    return (
      <>
        {providers.map(({ name, url }, key) => {
          currentUrl.searchParams.set('rpc', url)

          return url === currentProvider ? (
            <Dropdown.ItemText key={key}>
              <FaCircleCheck size={14} />
              {name}
            </Dropdown.ItemText>
          ) : (
            <Dropdown.Item
              href={currentUrl.toString()}
              key={key}
              onMouseEnter={() => setHoveredItem(url)}
              onMouseLeave={() => setHoveredItem('')}
            >
              {hoveredItem === url ? <FaCircleCheck size={14} /> : <FaCircle size={14} />}
              {name}
            </Dropdown.Item>
          )
        })}
      </>
    )
  }

  return (
    <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        <FaGear className="m-1 mt-0" />
        {!isMobile && <span>Settings</span>}
      </Dropdown.Toggle>

      <StyledDropdownMenu>
        <Dropdown.ItemText>RPC Providers</Dropdown.ItemText>
        <Dropdown.Divider />
        <ProvidersList providers={prodProviders} />
        <Dropdown.Divider />
        <ProvidersList providers={devProviders} />
      </StyledDropdownMenu>
    </Dropdown>
  )
}

export { SettingsDropdown }
