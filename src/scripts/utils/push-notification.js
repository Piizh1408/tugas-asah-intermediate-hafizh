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
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications are not supported');
    return null;
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // Register service worker
    const registration = await navigator.serviceWorker.ready;

    // Get VAPID public key dari config (sesuai dokumentasi Story API)
    const vapidPublicKey = getVapidPublicKey();
    
    if (!vapidPublicKey) {
      throw new Error('VAPID public key tidak ditemukan di config');
    }
    
    // Convert VAPID key dan subscribe
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    
    // Subscribe to push dengan VAPID key dari dokumentasi Story API
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    });

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
    console.error('Error subscribing to push notifications:', error);
    return null;
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

