import { BrowserRouter } from 'react-router-dom'
import TestRenderer from 'react-test-renderer'
import { Navbar } from '../Navbar'

describe('NavBar', () => {
  it('renders it with showAccount', () => {
    const tree = TestRenderer.create(
      <BrowserRouter>
        <Navbar showAccount />
      </BrowserRouter>
    )

    expect(tree).toMatchSnapshot()
  })

  it('renders it with showBrandIcon', () => {
    const tree = TestRenderer.create(
      <BrowserRouter>
        <Navbar showBrandIcon />
      </BrowserRouter>
    )

    expect(tree).toMatchSnapshot()
  })

  it('renders it with showExploreButton', () => {
    const tree = TestRenderer.create(
      <BrowserRouter>
        <Navbar showExploreButton />
      </BrowserRouter>
    )

    expect(tree).toMatchSnapshot()
  })

  it('renders it with showSocialIcons', () => {
    const tree = TestRenderer.create(
      <BrowserRouter>
        <Navbar showSocialIcons />
      </BrowserRouter>
    )

    expect(tree).toMatchSnapshot()
  })
})
