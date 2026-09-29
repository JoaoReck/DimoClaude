import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for PWA capabilities
if ('serviceWorker' in navigator) {
  // A new SW taking control means a new deploy was just picked up. Reload
  // once so the page actually renders the new index.html/bundle instead of
  // silently keeping the old one running until the next manual reopen.
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });

  const register = () => navigator.serviceWorker.register('/sw.js').catch((err) => {
    console.warn('PWA service worker registration notice:', err);
  });

  if (process.env.NODE_ENV === 'production') {
    window.addEventListener('load', register);
  } else {
    register();
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

