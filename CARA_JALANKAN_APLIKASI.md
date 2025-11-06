# 🚀 Cara Menjalankan Aplikasi StoryMap

## 📋 Prasyarat
Pastikan sudah terinstall:
- Node.js (versi 14 atau lebih baru)
- npm (biasanya sudah termasuk dengan Node.js)

## 🔧 Langkah 1: Install Dependencies

Buka terminal/command prompt di folder project dan jalankan:

```bash
cd "C:\Users\HP\Documents\tugas hafidz\starter-project-with-webpack"
npm install
```

Ini akan menginstall semua package yang diperlukan (webpack, babel, leaflet, dll).

## 🛠️ Langkah 2: Pilih Mode Jalan

### Opsi A: Development Mode (Recommended untuk development)

**Keuntungan:**
- Hot reload (perubahan langsung terlihat)
- Lebih cepat untuk development
- Error lebih mudah di-debug

**Cara jalankan:**
```bash
npm run start-dev
```

Aplikasi akan berjalan di: **http://localhost:8080**

Buka browser dan akses URL tersebut.

---

### Opsi B: Production Build (Recommended untuk testing final)

**Keuntungan:**
- Build yang dioptimasi
- Mirip dengan environment production
- Lebih sesuai untuk testing sebelum submission

**Cara jalankan:**
```bash
# Step 1: Build aplikasi
npm run build

# Step 2: Serve aplikasi
npm run serve
```

Aplikasi akan berjalan di: **http://localhost:8080**

**Catatan Penting:**
- Setelah build, semua file akan ada di folder `dist/`
- Service Worker dan Manifest akan otomatis ter-copy ke folder `dist/`

---

## ✅ Verifikasi Aplikasi Berjalan

### 1. Check Browser Console
Buka browser DevTools (F12) dan cek Console:
- Tidak ada error merah
- Service Worker terdaftar: "Service Worker registered successfully"
- Push notification ter-initialize (jika sudah login)

### 2. Check Service Worker
- Buka DevTools > **Application** tab
- Klik **Service Workers** di sidebar
- Harus terlihat service worker aktif dengan status "activated and is running"

### 3. Check Manifest
- DevTools > **Application** > **Manifest**
- Harus terlihat info aplikasi (name, icons, theme color, dll)

### 4. Check IndexedDB
- DevTools > **Application** > **IndexedDB**
- Harus ada database "StoryMapDB" dengan object store "stories"

---

## 🧪 Testing Fitur

### 1. Test Login/Register
1. Buka aplikasi
2. Klik "Daftar" untuk membuat akun baru
3. Atau klik "Masuk" jika sudah punya akun

### 2. Test PWA Installation
1. Setelah login, cek address bar browser
2. Harus muncul icon "Install" atau "Add to Home Screen"
3. Klik untuk install aplikasi

### 3. Test Push Notification
1. Setelah login, push notification akan otomatis subscribe
2. Cek console untuk melihat log: "Push notification subscribed successfully"
3. Test via DevTools:
   - Application > Service Workers > Push
   - Atau gunakan API untuk trigger push notification

### 4. Test IndexedDB
1. Setelah login, stories dari API akan otomatis tersimpan ke IndexedDB
2. Cek DevTools > Application > IndexedDB > StoryMapDB > stories
3. Harus ada data stories yang tersimpan
4. Klik tombol "🗑️ Hapus" pada story card untuk test delete
5. Test offline:
   - DevTools > Network > Offline (centang)
   - Refresh halaman
   - Stories dari IndexedDB harus masih muncul

### 5. Test Offline Mode
1. Buka aplikasi dan login
2. Buka DevTools > Network
3. Centang "Offline"
4. Refresh halaman
5. Aplikasi harus masih bisa diakses (minimal app shell)
6. Stories dari IndexedDB harus muncul dengan indikator "📴 Mode Offline"

---

## 🐛 Troubleshooting

### Error: "Cannot find module"
**Solusi:**
```bash
npm install
```

### Error: "Port 8080 already in use"
**Solusi:**
- Tutup aplikasi lain yang menggunakan port 8080
- Atau ubah port di `webpack.dev.js` atau `http-server` config

### Service Worker tidak terdaftar
**Solusi:**
- Pastikan aplikasi di-serve via HTTP (bukan file://)
- Pastikan sudah build dengan `npm run build`
- Clear cache browser: Ctrl+Shift+Delete > Clear cached images and files
- Hard refresh: Ctrl+Shift+R

### Push Notification tidak muncul
**Solusi:**
- Check browser permission untuk notifications
- Pastikan menggunakan HTTPS atau localhost (bukan file://)
- Check console untuk error

### IndexedDB tidak bekerja
**Solusi:**
- Pastikan browser support IndexedDB (Chrome, Firefox, Edge modern)
- Check console untuk error
- Clear IndexedDB di DevTools jika perlu

---

## 📝 Catatan Penting

1. **Untuk Production/Submission:**
   - SELALU build dengan `npm run build` sebelum submit
   - Test dengan `npm run serve` setelah build
   - Pastikan semua file di folder `dist/` lengkap

2. **Service Worker:**
   - Hanya bekerja di HTTPS atau localhost
   - Tidak bekerja di file:// protocol
   - Harus di-build dan di-serve

3. **Push Notification:**
   - Memerlukan permission dari user
   - Hanya bekerja di HTTPS atau localhost
   - Perlu koneksi internet untuk subscribe

4. **IndexedDB:**
   - Data tersimpan di browser
   - Bisa diakses offline
   - Data akan hilang jika clear browser data

---

## 🎯 Quick Start (Paling Cepat)

```bash
# 1. Install (hanya sekali)
npm install

# 2. Development (paling mudah)
npm run start-dev

# Atau Production (untuk testing final)
npm run build
npm run serve
```

---

## 📞 Jika Masih Ada Masalah

1. Check console browser (F12) untuk error
2. Check terminal untuk error saat build/run
3. Pastikan semua dependencies ter-install
4. Pastikan Node.js versi terbaru

**Happy Coding! 🎉**

