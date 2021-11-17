import { BrowserRouter } from 'react-router-dom'
import ShallowRenderer from 'react-test-renderer/shallow'
import { App } from '../App'

test('renders App', () => {
  const renderer = new ShallowRenderer()

  const tree = renderer.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  )

  expect(tree).toMatchSnapshot()
})
