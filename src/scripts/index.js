// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import { initializePushNotifications } from './utils/push-notification';

// Register Service Worker untuk PWA
if ('serviceWorker' in navigator) {
  // Register immediately when page loads
  window.addEventListener('load', async () => {
    try {
      // Gunakan relative path untuk GitHub Pages subfolder
      const swPath = './sw.js';
      const registration = await navigator.serviceWorker.register(swPath, {
        scope: './'
      });
      console.log('Service Worker registered successfully:', registration.scope);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('Service Worker ready!');
      
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
      console.error('Service Worker registration failed:', error);
      console.error('Error details:', error.message);
      // Try alternative path (absolute)
      try {
        const altRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('Service Worker registered with absolute path');
      } catch (altError) {
        console.error('Alternative registration also failed:', altError);
      }
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
