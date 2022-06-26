import { BrowserRouter } from 'react-router-dom'
import { createRenderer } from 'react-test-renderer/shallow'
import { App } from '../App'

test('renders App', () => {
  const renderer = createRenderer()

  const tree = renderer.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  )

  expect(tree).toMatchSnapshot()
})
