import { render } from "react-dom"
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { Theme } from '../../../../styles/Theme'
import { NavigationBar } from '../NavigationBar'

describe('NavigationBar', () => {
  it('initialize wituuh explore/bidders selected', () => {
    const container = document.createElement('div')
    const wrapper = render(
      <MemoryRouter initialEntries={["/explore/bidders"]}>
        <ThemeProvider theme={Theme}>
          <NavigationBar />
        </ThemeProvider>
      </MemoryRouter>,
      container
    )

    expect(wrapper).toMatchSnapshot()
  })
})
