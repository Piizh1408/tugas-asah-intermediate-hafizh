# 🧪 TEST PUSH NOTIFICATION - Step by Step

## ⚠️ PENTING: Pastikan Aplikasi di-Serve via HTTP

Service Worker **HANYA** bekerja di:
- ✅ `http://localhost:8080`
- ✅ `http://127.0.0.1:8080`
- ✅ HTTPS

**TIDAK BEKERJA** di:
- ❌ `file:///C:/.../index.html`
- ❌ Double-click file HTML

---

## 📋 LANGKAH TEST:

### 1. Buka Terminal/PowerShell
```bash
cd "C:\Users\HP\Documents\tugas hafidz\starter-project-with-webpack"
```

### 2. Build Aplikasi
```bash
npm run build
```
**Tunggu sampai selesai!** Harus ada pesan "webpack compiled successfully"

### 3. Serve Aplikasi dengan HTTP Server
```bash
npm run serve
```

**PENTING:** Terminal akan menampilkan:
```
Starting up http-server, serving dist
Available on:
  http://127.0.0.1:8080
  http://localhost:8080
```

**JANGAN TUTUP TERMINAL INI!** Biarkan tetap running.

### 4. Buka Browser
**JANGAN double-click file HTML!**

Ketik di address bar browser:
```
http://localhost:8080
```

**ATAU:**
```
http://127.0.0.1:8080
```

**Pastikan URL dimulai dengan `http://` (bukan `file://`)**

### 5. Cek Console (F12)
Buka DevTools (tekan F12), tab **Console**:

**Harus ada log:**
- ✅ `Service Worker registered successfully`
- ✅ `Service Worker ready!`

**Jalankan di Console:**
```javascript
console.log('Service Worker:', 'serviceWorker' in navigator);
console.log('Push Manager:', 'PushManager' in window);
```

**Hasil yang benar:**
- `Service Worker: true`
- `Push Manager: true`

### 6. Cek Service Worker di DevTools
1. DevTools → Tab **Application**
2. Di sidebar, klik **Service Workers**
3. Harus terlihat service worker dengan status:
   - **Status:** "activated and is running"
   - **Source:** `http://localhost:8080/sw.js`

### 7. Refresh Halaman
Tekan **Ctrl+Shift+R** (hard refresh), tunggu 5 detik.

### 8. Login ke Aplikasi
1. Login dengan akun Anda
2. Buka homepage

### 9. Cek Tombol Push Notification
**Tombol harus menampilkan:**
- ✅ **"🔔 Aktifkan Notifikasi"** (abu-abu) - jika belum subscribe
- ✅ **"🔔 Matikan Notifikasi"** (hijau) - jika sudah subscribe

**BUKAN:**
- ❌ "🔔 Notifikasi Tidak Didukung"

---

## 🔍 Troubleshooting

### Masalah: Console masih `Service Worker: false`
**Penyebab:** Aplikasi tidak di-serve via HTTP

**Solusi:**
1. Pastikan menjalankan `npm run serve` (terminal harus tetap terbuka)
2. Pastikan URL di browser: `http://localhost:8080` (bukan `file://`)
3. Cek apakah terminal masih running (jangan tutup!)

### Masalah: Service Worker tidak terdaftar di DevTools
**Solusi:**
1. Hard refresh: Ctrl+Shift+R
2. Tunggu 10 detik
3. Cek lagi di Application > Service Workers

### Masalah: Tombol masih "Tidak Didukung"
**Solusi:**
1. Pastikan service worker sudah registered (cek Console)
2. Refresh halaman (Ctrl+Shift+R)
3. Tunggu 5-10 detik
4. Jika masih, cek Console untuk error

### Masalah: Port 8080 sudah digunakan
**Solusi:**
1. Tutup aplikasi lain yang pakai port 8080
2. Atau ubah port di `package.json`:
   ```json
   "serve": "http-server dist -p 3000"
   ```
   Lalu buka: `http://localhost:3000`

---

## ✅ Checklist Final:

- [ ] Sudah build dengan `npm run build`
- [ ] Sudah serve dengan `npm run serve` (terminal masih running)
- [ ] Browser menampilkan `http://localhost:8080` (bukan file://)
- [ ] Console menunjukkan `Service Worker: true`
- [ ] Console ada log "Service Worker registered successfully"
- [ ] DevTools > Application > Service Workers: ada service worker aktif
- [ ] Tombol push notification menampilkan "Aktifkan Notifikasi"

Jika semua checklist ✅, push notification akan bekerja!

---

## 🎯 Quick Test Script

Jalankan di Console browser (setelah buka http://localhost:8080):

```javascript
// Test 1: Check Support
console.log('=== TEST PUSH NOTIFICATION ===');
console.log('Service Worker:', 'serviceWorker' in navigator);
console.log('Push Manager:', 'PushManager' in window);

// Test 2: Check Registration
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Worker Registrations:', regs.length);
  if (regs.length > 0) {
    console.log('✅ Service Worker terdaftar!');
  } else {
    console.log('❌ Service Worker TIDAK terdaftar!');
  }
});

// Test 3: Check Ready
navigator.serviceWorker.ready.then(reg => {
  console.log('✅ Service Worker ready:', reg.scope);
}).catch(err => {
  console.log('❌ Service Worker NOT ready:', err);
});
```

Jika semua test ✅, tombol akan bekerja!

