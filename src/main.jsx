import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './GridApp/index.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
