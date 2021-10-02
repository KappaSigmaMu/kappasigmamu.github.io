import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    darkBg: string
    lightBg: string

    colors: {
      primary: string
      secondary: string
      white: string
      black: string
      grey: string
      lightGrey: string
      darkGrey: string
    }
  }
}
