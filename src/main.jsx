import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { gapi } from 'gapi-script';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import theme from './theme';
const initializeGapi = async () => {
  try {
    await gapi.load('auth2', () => {
      gapi.auth2.init({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'profile email',
      });
    });
  } catch (error) {
    console.error('Error initializing Google API:', error);
  }
};
initializeGapi();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
