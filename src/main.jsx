import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { SimuladorProvider } from './context/SimuladorContext.jsx'
import './index.css'
import './styles/animations.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SimuladorProvider>
      <App />
    </SimuladorProvider>
  </React.StrictMode>
)
