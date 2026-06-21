import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { seedData } from './data/seedData'
import { authService } from './services/auth.service'

// Seed app data (family members, transactions, etc.) — runs once
seedData()

// Seed default admin account — runs once
authService.seedDefaultUser()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
