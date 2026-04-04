import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { LocalizationProvider } from './contexts/LocalizationContext'
import { PermissionProvider } from './contexts/PermissionContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LocalizationProvider>
        <PermissionProvider>
          <App />
        </PermissionProvider>
      </LocalizationProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
