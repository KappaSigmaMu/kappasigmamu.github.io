import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ShallowRenderer from 'react-test-renderer/shallow'
import { App } from '../pages/App'

test('renders App', () => {
  const renderer = new ShallowRenderer()

  const tree = renderer.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  )

  expect(tree).toMatchSnapshot()
})
