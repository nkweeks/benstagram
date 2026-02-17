import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { FeedProvider } from './contexts/FeedContext'
import { AuthProvider } from './contexts/AuthContext'
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <FeedProvider>
          <App />
        </FeedProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)
