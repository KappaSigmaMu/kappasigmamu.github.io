import { BrowserRouter } from 'react-router-dom'
import TestRenderer from 'react-test-renderer'
import { Navbar } from '../../components/Navbar'

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

  it('renders it with showGalleryButton', () => {
    const tree = TestRenderer.create(
      <BrowserRouter>
        <Navbar showGalleryButton />
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
