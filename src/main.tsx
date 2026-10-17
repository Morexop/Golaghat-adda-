import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { testConnection, ensureAnonymousAuth } from './lib/firebase';

// Validate connection and bootstrap anonymous session on app boot
testConnection().catch((err) => {
  console.warn('Initial Firebase connectivity notice:', err);
});

ensureAnonymousAuth().catch((err) => {
  console.warn('Anonymous auth initialization notice:', err);
});

// Register Service Worker for Android PWA installability & offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker notice:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
