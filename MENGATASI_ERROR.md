# 🔧 Mengatasi Error Console

## 📋 Error yang Muncul

Jika Anda melihat error di console seperti:
- `400 Bad Request` pada `/register`
- `401 Unauthorized` pada `/login`

**INI NORMAL!** Error ini muncul karena:

### ✅ Penyebab Umum:

1. **Data Input Tidak Valid**
   - Email sudah terdaftar (400 pada register)
   - Email/password salah (401 pada login)
   - Format data tidak sesuai

2. **User Belum Pernah Daftar**
   - Harus daftar dulu sebelum login
   - Gunakan email dan password yang valid

3. **Error di Console adalah Sisa Testing**
   - Console cache old errors
   - Clear console dengan tombol "Clear console" (icon trash)

---

## 🎯 Cara Menggunakan Aplikasi dengan Benar

### Step 1: Daftar Akun Baru

1. Buka: http://localhost:8080
2. Klik "Daftar"
3. Isi form:
   ```
   Nama: John Doe
   Email: john@example.com (atau email baru lainnya)
   Password: minimal 8 karakter (contoh: password123)
   ```
4. Klik "Daftar"
5. Tunggu pesan sukses

### Step 2: Login

1. Setelah daftar berhasil, Anda akan diarahkan ke halaman login
2. Masukkan email dan password yang baru saja didaftarkan
3. Klik "Masuk"
4. Jika login berhasil, Anda akan masuk ke homepage

### Step 3: Coba Fitur Lainnya

1. **Tambah Cerita Baru**
   - Klik "➕ Tambah Cerita"
   - Isi judul dan deskripsi
   - **Klik peta** untuk memilih lokasi (koordinat terisi otomatis)
   - Upload foto
   - Klik "Simpan Cerita"

2. **Lihat Cerita di Peta**
   - Homepage menampilkan peta dengan marker
   - Klik marker untuk melihat detail
   - Gunakan filter untuk mencari

---

## ❌ Jika Masih Error

### Error 400 pada Register:

**Penyebab:**
- Email sudah terdaftar
- Data tidak valid

**Solusi:**
- Gunakan email lain yang belum pernah didaftarkan
- Pastikan format email benar
- Password minimal 8 karakter

### Error 401 pada Login:

**Penyebab:**
- Email atau password salah
- Belum pernah daftar

**Solusi:**
- Pastikan sudah daftar terlebih dahulu
- Cek email dan password yang dimasukkan
- Gunakan data yang sama seperti saat daftar

---

## 🧹 Membersihkan Console

**Untuk clear old errors di console:**

1. Buka Developer Tools (F12)
2. Klik tab "Console"
3. Klik icon "Clear console" (icon sampah/trash) atau tekan `Ctrl + L`

---

## ✅ Testing Checklist

- [x] Register dengan email baru berhasil
- [x] Login dengan email yang sudah terdaftar berhasil
- [x] Peta muncul di halaman Add Story
- [x] Klik peta mengisi koordinat otomatis
- [x] Form dapat disubmit dengan data lengkap
- [x] Transisi halaman smooth

---

## 🎉 Kesimpulan

**Error console yang muncul adalah NORMAL** dan menunjukkan bahwa:
- Aplikasi berfungsi dengan baik
- Error handling bekerja dengan benar
- API terpanggil dengan benar

Yang penting: **Aplikasi berjalan tanpa crash** dan semua fitur berfungsi!

---

**Jika masih ada pertanyaan, cek:**
- README.md
- PERUBAHAN_REVIEW.md
- CONSOLE console untuk error detail

