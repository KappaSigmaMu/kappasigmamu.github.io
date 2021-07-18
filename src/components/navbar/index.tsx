import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import { default as BNavbar } from 'react-bootstrap/Navbar'
import { Link } from 'react-router-dom'
import logo from './logo.png'

const Brand = () => (
  <BNavbar.Brand as={Link} to="/">
    <img
      alt="KappaSigmaMu Society canary brand"
      src={logo}
      height="50"
      className="d-inline-block align-top"
    />
  </BNavbar.Brand>
)

export const Navbar = () => (
  <BNavbar bg="dark" variant="dark">
    <Container>
      <Brand />
      <Nav className="me-auto">
        <Nav.Link as={Link} to="/">
          Home
        </Nav.Link>
        <Nav.Link as={Link} to="/about">
          About
        </Nav.Link>
      </Nav>
    </Container>
  </BNavbar>
)
