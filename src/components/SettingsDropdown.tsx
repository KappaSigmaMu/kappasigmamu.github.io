import { useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { FaCircle, FaCircleCheck, FaGear } from 'react-icons/fa6'
import styled from 'styled-components'
import { StyledDropdownMenu } from './StyledDropdownMenu'
import { useAssetHub } from '@/chain/ChainProvider'
import { providers, type Provider } from '@/helpers/providers'

const SettingsDropdown = ({ mobile = false }: { mobile?: boolean }) => {
  const currentUrl = new URL(window.location.href)
  const prodProviders = providers.filter((provider) => provider.dev === false)
  const devProviders = providers.filter((provider) => provider.dev === true)
  const { activeProviderEndpoint } = useAssetHub()

  const ProvidersList = ({ providerItems }: { providerItems: Provider[] }): JSX.Element => {
    const [hoveredItem, setHoveredItem] = useState('')

    return (
      <>
        {providerItems.map(({ name, url }) => {
          currentUrl.searchParams.set('rpc', url)

          return url === activeProviderEndpoint ? (
            <Dropdown.ItemText key={url}>
              <FaCircleCheck size={14} />
              {name}
            </Dropdown.ItemText>
          ) : (
            <Dropdown.Item
              href={currentUrl.toString()}
              key={url}
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
    <SettingsRoot $mobile={mobile}>
      <SettingsToggle variant="link" $mobile={mobile} data-test={mobile ? 'mobile-settings' : 'settings'}>
        <FaGear />
        <span>Settings</span>
      </SettingsToggle>

      <SettingsMenu align={mobile ? 'start' : 'end'}>
        <Dropdown.ItemText>RPC Providers</Dropdown.ItemText>
        <Dropdown.Divider />
        <ProvidersList providerItems={prodProviders} />
        <Dropdown.Divider />
        <ProvidersList providerItems={devProviders} />
      </SettingsMenu>
    </SettingsRoot>
  )
}

const SettingsRoot = styled(Dropdown)<{ $mobile: boolean }>`
  ${(props) =>
    props.$mobile &&
    `
      width: 100%;

      .dropdown-menu {
        position: static !important;
        width: calc(100% - 24px);
        margin: 0 12px 8px !important;
        transform: none !important;
      }
    `}
`

const SettingsToggle = styled(Dropdown.Toggle)<{ $mobile: boolean }>`
  display: flex;
  min-height: ${(props) => (props.$mobile ? '48px' : '40px')};
  width: ${(props) => (props.$mobile ? '100%' : 'auto')};
  padding: ${(props) => (props.$mobile ? '0 18px' : '6px 8px')};
  border: 0;
  border-radius: 4px;
  gap: 7px;
  align-items: center;
  justify-content: flex-start;
  background: transparent;
  color: #e4e5e6;
  font-size: 1rem;
  text-decoration: none;

  &::after {
    display: none;
  }

  &:hover,
  &:focus-visible,
  &:active,
  &.show {
    border: 0;
    background: rgba(255, 255, 255, 0.06) !important;
    color: #fff !important;
    box-shadow: none !important;
    text-decoration: none;
  }
`

const SettingsMenu = styled(StyledDropdownMenu)`
  min-width: 230px;
`

export { SettingsDropdown }
