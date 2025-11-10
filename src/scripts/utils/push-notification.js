// Push Notification utility
import CONFIG from '../config';

// Convert VAPID public key from base64url to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Get VAPID public key from config (sesuai dokumentasi Story API)
function getVapidPublicKey() {
  // VAPID key sudah tersedia di dokumentasi Story API, gunakan langsung dari config
  return CONFIG.VAPID_PUBLIC_KEY;
}

// Verify VAPID key format and validity
export function verifyVapidKey() {
  const key = getVapidPublicKey();
  
  if (!key) {
    console.error('❌ VAPID key tidak ditemukan di config');
    return false;
  }
  
  // Check if key is not placeholder
  if (key.length > 150) {
    console.warn('⚠️ VAPID key terlalu panjang, kemungkinan masih placeholder');
    console.warn('   Format VAPID key yang benar biasanya ~87 karakter (base64url)');
    return false;
  }
  
  // Check format (base64url: alphanumeric, -, _)
  const base64urlPattern = /^[A-Za-z0-9_-]+$/;
  if (!base64urlPattern.test(key)) {
    console.error('❌ Format VAPID key tidak valid (harus base64url: A-Z, a-z, 0-9, -, _)');
    return false;
  }
  
  // Try to convert to Uint8Array to verify it's valid
  try {
    const testArray = urlBase64ToUint8Array(key);
    if (testArray.length === 0 || testArray.length !== 65) {
      console.warn('⚠️ VAPID key length tidak sesuai (harus menghasilkan 65 bytes)');
      return false;
    }
    console.log('✅ VAPID key format valid');
    console.log(`   Key length: ${key.length} karakter`);
    console.log(`   Converted to: ${testArray.length} bytes`);
    return true;
  } catch (error) {
    console.error('❌ Error converting VAPID key:', error.message);
    console.error('   Pastikan key adalah format base64url yang valid');
    return false;
  }
}

