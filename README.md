<div align="center">

<img src="public/logo.webp" alt="Habit Tracker Logo" width="96" />

# ⚡ Habit Tracker

**Bangun kebiasaan baik, kurangi kebiasaan buruk, dan jaga konsistensi setiap hari.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black?cache_bust=1)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white?cache_bust=1)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white?cache_bust=1)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white?cache_bust=1)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-11-DD2C00?style=for-the-badge&logo=firebase&logoColor=white?cache_bust=1)](https://firebase.google.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white?cache_bust=1)](https://www.docker.com/)

Aplikasi habit tracker modern dengan cloud sync, statistik interaktif, streak, heatmap aktivitas, dark mode, dan pengalaman mobile yang responsif.

</div>

---

## Tentang

Habit Tracker adalah aplikasi web untuk membangun rutinitas positif sekaligus memantau kebiasaan yang ingin dikurangi. Aplikasi dapat digunakan dalam **Preview Mode** tanpa akun, atau melalui Firebase Authentication agar data tersimpan dan tersinkronisasi di Cloud Firestore.

> Cepat, responsif, mobile-friendly, dan bisa dijalankan secara lokal maupun melalui Docker.

## Fitur Utama

### Pelacakan kebiasaan

- Tambah kebiasaan baik dan buruk.
- Tandai kebiasaan berdasarkan tanggal.
- Susun ulang daftar kebiasaan hari ini.
- Gunakan template seperti *Morning Routine*, *Fitness*, dan *Reading*.
- Pantau streak saat ini, streak terpanjang, total penyelesaian, dan konsistensi.

### Dashboard dan statistik

- Ringkasan performa harian melalui **Daily Hero**.
- Heatmap aktivitas bergaya GitHub untuk 365 hari.
- Detail performa ketika tanggal dipilih.
- Statistik terpisah untuk setiap kebiasaan.
- Animasi angka, transisi Framer Motion, dan confetti saat target tercapai.

### Akun dan sinkronisasi

- Preview Mode tanpa registrasi.
- Firebase Authentication dengan Google dan email/password.
- Penyimpanan data pengguna di Cloud Firestore.
- Cache lokal untuk pengalaman yang lebih cepat.
- Avatar profil bawaan maupun custom.

### Pengalaman pengguna

- Responsive top navigation dan floating bottom navigation.
- Dark mode dan light mode.
- Haptic feedback pada perangkat yang mendukung.
- Toast notification melalui Sonner.
- UI berbasis Radix UI dan pola komponen shadcn/ui.

## Tech Stack

| Bagian | Teknologi | Kegunaan |
|---|---|---|
| UI framework | React 19 | Antarmuka komponen dan state UI |
| Bahasa | TypeScript 5.9 | Type safety dan maintainability |
| Build tool | Vite 7 | Development server dan production build |
| Styling | Tailwind CSS 3.4 | Responsive styling dan dark mode |
| UI primitives | Radix UI | Komponen aksesibel seperti dialog, tabs, dan dropdown |
| Backend service | Firebase 11 | Authentication dan Cloud Firestore |
| Animasi | Framer Motion | Transisi dan micro-interactions |
| Utilities | date-fns | Pengolahan tanggal dan statistik streak |
| Container | Docker | Build dan deployment yang konsisten |

## Struktur Project

```text
habit-tracker/
├── public/                 # Logo, favicon, dan avatar bawaan
├── src/
│   ├── components/         # Komponen fitur dan dashboard
│   │   ├── icons/          # Ikon kebiasaan custom
│   │   └── ui/             # Komponen UI reusable
│   ├── hooks/              # Auth, habit state, confetti, count-up
│   ├── lib/                # Firebase initialization dan utilities
│   ├── types/              # TypeScript types
│   ├── App.tsx             # Layout dan alur utama aplikasi
│   ├── index.css           # Global style dan Tailwind
│   └── main.tsx            # Entry point React
├── .env.example            # Template konfigurasi Firebase
├── Dockerfile              # Multi-stage production image
├── docker-compose.yml      # Deployment container pada port 5050
└── package.json            # Scripts dan dependencies
```

## Menjalankan Secara Lokal

### Prasyarat

- Node.js 20 direkomendasikan—sesuai image yang dipakai Docker.
- npm.
- Firebase project jika ingin menggunakan login dan cloud sync.

### 1. Clone repository

```bash
git clone https://github.com/kam2k-dev/habit-tracker.git
cd habit-tracker
```

### 2. Instal dependensi

```bash
npm install
```

### 3. Konfigurasi Firebase

Salin template environment:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Isi konfigurasi dari **Firebase Console → Project Settings → General → Your apps → Web app**:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

Aktifkan provider autentikasi yang akan digunakan di Firebase Console, lalu siapkan aturan akses Firestore yang sesuai untuk data pengguna.

> File `.env` bersifat lokal dan diabaikan oleh Git. Jangan commit konfigurasi produksi atau service-account/private key ke repository.

### 4. Development server

```bash
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173).

## Scripts

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan Vite development server |
| `npm run build` | Type-check dan membuat production build |
| `npm run lint` | Menjalankan ESLint |
| `npm run preview` | Preview hasil build secara lokal |

## Build Produksi

```bash
npm run build
```

Hasil build berada di direktori `dist/`.

## Menjalankan dengan Docker

Pastikan `.env` sudah dikonfigurasi, kemudian jalankan:

```bash
docker compose up --build -d
```

Aplikasi tersedia di:

```text
http://localhost:5050
```

Cek log atau hentikan container:

```bash
docker compose logs -f
docker compose down
```

## Keamanan Konfigurasi Firebase

Firebase Web API key bukan pengganti autentikasi dan bukan private server key. Keamanan data tetap harus dijaga melalui:

- Firebase Authentication.
- Firestore Security Rules berbasis `request.auth.uid`.
- Pembatasan API key pada Google Cloud Console bila diperlukan.
- Tidak mengunggah service-account key atau kredensial admin ke frontend/repository.
- Menyimpan konfigurasi deployment di environment platform masing-masing.

## Roadmap

- [ ] Reminder dan notifikasi kebiasaan.
- [ ] PWA installable dengan service worker.
- [ ] Export/import data pengguna.
- [ ] Pengaturan target mingguan yang lebih fleksibel.
- [ ] Automated test untuk hook, statistik, dan alur autentikasi.

## Lisensi

Belum ada lisensi open-source yang ditetapkan. Secara default, seluruh hak cipta tetap dimiliki pemilik repository.
