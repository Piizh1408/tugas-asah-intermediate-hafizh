# 🚀 Quick Start Guide - StoryMap

## ⚡ Cara Cepat Menjalankan

### Via Terminal/PowerShell:

1. **Buka Terminal di folder proyek:**
   ```bash
   cd "C:\Users\HP\Documents\tugas hafidz\starter-project-with-webpack"
   ```

2. **Jalankan Development Server:**
   ```bash
   npm run start-dev
   ```

3. **Buka Browser dan akses:**
   ```
   http://localhost:8080
   ```

---

## 📋 Checklist Sebelum Menjalankan

- ✅ Node.js sudah terinstall
- ✅ `npm install` sudah dijalankan (sudah ada node_modules)
- ✅ Koneksi internet aktif (untuk Story API)
- ✅ Port 8080 tersedia

---

## 🎯 Test Case untuk Submission

### 1. Test Authentication ✅
- [ ] Daftar akun baru dengan email & password valid
- [ ] Login dengan akun yang sudah dibuat
- [ ] Logout berfungsi

### 2. Test Peta Interaktif ✅
- [ ] Peta tampil dengan marker cerita
- [ ] List cerita di sidebar tampil
- [ ] Klik marker menampilkan popup detail
- [ ] Filter berfungsi (Semua, Sains, Sejarah, Alam)

### 3. Test Tambah Cerita ✅
- [ ] Form validasi berfungsi
- [ ] Upload foto dengan preview
- [ ] Pesan error tampil jika validasi gagal
- [ ] Pesan sukses tampil saat berhasil
- [ ] Cerita baru tampil di peta setelah ditambah

### 4. Test Aksesibilitas ✅
- [ ] Skip to content link berfungsi
- [ ] Keyboard navigation berfungsi
- [ ] Screen reader menangkap semua elemen
- [ ] Focus indicators terlihat jelas

---

## 🔧 Troubleshooting

### Error: "Cannot find module"
**Solusi:**
```bash
npm install
```

### Error: "Port 8080 already in use"
**Solusi:** Matikan aplikasi yang menggunakan port 8080 atau ubah port di `webpack.dev.js`

### Error: "Execution Policy"
**Solusi:** Jika masih error, jalankan PowerShell sebagai Administrator dan ketik:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "Failed to fetch stories"
**Solusi:** Pastikan internet koneksi aktif dan bisa akses `https://story-api.dicoding.dev/v1`

---

## 📱 Testing di Berbagai Browser

Test aplikasi di:
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari (Mac)

---

## 📦 Untuk Production Build

Jika ingin build untuk production dan deploy:

```bash
npm run build
npm run serve
```

File production ada di folder `dist/`

---

## 📞 Butuh Bantuan?

Lihat dokumentasi lengkap di:
- `README.md` - Dokumentasi umum
- `CARA_MENGGUNAKAN.md` - Panduan detail

---

**Selamat mencoba! 🎉**

