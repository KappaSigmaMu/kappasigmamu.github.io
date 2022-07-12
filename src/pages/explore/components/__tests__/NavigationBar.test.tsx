import { MemoryRouter } from 'react-router-dom'
import renderer from 'react-test-renderer'
import { ThemeProvider } from 'styled-components'
import { Theme } from '../../../../styles/Theme'
import { NavigationBar } from '../NavigationBar'

describe('NavigationBar', () => {
  it('initialize with explore/bidders selected', () => {
    const tree = renderer.create(
      <MemoryRouter initialEntries={["/explore/bidders"]}>
        <ThemeProvider theme={Theme}>
          <NavigationBar />
        </ThemeProvider>
      </MemoryRouter>
    )

    expect(tree).toMatchSnapshot()
  })
})
