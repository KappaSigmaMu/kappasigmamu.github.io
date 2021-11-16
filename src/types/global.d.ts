declare interface NavRouteProps {
  children?: React.ReactElement
  showAccount?: boolean
  showBrandIcon?: boolean
  showExploreButton?: boolean
  showSocialIcons?: boolean
}

declare type accountType = { name: string | undefined; address: string }

declare module '@kappasigmamu/canary-component'

declare class ThreeCanary {
  constructor(objectUrl?: string)
}
