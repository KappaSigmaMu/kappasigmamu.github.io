import { ApiPromise } from '@polkadot/api'
import { Spinner } from 'react-bootstrap'
import { MembersList } from './MembersList'

type MembersPageProps = {
  api: ApiPromise | null,
  members: SocietyMember[]
}

const MembersPage = ({ api, members }: MembersPageProps): JSX.Element => {
  const loading = !api?.query?.society
  const content = loading
    ? <Spinner animation="border" variant="primary" />
    : <MembersList members={members} />

  return (content)
}

export { MembersPage }
