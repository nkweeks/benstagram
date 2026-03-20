import './setupAmplify.js';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { FeedProvider } from './contexts/FeedContext'
import { AuthProvider } from './contexts/AuthContext'
import { MessageProvider } from './contexts/MessageContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <FeedProvider>
          <MessageProvider>
            <App />
          </MessageProvider>
        </FeedProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)
