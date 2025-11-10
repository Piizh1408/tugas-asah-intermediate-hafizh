// CSS imports
import '../styles/styles.css';

import App from './pages/app';
import { initializePushNotifications } from './utils/push-notification';

// Register Service Worker untuk PWA
if ('serviceWorker' in navigator) {
  // Register immediately when page loads
  window.addEventListener('load', async () => {
    try {
      // Unregister semua service worker lama dengan scope root (jika ada)
      // Ini penting untuk menghindari konflik dengan service worker lama
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          if (registration.scope === window.location.origin + '/') {
            console.log('🗑️ Unregistering old service worker with root scope:', registration.scope);
            await registration.unregister();
          }
        }
      } catch (unregError) {
        console.warn('Warning: Could not unregister old service workers:', unregError);
      }
      
      // Get base path untuk GitHub Pages subfolder
      const getBasePath = () => {
        const pathname = window.location.pathname;
        console.log('📍 Current pathname:', pathname);
        console.log('📍 Current href:', window.location.href);
        
        // Jika pathname adalah '/' (root), return '/'
        if (pathname === '/') {
          console.log('📍 Detected root path');
          return '/';
        }
        
        // Jika pathname berakhir dengan '/', itu adalah base path
        if (pathname.endsWith('/')) {
          console.log('📍 Detected base path with trailing slash:', pathname);
          return pathname;
        }
        
        // Jika pathname berakhir dengan '/index.html' atau '/index.html#/...'
        if (pathname.includes('/index.html')) {
          const base = pathname.substring(0, pathname.indexOf('/index.html') + 1);
          console.log('📍 Detected base path from index.html:', base);
          return base;
        }
        
        // Untuk path lainnya, ambil sampai slash terakhir + 1
        const lastSlash = pathname.lastIndexOf('/');
        if (lastSlash > 0) {
          const base = pathname.substring(0, lastSlash + 1);
          console.log('📍 Detected base path from last slash:', base);
          return base;
        }
        
        // Fallback: jika ada segment path (bukan root), gunakan path sampai slash terakhir
        const segments = pathname.split('/').filter(s => s);
        if (segments.length > 0) {
          const base = '/' + segments.join('/') + '/';
          console.log('📍 Detected base path from segments:', base);
          return base;
        }
        
        console.log('📍 Using root as fallback');
        return '/';
      };
      
      const basePath = getBasePath();
      // Normalize: pastikan basePath selalu berakhir dengan '/'
      const normalizedBasePath = basePath.endsWith('/') ? basePath : basePath + '/';
      // Pastikan basePath dimulai dengan '/'
      const finalBasePath = normalizedBasePath.startsWith('/') ? normalizedBasePath : '/' + normalizedBasePath;
      
      const swPath = finalBasePath + 'sw.js';
      const swScope = finalBasePath;
      
      console.log('📁 Final base path:', finalBasePath);
      console.log('📁 Service Worker path:', swPath);
      console.log('📁 Service Worker scope:', swScope);
      console.log('📁 Full URL:', window.location.href);
      
      // Register service worker dengan path dan scope yang benar
      const registration = await navigator.serviceWorker.register(swPath, {
        scope: swScope
      });
      console.log('✅ Service Worker registered successfully!');
      console.log('✅ Registration scope:', registration.scope);
      console.log('✅ Registration active:', registration.active);
      console.log('✅ Registration installing:', registration.installing);
      console.log('✅ Registration waiting:', registration.waiting);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready!');
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🔄 New service worker found, state:', newWorker.state);
        newWorker.addEventListener('statechange', () => {
          console.log('🔄 Service worker state changed to:', newWorker.state);
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('✅ New service worker installed and active');
          }
        });
      });
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Current location:', window.location.href);
      console.error('❌ Current pathname:', window.location.pathname);
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
