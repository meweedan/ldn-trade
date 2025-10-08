import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AppThemeProvider from './themeProvider';
import './i18n';
import i18n from 'i18next';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './auth/AuthContext';
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tunnel:
    process.env.REACT_APP_SENTRY_TUNNEL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:4000/monitoring" : "/monitoring"),
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: true,
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>
      <AppThemeProvider initialColorMode="light" direction={i18n.dir() as 'ltr' | 'rtl'}>
        <LanguageProvider>
          <AuthProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </AppThemeProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);

// Set dir attribute for RTL/LTR based on current language
document.documentElement.setAttribute('dir', i18n.dir());
i18n.on('languageChanged', () => {
  document.documentElement.setAttribute('dir', i18n.dir());
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
