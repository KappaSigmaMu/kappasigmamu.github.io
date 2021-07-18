import { useEffect, useState } from 'react'
import { useKusama } from '../kusama-lib'

function Home() {
  const { api } = useKusama()
  const [members, setMembers] = useState([])

  useEffect(() => {
    api.derive.society.members().then((response: any) => {
      setMembers(response)
    })
  }, [])

  return (
    <div>
      <h2>Home</h2>
      {members.map((member: any) => (
        <p key={member.accountId}>{member.accountId.toHuman()}</p>
      ))}
    </div>
  )
}

export { Home }
