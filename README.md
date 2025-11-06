# 📖 StoryMap - Cerita Perjalanan Bersama

**StoryMap** adalah aplikasi Single Page Application (SPA) modern untuk berbagi cerita perjalanan dengan peta interaktif menggunakan Leaflet. Aplikasi ini dibangun dengan arsitektur MVP dan memenuhi standar aksesibilitas web.

## 🎯 Fitur Utama

### ✅ Kriteria 1: SPA & Transisi Halaman
- ✅ Arsitektur Single Page Application (SPA)
- ✅ Custom transition animation antar halaman (fade & slide)
- ✅ Pemisahan halaman Authentication (Login/Register) dan Homepage
- ✅ Implementasi arsitektur MVP

### ✅ Kriteria 2: Tampil Data & Marker pada Peta
- ✅ Integrasi dengan Story API Dicoding
- ✅ Peta interaktif menggunakan Leaflet
- ✅ Menampilkan marker dari data API
- ✅ Fitur filter lokasi (Semua, Sains, Sejarah, Alam)
- ✅ Highlight marker aktif dengan popup
- ✅ Sinkronisasi list cerita dengan peta

### ✅ Kriteria 3: Fitur Tambah Data
- ✅ Form tambah cerita baru dengan upload foto
- ✅ Validasi input lengkap
- ✅ Error handling yang jelas
- ✅ Success/error messages
- ✅ Preview foto sebelum upload

### ✅ Kriteria 4: Aksesibilitas
- ✅ Skip to content link
- ✅ Alt text pada semua gambar
- ✅ HTML semantic yang proper
- ✅ Label pada setiap input
- ✅ Keyboard navigation support
- ✅ ARIA attributes lengkap
- ✅ Focus management

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (versi 12 atau lebih tinggi)
- [npm](https://www.npmjs.com/)

### Installation

1. Install dependencies:
   ```shell
   npm install
   ```

2. Start development server:
   ```shell
   npm run start-dev
   ```

3. Build for production:
   ```shell
   npm run build
   ```

4. Serve production build:
   ```shell
   npm run serve
   ```

## 📁 Project Structure

```
starter-project-with-webpack/
├── dist/                      # Compiled files for production
├── src/
│   ├── public/                # Public assets
│   ├── scripts/
│   │   ├── data/
│   │   │   └── api.js         # API integration
│   │   ├── pages/
│   │   │   ├── home/
│   │   │   │   └── home-page.js
│   │   │   ├── login/
│   │   │   │   └── login-page.js
│   │   │   ├── register/
│   │   │   │   └── register-page.js
│   │   │   └── add-story/
│   │   │       └── add-story-page.js
│   │   ├── routes/
│   │   │   ├── routes.js      # Route configuration
│   │   │   └── url-parser.js
│   │   ├── config.js          # API configuration
│   │   ├── index.js           # Main entry point
│   │   └── pages/app.js       # MVP Controller
│   ├── styles/
│   │   └── styles.css         # Modern CSS styling
│   └── index.html
├── package.json
├── webpack.common.js
├── webpack.dev.js
└── webpack.prod.js
```

## 🎨 Teknologi yang Digunakan

- **Webpack** - Module bundler
- **Babel** - JavaScript transpiler
- **Leaflet** - Interactive maps library
- **Vanilla JavaScript** - No framework dependencies
- **CSS3** - Modern styling dengan CSS variables

## 📝 API Endpoints

Aplikasi menggunakan Story API dari Dicoding:
- `POST /v1/register` - Registrasi user baru
- `POST /v1/login` - Login user
- `GET /v1/stories` - Mendapatkan daftar cerita
- `POST /v1/stories` - Menambah cerita baru

## 🔒 Authentication

Aplikasi menggunakan JWT token yang disimpan di localStorage. User harus login untuk mengakses fitur:
- Melihat daftar cerita
- Menambahkan cerita baru

## ♿ Aksesibilitas

Aplikasi dirancang mengikuti standar WCAG:
- Semantic HTML5
- ARIA labels dan roles
- Keyboard navigation
- Screen reader support
- Focus indicators
- Skip to content

## 📱 Responsive Design

Aplikasi fully responsive dengan breakpoints:
- Mobile (< 768px)
- Tablet (768px - 1000px)
- Desktop (> 1000px)

## 🐛 Error Handling

- Network errors dengan pesan yang jelas
- Form validation dengan feedback real-time
- Loading states untuk semua async operations
- Graceful fallbacks

## 🎯 Fitur Interaktif

1. **Map Controls**: Filter cerita berdasarkan kategori
2. **Story Cards**: Hover effects dan visual feedback
3. **Form Validation**: Real-time validation dengan error messages
4. **Photo Preview**: Preview foto sebelum upload
5. **Responsive Navigation**: Mobile-friendly hamburger menu

## 📄 License

MIT License - Feel free to use this project for learning purposes!

## 👨‍💻 Author

Created with ❤️ for Dicoding Web Intermediate Submission

---

**Note**: Pastikan koneksi internet tersedia untuk mengakses Story API Dicoding.
