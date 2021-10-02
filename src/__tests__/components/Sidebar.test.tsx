import { MemoryRouter } from 'react-router-dom'
import TestRenderer from 'react-test-renderer'
import { Sidebar } from '../../components/Sidebar'

test('renders Sidebar with bids selected', () => {
    const tree = TestRenderer.create(
      <MemoryRouter initialEntries={["/human/bids"]}>
        <Sidebar />
      </MemoryRouter>
    )

  expect(tree).toMatchSnapshot()
})
