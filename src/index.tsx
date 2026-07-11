import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './pages/App'
import { reportWebVitals } from './reportWebVitals'

import './styles/bootstrap.scss'

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

reportWebVitals()
