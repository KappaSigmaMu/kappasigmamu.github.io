declare interface NavRouteProps {
  accounts: { name: string | undefined; address: string }[]
  activeAccount: string
  children?: React.ReactElement
  setAccounts: (accounts: { name: string | undefined; address: string }[]) => void
  setActiveAccount: (activeAccount: string) => void
  showAccount?: boolean = false
  showBrandIcon?: boolean = false
  showGalleryButton?: boolean = false
  showSocialIcons?: boolean = false
}
