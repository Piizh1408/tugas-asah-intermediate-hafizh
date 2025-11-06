================================================================================
                   SETUP STORYMAP - BACA INI DULU
================================================================================

✅ node_modules SUDAH DIHAPUS untuk menghemat ruang!

📦 UNTUK MENJALANKAN APLIKASI, INSTALL DEPENDENCIES DULU:
================================================================================

BUKA TERMINAL/POWERSHELL di folder ini, lalu ketik:

    npm install

Tunggu sampai selesai (ini akan menginstall kembali node_modules)

Lalu jalankan aplikasi dengan:

    npm run start-dev

Atau untuk production build:

    npm run build
    npm run serve

================================================================================
                      MENGAPA NODE_MODULES DIHAPUS?
================================================================================

1. node_modules berukuran BESAR (ratusan MB)
2. Dapat diinstall ulang dengan "npm install"
3. Tidak perlu di-commit ke Git (sudah ada di .gitignore)
4. Menghemat ruang penyimpanan

================================================================================
                      FILE PENTING YANG TETAP ADA:
================================================================================

✅ src/           - Semua source code aplikasi
✅ dist/          - File production build (sudah di-build)
✅ package.json   - Dependencies list
✅ package-lock.json - Lock file untuk versi
✅ webpack.*.js   - Konfigurasi webpack
✅ .gitignore     - File yang diabaikan oleh Git
✅ README.md      - Dokumentasi
✅ *.txt, *.md    - File panduan

================================================================================
                      JIKA INGIN LANGSUNG JALANKAN:
================================================================================

Karena dist/ sudah ada, Anda bisa langsung buka file:

    dist/index.html

Di browser (tapi beberapa fitur API mungkin tidak jalan sempurna).

Untuk full functionality, install dependencies dan jalankan dev server.

================================================================================

                    HAPPY CODING! 🚀

================================================================================

