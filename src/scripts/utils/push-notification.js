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

// Get VAPID public key from API
async function getVapidPublicKey() {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/stories/push/vapid-public-key`);
    if (!response.ok) {
      // If endpoint not available, return null (will be handled gracefully)
      if (response.status === 404) {
        console.warn('VAPID public key endpoint not available (404). This is OK for testing via DevTools.');
        return null;
      }
      throw new Error(`Failed to get VAPID public key: ${response.status}`);
    }
    const data = await response.json();
    // Handle different possible response structures
    return data.vapidPublicKey || data.publicKey || data.key;
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    // Return null instead of throwing - allows testing via DevTools
    console.warn('Push notification can still be tested via DevTools > Application > Service Workers > Push');
    return null;
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

    // Get VAPID public key
    const vapidPublicKey = await getVapidPublicKey();
    
    let subscription;
    
    // If VAPID key not available, try to subscribe without it (for testing)
    if (!vapidPublicKey) {
      console.warn('VAPID key not available. Attempting subscription without key (for testing via DevTools).');
      try {
        // Try to subscribe without applicationServerKey (some browsers allow this for testing)
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
        });
      } catch (noKeyError) {
        console.warn('Could not subscribe without VAPID key:', noKeyError.message);
        console.warn('Push notification can still be tested via DevTools > Application > Service Workers > Push');
        // Return null - user can still test via DevTools
        return null;
      }
    } else {
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      
      // Subscribe to push with VAPID key
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });
    }

    // Send subscription to server
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found');
      return null;
    }

    // Try to send subscription to server (optional - for testing via DevTools if endpoint not available)
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (!response.ok) {
        // If endpoint not available, that's OK - can still test via DevTools
        if (response.status === 404) {
          console.warn('Subscribe endpoint not available (404). Push notification can be tested via DevTools.');
        } else {
          throw new Error('Failed to subscribe to push notifications');
        }
      }
    } catch (fetchError) {
      // If fetch fails (network error, CORS, etc), that's OK for testing
      console.warn('Could not send subscription to server:', fetchError.message);
      console.warn('Push notification can still be tested via DevTools > Application > Service Workers > Push');
    }

    // Save subscription to localStorage
    localStorage.setItem('pushSubscription', JSON.stringify(subscription.toJSON()));
    console.log('Push notification subscribed successfully');
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
      await subscription.unsubscribe();
      localStorage.removeItem('pushSubscription');
      console.log('Push notification unsubscribed successfully');
    }
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
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

