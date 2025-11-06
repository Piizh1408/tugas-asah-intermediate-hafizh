# 📖 Panduan Menggunakan StoryMap

## Cara Menjalankan Aplikasi

### 1. Development Mode (Disarankan untuk Development)

```bash
cd starter-project-with-webpack
npm run start-dev
```

Aplikasi akan berjalan di `http://localhost:8080` dengan hot reload.

### 2. Production Build

```bash
cd starter-project-with-webpack
npm run build
npm run serve
```

Aplikasi akan di-build dan di-serve di `http://localhost:8080`

## Alur Penggunaan Aplikasi

### 1. Registrasi
- Buka aplikasi, klik "Daftar"
- Isi form: Nama, Email, Password (min 8 karakter)
- Klik "Daftar"
- Setelah berhasil, akan diarahkan ke halaman Login

### 2. Login
- Masukkan Email dan Password yang sudah didaftarkan
- Klik "Masuk"
- Setelah berhasil login, akan diarahkan ke Homepage

### 3. Melihat Cerita di Peta
- Homepage menampilkan peta dengan marker cerita
- Sidebar kanan menampilkan daftar cerita
- Klik marker di peta untuk melihat popup detail
- Gunakan filter untuk mencari cerita (Semua, Sains, Sejarah, Alam)

### 4. Menambah Cerita Baru
- Klik tombol "➕ Tambah Cerita" di Homepage
- Isi form:
  - Judul cerita
  - Deskripsi (min 10 karakter)
  - Latitude (-90 sampai 90)
  - Longitude (-180 sampai 180)
  - Upload foto (maks 2MB)
- Preview foto akan muncul setelah upload
- Klik "Simpan Cerita"
- Setelah berhasil, akan diarahkan kembali ke Homepage

### 5. Logout
- Klik tombol "Keluar" di menu navigasi
- Session akan dihapus dan diarahkan ke halaman Login

## Keyboard Navigation

Aplikasi dapat digunakan sepenuhnya dengan keyboard:
- `Tab` - Pindah ke elemen berikutnya
- `Shift + Tab` - Pindah ke elemen sebelumnya
- `Enter` - Aktifkan tombol/form
- `Esc` - Tutup modal/drawer
- `Home` - Skip to main content

## Catatan Penting

1. **Internet Connection**: Pastikan koneksi internet aktif untuk mengakses API
2. **API Base URL**: `https://story-api.dicoding.dev/v1`
3. **Token Expiry**: Token login disimpan di localStorage dan akan hilang saat logout atau clear browser cache
4. **File Upload**: Hanya file gambar (JPG, PNG, GIF) maksimal 2MB yang dapat diupload

## Troubleshooting

### "Gagal memuat cerita"
- Pastikan koneksi internet aktif
- Pastikan sudah login dengan benar
- Refresh halaman atau coba logout lalu login lagi

### "Koordinat tidak valid"
- Latitude harus antara -90 dan 90
- Longitude harus antara -180 dan 180
- Gunakan format desimal (contoh: -7.2575, 112.7521)

### "Ukuran file terlalu besar"
- Kompres foto sebelum upload
- Gunakan format JPG untuk ukuran lebih kecil
- Batas maksimal adalah 2MB

### Aplikasi tidak dapat diakses
- Pastikan sudah menjalankan `npm install`
- Pastikan tidak ada aplikasi lain yang menggunakan port 8080
- Coba gunakan `npm run build` lalu `npm run serve`

## Kontak & Support

Untuk pertanyaan atau masalah teknis, silakan hubungi support Dicoding atau baca dokumentasi lengkap di README.md

