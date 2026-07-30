import './bigintSerialization'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { reportWebVitals } from './reportWebVitals'
import { App } from '@/pages/App'

import './styles/bootstrap.scss'

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

reportWebVitals()
