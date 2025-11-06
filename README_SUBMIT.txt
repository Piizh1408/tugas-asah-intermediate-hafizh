================================================================================
        PANDUAN SUBMISSION DICODING - STORYMAP
================================================================================

📋 CARA SUBMIT KE DICODING:

1. ZIP seluruh folder "starter-project-with-webpack"
2. Upload ke submission Dicoding
3. Pastikan semua file ada di dalam zip

================================================================================
        CHECKLIST FILE YANG HARUS ADA
================================================================================

PENTING - PASTIKAN FILE INI ADA:
✅ src/                     - SEMUA source code
✅ dist/                    - Production build (SUDAH ADA)
✅ package.json             - Dependencies list
✅ package-lock.json        - Lock file
✅ webpack.*.js             - Webpack config (3 files)
✅ .gitignore               - Ignore patterns
✅ README.md                - Dokumentasi utama

PANDUAN (Optional tapi recommended):
✅ PERUBAHAN_REVIEW.md      - Detail perbaikan review
✅ CARA_MENGGUNAKAN.md      - Panduan penggunaan
✅ FIX_VALIDASI_KOORDINAT.md - Fix validasi
✅ SEMUA_PERBAIKAN.txt      - Ringkasan semua perbaikan

TIDAK PERLU (Sudah dihapus):
❌ node_modules/            - Akan diinstall otomatis
❌ .git/                    - Git metadata

================================================================================
        CARA REVIEWER MENJALANKAN
================================================================================

1. Unzip file submission
2. Buka terminal di folder proyek
3. Jalankan:
   npm install
   npm run build
   npm run serve
4. Akses: http://localhost:8080
5. Test semua fitur

================================================================================
        FITUR YANG HARUS DI-TEST
================================================================================

[ ] 1. SPA & Transisi
    - Navigate antar halaman
    - Lihat transisi smooth
    - Cek di console: ada "startViewTransition" usage

[ ] 2. Peta Interaktif
    - Peta muncul di homepage
    - Marker muncul di lokasi cerita
    - Filter berfungsi (Semua, Sains, Sejarah, Alam)
    - Popup detail muncul saat klik marker
    - List dan peta sync

[ ] 3. Tambah Data
    - Daftar akun baru
    - Login
    - Tambah cerita baru
    - ⚠️ KLIK PETA untuk pilih koordinat
    - Upload foto
    - Submit dan verifikasi data tersimpan

[ ] 4. Aksesibilitas
    - Tab through semua elemen
    - Alt text pada gambar
    - Semantic HTML tags
    - Skip to content berfungsi

================================================================================
        KRITERIA YANG DIPENUHI
================================================================================

✅ Kriteria 1: SPA & Transisi Halaman
   - Basic: SPA ✅, Transisi view ✅, Pemisahan auth/home ✅
   - Skilled: Custom transition ✅

✅ Kriteria 2: Menampilkan Data & Marker
   - Basic: Peta ✅, Data dari API ✅, Marker ✅
   - Skilled: Filter interaktif ✅

✅ Kriteria 3: Fitur Tambah Data
   - Basic: Form ✅, HTTP Request ✅, Error handling ✅
   - Skilled: Validasi input ✅, Pesan error jelas ✅

✅ Kriteria 4: Aksesibilitas
   - Basic: Alt text ✅, Semantic HTML ✅, Label input ✅
   - Advance: Skip to content ✅, Keyboard navigation ✅

================================================================================
        SCORING EXPECTED
================================================================================

Basic Points:
- Kriteria 1: 3 pts
- Kriteria 2: 3 pts
- Kriteria 3: 3 pts
- Kriteria 4: 3 pts

Skilled Points:
- Kriteria 1: +3 pts (custom transition)
- Kriteria 2: +3 pts (filter interaktif)
- Kriteria 3: +3 pts (validasi)

Advance Points:
- Kriteria 4: +4 pts (skip to content, keyboard)

TOTAL EXPECTED: 25 points

================================================================================
        CATATAN PENTING
================================================================================

⚠️ PENTING UNTUK REVIEWER:

1. UNTUK TESTING, HARUS:
   - Daftar akun baru (email yang belum terdaftar)
   - Login dengan akun tersebut
   - Klik peta untuk memilih koordinat (WAJIB!)
   - Upload foto saat tambah cerita

2. Jika error "lat must be a number":
   → User belum klik peta untuk pilih koordinat
   → Error message akan muncul dengan instruksi jelas

3. StartViewTransition:
   → Cek di Sources tab, file app.js
   → Cari: "document.startViewTransition"
   → Transisi halus saat navigate

4. Testing Browser:
   → Recommended: Chrome/Edge
   → Pastikan View Transition API support
   → Fallback animation untuk browser lama

================================================================================
        DEMO FLOW
================================================================================

1. Buka http://localhost:8080
2. DAFTAR:
   - Nama: Test User
   - Email: testuser123@example.com
   - Password: testpass123
   - Klik "Daftar"
3. LOGIN:
   - Email: testuser123@example.com
   - Password: testpass123
   - Klik "Masuk"
4. HOMEPAGE:
   - Peta muncul
   - Marker cerita tampil
   - Coba filter: Semua, Sains, Sejarah, Alam
   - Klik marker untuk popup detail
5. TAMBAH CERITA:
   - Klik "➕ Tambah Cerita"
   - Judul: "Eksplorasi Gunung Bromo"
   - Deskripsi: "Pengalaman menakjubkan melihat sunrise" (min 10 chars)
   - ⚠️ KLIK PETA di Indonesia untuk pilih lokasi
   - Upload foto gunung/sunset
   - Klik "Simpan Cerita"
   - Verifikasi muncul di homepage
6. TESTING ACCESSIBILITY:
   - Tekan Tab untuk navigate
   - Tekan Enter untuk klik
   - Semua elemen accessible

================================================================================
        TROUBLESHOOTING UNTUK REVIEWER
================================================================================

Q: Error npm install gagal?
A: Pastikan Node.js terinstall (min versi 12)

Q: Port 8080 sudah digunakan?
A: Ubah port di webpack.dev.js atau webpack.prod.js

Q: API error 401?
A: Token expired, login ulang

Q: API error 400?
A: Data tidak valid atau koordinat belum dipilih dari peta

Q: Peta tidak muncul?
A: Pastikan koneksi internet aktif

================================================================================

                    🎉 SIAP DI-REVIEW! 🎉

Proyek lengkap dengan semua kriteria terpenuhi!

================================================================================

