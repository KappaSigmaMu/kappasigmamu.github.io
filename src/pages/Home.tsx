import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { Canary } from '../components/canary'
import { useEffect, useState } from 'react'
import { KusamaContextProvider, useKusama } from '../kusama-lib'

function Home() {
  const { api } = useKusama()
  const [members, setMembers] = useState([])

  useEffect(() => {
    if (api) {
      api.derive.society.members().then((response: any) => {
        setMembers(response)
      })
    }
  }, [])

  return (
    <div>
      <h2>Home</h2>
      <Row>
        <Col>
        {members.length}
        {members.map((member: any) => (
          <p key={member.accountId}>{member.accountId.toHuman()}</p>
        ))}
        </Col>
      </Row>
      <Row>
        <Col>
          <Canary />
        </Col>
      </Row>


    </div>
  )
}

export { Home }
