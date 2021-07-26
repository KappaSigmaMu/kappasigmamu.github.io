/* eslint-disable  @typescript-eslint/no-explicit-any */

import { useEffect, useState } from 'react'
import {
  Container,
  Image,
  Row,
  Col,
  Button,
  InputGroup,
  FormControl,
} from 'react-bootstrap'
import { BlogCard } from '../components/BlogCard'
import { Canary } from '../components/canary'
import GavinWood from '../static/gavin-wood.png'
import { useSubstrate } from '../substrate'

function Home() {
  const { api } = useSubstrate()
  const [members, setMembers] = useState([])

  useEffect(() => {
    if (api) {
      api.derive.society.members().then((response: any) => {
        setMembers(response)
      })
    }
  }, [])

  return (
    <>
      <Container>
        <Row className="my-5 justify-content-md-center">
          <Canary />
        </Row>
      </Container>
      <Container>
        <Row className="my-5 justify-content-md-center">
          <Col md={3}>
            <p className="text-center">153 members</p>
          </Col>
          <Col md={3}>
            <p className="text-center">next 30.10.2021</p>
          </Col>
          <Col md={3}>
            <p className="text-center">POT 1234 KSM</p>
          </Col>
        </Row>
        <Row>
          <Col>
            {members.length}
            {members.map((member: any) => (
              <p key={member.accountId}>{member.accountId.toHuman()}</p>
            ))}
          </Col>
        </Row>
      </Container>
      <Container>
        <Row className="my-5 justify-content-md-center">
          <Col md={5} className="align-items-center">
            <h3>Society, everyone belongs to it, but nobody knows it.</h3>
          </Col>
          <Col md={5}>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. tincidunt
              tincidunt ex in libero venenatis, at imperdiet justo euismod.
              Nulla pharetra nibh nisi, at pellentesque diam porta a. Donec
              commodo pulvinar elit, ac ullamcorper purus aliquam vel. Mauris
              ante mauris, placerat ac interdum vitae, luctus vel enim. Integer
              ut scelerisque velit. Nullam volutpat quis velit sit amet rhoncus.
              Sed sed diam ut felis ultrices porttitor. Aenean luctus vehicula
              laoreet.
            </p>
          </Col>
        </Row>
      </Container>
      <Container>
        <Row className="my-5 justify-content-md-center">
          <Col md={5} className="align-items-center">
            <Image src={GavinWood} width="400" />
          </Col>
          <Col md={5}>
            <p>
              <strong>
                Kusama, the Scalable, Multichain Network for Radical Innovation.
              </strong>
            </p>
            <p>
              Unprecedented interoperability and scalability for blockchain
              developers who want to quickly push the limits of what’s possible.
              Built using Substrate with nearly the same codebase and
              industry-leading multichain infrastructure as Kusama’s cousin,
              Polkadot.
            </p>
          </Col>
        </Row>
      </Container>
      <Container className="my-5 text-center">
        <Row>
          <Col>
            <p className="mb-0">BECOME A MEMBER,</p>
            <p>BECOME A CYBORG!</p>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button>Join the Society</Button>
          </Col>
        </Row>
      </Container>
      <Container>
        <Row className="my-5 justify-content-md-center">
          <Col md={5} className="align-items-center">
            <h2>Society Rules</h2>
          </Col>
          <Col md={5}>
            <p>
              <strong>What is Proof of Ink</strong>
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
              tincidunt ex in libero venenatis, at imperdiet justo euismod.
              Nulla pharetra nibh nisi, at pellentesque diam porta a. Donec
              commodo pulvinar elit, ac ullamcorper purus aliquam vel.
            </p>
            <p>
              <strong>How to become a member</strong>
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
              tincidunt ex in libero venenatis, at imperdiet justo euismod.
              Nulla pharetra nibh nisi, at pellentesque diam porta a. Donec
              commodo pulvinar elit, ac ullamcorper purus aliquam vel.
            </p>
            <p>
              <strong>What can I do in the society?</strong>
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. In
              tincidunt ex in libero venenatis, at imperdiet justo euismod.
              Nulla pharetra nibh nisi, at pellentesque diam porta a. Donec
              commodo pulvinar elit, ac ullamcorper purus aliquam vel.
            </p>
          </Col>
        </Row>
      </Container>
      <Container className="my-5 text-center">
        <Row>
          <Col className="mb-2">
            <h2>Talk with the Cyborgs</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button>ICON Join the Community</Button>
          </Col>
        </Row>
      </Container>
      <Container className="my-5 text-center">
        <Row>
          <Col className="mb-2">
            <h2>Blog</h2>
          </Col>
        </Row>
        <Row className="d-flex justify-content-center">
          <BlogCard />
          <BlogCard />
          <BlogCard />
        </Row>
      </Container>
      <Container className="my-5 text-center">
        <Row>
          <Col className="mb-2">
            <h4>Subscribe to stay updated on the launch progress</h4>
          </Col>
        </Row>
        <Row className="d-flex justify-content-center">
          <Col md={6}>
            <InputGroup className="mb-3">
              <FormControl placeholder="Your e-mail" />
              <Button id="button-addon2">Subscribe</Button>
            </InputGroup>
          </Col>
        </Row>
      </Container>
      <Container>
        <h2>Footer</h2>
      </Container>
    </>
  )
}

export { Home }
