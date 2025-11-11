const CONFIG = {
  BASE_URL: 'https://story-api.dicoding.dev/v1',
  // VAPID public key dari dokumentasi Story API Dicoding
  // 
  // ========================================
  // CARA MENDAPATKAN VAPID KEY:
  // ========================================
  // 1. Buka dokumentasi Story API di platform Dicoding Academy
  // 2. Cari bagian "Push Notification" atau "Web Push"
  // 3. Salin VAPID Public Key yang tersedia di dokumentasi
  // 4. Paste key tersebut di bawah ini (format: base64url string, biasanya ~87 karakter)
  // 
  // VAPID key sudah tersedia di dokumentasi Story API, tidak perlu request ke endpoint
  // 
  // ========================================
  // CARA MENGUJI VAPID KEY SUDAH BENAR:
  // ========================================
  // 1. Buka aplikasi di browser (jalankan: npm run serve)
  // 2. Buka Browser Console (F12 > Console tab)
  // 3. Saat aplikasi load, akan muncul log verifikasi VAPID key:
  //    - ✅ "VAPID key format valid" = Key sudah benar
  //    - ❌ atau ⚠️ = Key masih salah/placeholder
  // 4. Klik tombol "🔔 Aktifkan Notifikasi" di halaman home
  // 5. Jika berhasil subscribe tanpa error = VAPID key benar
  // 6. Jika muncul error "Invalid VAPID key" = Key masih salah
  // 
  // ATAU test manual di Console:
  // import { verifyVapidKey } from './utils/push-notification';
  // verifyVapidKey();
  // 
  // ========================================
  VAPID_PUBLIC_KEY: 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk',
};

export default CONFIG;
