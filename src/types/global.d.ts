declare interface NavRouteProps {
  accounts: { name: string | undefined; address: string }[]
  activeAccount: string
  setAccounts: (accounts: { name: string | undefined; address: string }[]) => void
  setActiveAccount: (activeAccount: string) => void
  showAccount: boolean
  showSocialIcons: boolean
  showBrandIcon: boolean
  showGalleryButton: boolean
  children: React.ReactElement
}
