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

// Resolve backend base for Sentry tunnel (production) and upgrade to https on secure pages
const rawBackendBase =
  process.env.REACT_APP_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');
let backendBase = rawBackendBase;
try {
  if (typeof window !== 'undefined' && /^https:/i.test(window.location.protocol)) {
    const u = new URL(backendBase);
    if (u.protocol === 'http:' && u.hostname !== 'localhost') {
      u.protocol = 'https:';
      backendBase = u.toString();
    }
  }
} catch {}

const sentryTunnel =
  process.env.REACT_APP_SENTRY_TUNNEL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000/monitoring'
    : backendBase
    ? `${backendBase.replace(/\/$/, '')}/monitoring`
    : '/monitoring');

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tunnel: sentryTunnel,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: true,
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const AppShell = (
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
);

root.render(
  process.env.NODE_ENV === 'development' ? (
    <React.StrictMode>{AppShell}</React.StrictMode>
  ) : (
    AppShell
  )
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
