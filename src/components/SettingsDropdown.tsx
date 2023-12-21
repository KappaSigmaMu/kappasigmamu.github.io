import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { FaGear, FaCircleCheck, FaCircle } from 'react-icons/fa6'
import styled from 'styled-components'
import { providers, type Provider } from '../helpers/providers'

const SettingsDropdown = () => {
  const queryParams = new URLSearchParams(window.location.search)
  const overrideProviderSocket = queryParams.get('rpc')
  const currentProvider = overrideProviderSocket ? overrideProviderSocket : process.env.REACT_APP_PROVIDER_SOCKET

  const currentUrl = new URL(window.location.href)

  const prodProviders = providers.filter((provider) => provider.dev === false)
  const devProviders = providers.filter((provider) => provider.dev === true)

  const ProvidersList = ({ providers }: { providers: Provider[] }): JSX.Element => (
    <>
      {providers.map(({ name, url }, key) => {
        currentUrl.searchParams.set('rpc', url)

        return url === currentProvider ? (
          <Dropdown.ItemText key={key}>
            {name}
            <FaCircleCheck size={14} />
          </Dropdown.ItemText>
        ) : (
          <Dropdown.Item href={currentUrl.toString()} key={key}>
            {name}
            <FaCircle size={14} />
          </Dropdown.Item>
        )
      })}
    </>
  )

  return (
    <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        <FaGear className="m-1 mt-0" />
        <span>Settings</span>
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

const StyledDropdownMenu = styled(Dropdown.Menu)`
  background-color: ${(props) => props.theme.colors.darkGrey};

  & a,
  & span {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-decoration: none;
  }

  & a,
  & a:link,
  & a:visited,
  & span {
    color: ${(props) => props.theme.colors.white};
  }

  & a:hover,
  & a:active {
    color: ${(props) => props.theme.colors.darkGrey};
    & svg {
      flex-shrink: 0;

      & path {
        fill: ${(props) => props.theme.colors.black};
      }
    }
  }
`

export { SettingsDropdown }