// Subscribe to push notifications
export async function subscribeToPushNotifications() {
  // Check browser support
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker tidak didukung di browser ini. Gunakan browser modern seperti Chrome, Firefox, atau Edge.');
  }

  if (!('PushManager' in window)) {
    throw new Error('Push Notification tidak didukung di browser ini. Gunakan browser modern seperti Chrome, Firefox, atau Edge.');
  }

  // Check if we're on HTTPS or localhost
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    throw new Error('Push Notification hanya bekerja di HTTPS atau localhost. Aplikasi harus di-deploy dengan HTTPS.');
  }

  try {
    // Wait for service worker to be ready (dengan timeout)
    let registration = null;
    const maxWaitTime = 10000; // 10 seconds
    const startTime = Date.now();
    
    while (!registration && (Date.now() - startTime) < maxWaitTime) {
      try {
        registration = await navigator.serviceWorker.ready;
        if (registration) break;
      } catch (e) {
        // Service worker belum ready, tunggu sebentar
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!registration) {
      throw new Error('Service Worker belum siap. Pastikan Service Worker sudah ter-register dengan benar. Refresh halaman dan coba lagi.');
    }

    console.log('✅ Service Worker ready for push notification');

    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('✅ Already subscribed to push notifications');
      return existingSubscription;
    }

    // Request notification permission
    console.log('🔔 Requesting notification permission...');
    const permission = await Notification.requestPermission();
    
    if (permission === 'denied') {
      throw new Error('Izin notifikasi ditolak. Untuk mengaktifkan notifikasi:\n1. Klik icon gembok/kunci di address bar\n2. Set "Notifications" ke "Allow"\n3. Refresh halaman dan coba lagi');
    }
    
    if (permission === 'default') {
      throw new Error('Izin notifikasi belum diberikan. Silakan berikan izin notifikasi ketika diminta, kemudian coba lagi.');
    }
    
    if (permission !== 'granted') {
      throw new Error('Izin notifikasi tidak diberikan. Status: ' + permission);
    }

    console.log('✅ Notification permission granted');

    // Get VAPID public key dari config (sesuai dokumentasi Story API)
    const vapidPublicKey = getVapidPublicKey();
    
    if (!vapidPublicKey) {
      throw new Error('VAPID public key tidak ditemukan di config');
    }

    // Verify VAPID key format
    try {
      const testKey = urlBase64ToUint8Array(vapidPublicKey);
      if (testKey.length !== 65) {
        throw new Error('VAPID key format tidak valid');
      }
    } catch (keyError) {
      throw new Error('VAPID public key tidak valid. Pastikan VAPID key dari dokumentasi Story API sudah benar.');
    }
    
    console.log('✅ VAPID key valid');
    
    // Convert VAPID key dan subscribe
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    
    console.log('📡 Subscribing to push notifications...');
    
    // Subscribe to push dengan VAPID key dari dokumentasi Story API
    let subscription;
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });
      console.log('✅ Push subscription created in browser');
    } catch (subscribeError) {
      console.error('❌ Error subscribing to push:', subscribeError);
      if (subscribeError.name === 'NotAllowedError') {
        throw new Error('Push subscription tidak diizinkan. Pastikan Service Worker sudah aktif dan browser mendukung push notification.');
      } else if (subscribeError.message && subscribeError.message.includes('VAPID')) {
        throw new Error('VAPID key tidak valid. Pastikan menggunakan VAPID key yang benar dari dokumentasi Story API.');
      }
      throw new Error('Gagal subscribe ke push notification: ' + subscribeError.message);
    }

    // Send subscription to server menggunakan endpoint sesuai dokumentasi Story API
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found');
      return null;
    }

    // Format subscription sesuai dokumentasi Story API
    const subscriptionJson = subscription.toJSON();
    
    // Save subscription to localStorage terlebih dahulu
    localStorage.setItem('pushSubscription', JSON.stringify(subscriptionJson));
    console.log('✅ Push subscription created in browser');
    
    // Kirim ke endpoint /notifications/subscribe sesuai dokumentasi
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscriptionJson.endpoint,
          keys: {
            p256dh: subscriptionJson.keys.p256dh,
            auth: subscriptionJson.keys.auth,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        const errorMessage = errorData.message || `Server responded with status ${response.status}`;
        console.warn('⚠️ Warning: Failed to send subscription to server:', errorMessage);
        console.warn('   Push notification masih bisa digunakan untuk testing via DevTools');
        // Jangan throw error, karena subscription sudah berhasil dibuat di browser
        // User masih bisa test via DevTools > Application > Service Workers > Push
      } else {
        const result = await response.json();
        console.log('✅ Push notification subscribed successfully to server:', result);
      }
    } catch (fetchError) {
      console.warn('⚠️ Warning: Error sending subscription to server:', fetchError.message);
      console.warn('   Push notification masih bisa digunakan untuk testing via DevTools');
      console.warn('   Buka DevTools > Application > Service Workers > Push untuk test manual');
      // Jangan throw error, karena subscription sudah berhasil dibuat di browser
    }

    console.log('✅ Push notification subscription ready');
    return subscription;
  } catch (error) {
    console.error('❌ Error subscribing to push notifications:', error);
    // Re-throw error dengan message yang lebih jelas
    if (error.message) {
      throw error;
    }
    throw new Error('Gagal mengaktifkan push notification: ' + (error.toString() || 'Unknown error'));
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const subscriptionJson = subscription.toJSON();
      const token = localStorage.getItem('authToken');
      
      // Unsubscribe dari server menggunakan endpoint DELETE sesuai dokumentasi
      if (token && subscriptionJson.endpoint) {
        try {
          const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              endpoint: subscriptionJson.endpoint,
            }),
          });

          if (!response.ok) {
            console.warn('Failed to unsubscribe from server, but continuing with local unsubscribe');
          } else {
            const result = await response.json();
            console.log('✅ Unsubscribed from server:', result);
          }
        } catch (fetchError) {
          console.warn('Could not send unsubscribe to server:', fetchError.message);
        }
      }
      
      // Unsubscribe dari browser
      await subscription.unsubscribe();
      localStorage.removeItem('pushSubscription');
      console.log('✅ Push notification unsubscribed successfully');
    }
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    throw error;
  }
}

// Check if user is subscribed
export async function isSubscribedToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

// Initialize push notification on app load
export async function initializePushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }

  // Verify VAPID key on initialization
  verifyVapidKey();

  // Check if already subscribed
  const isSubscribed = await isSubscribedToPushNotifications();
  if (!isSubscribed) {
    // Auto-subscribe on login (will be called after user logs in)
    const token = localStorage.getItem('authToken');
    if (token) {
      await subscribeToPushNotifications();
    }
  }
}

