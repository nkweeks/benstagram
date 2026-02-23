import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './contexts/ThemeContext'
import { FeedProvider } from './contexts/FeedContext'
import { AuthProvider } from './contexts/AuthContext'
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

console.log("Loading Amplify outputs:", outputs);

console.log("Loading Amplify outputs:", outputs);

try {
    const isLocalhost = window.location.hostname === 'localhost';
    
    Amplify.configure({
        ...outputs,
        oauth: {
            domain: outputs?.auth?.oauth?.domain,
            scope: outputs?.auth?.oauth?.scope,
            redirectSignIn: isLocalhost ? 'http://localhost:3333/profile/' : 'https://benstagram.net/profile/',
            redirectSignOut: isLocalhost ? 'http://localhost:3333' : 'https://benstagram.net',
            responseType: 'code'
        }
    });
    console.log("Amplify configured successfully!", Amplify.getConfig());
} catch (e) {
    console.error("Amplify configure failed:", e);
}

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
