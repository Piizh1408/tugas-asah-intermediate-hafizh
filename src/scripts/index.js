// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import { initializePushNotifications } from './utils/push-notification';

// Register Service Worker untuk PWA
if ('serviceWorker' in navigator) {
  // Register immediately when page loads
  window.addEventListener('load', async () => {
    try {
      // Get base path untuk GitHub Pages subfolder
      // Contoh: https://piizh1408.github.io/tugas-asah-intermediate-hafizh/
      // Base path akan menjadi: /tugas-asah-intermediate-hafizh/
      const getBasePath = () => {
        const path = window.location.pathname;
        // Jika path adalah root atau index.html, ambil path sampai sebelum filename
        if (path === '/' || path.endsWith('/index.html') || path.endsWith('/')) {
          return path.endsWith('/') ? path : path.substring(0, path.lastIndexOf('/') + 1);
        }
        // Jika ada path lain, ambil base path
        return path.substring(0, path.lastIndexOf('/') + 1);
      };
      
      const basePath = getBasePath();
      const swPath = basePath + 'sw.js';
      const swScope = basePath;
      
      console.log('Registering Service Worker:', swPath, 'with scope:', swScope);
      
      const registration = await navigator.serviceWorker.register(swPath, {
        scope: swScope
      });
      console.log('✅ Service Worker registered successfully:', registration.scope);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready!');
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New service worker available');
          }
        });
      });
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      console.error('Error details:', error.message);
    }
  });

  // Handle service worker controller change
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  // Initialize push notifications after app loads
  await initializePushNotifications();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
