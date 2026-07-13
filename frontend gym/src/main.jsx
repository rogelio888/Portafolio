import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ApiSimLogProvider } from './context/ApiSimLogContext'
import ApiSimConsole from './components/ApiSimConsole'
import App from './App.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <ApiSimLogProvider>
        <AuthProvider>
          <App />
          <ApiSimConsole />
        </AuthProvider>
      </ApiSimLogProvider>
    </HashRouter>
  </React.StrictMode>,
)
