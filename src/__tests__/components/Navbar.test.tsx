import { BrowserRouter } from 'react-router-dom'
import TestRenderer from 'react-test-renderer'
import { Navbar } from '../../components/Navbar'

const defaultProps = {
  accounts: [],
  activeAccount: '5DcN2feEKzC23toLBu63N7Q9E2Tc3HE44oyd992WY31iZee4',
  setAccounts: () => ({}),
  setActiveAccount: () => ({}),
}

describe('NavBar', () => {
  it('renders it with showAccount', () => {
    const tree = TestRenderer.create(
      <BrowserRouter>
        <Navbar {...defaultProps} showAccount />
      </BrowserRouter>
    )

    expect(tree).toMatchSnapshot()
  })

  it('renders it with showBrandIcon', () => {
    const tree = TestRenderer.create(
      <BrowserRouter>
        <Navbar {...defaultProps} showBrandIcon />
      </BrowserRouter>
    )

    expect(tree).toMatchSnapshot()
  })

  it('renders it with showGalleryButton', () => {
    const tree = TestRenderer.create(
      <BrowserRouter>
        <Navbar {...defaultProps} showGalleryButton />
      </BrowserRouter>
    )

    expect(tree).toMatchSnapshot()
  })

  it('renders it with showSocialIcons', () => {
    const tree = TestRenderer.create(
      <BrowserRouter>
        <Navbar {...defaultProps} showSocialIcons />
      </BrowserRouter>
    )

    expect(tree).toMatchSnapshot()
  })
})
