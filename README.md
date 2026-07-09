# ⚡ Tracker Kebiasaan (Habit Tracker) - Premium Web App

Aplikasi web pelacak kebiasaan modern, cepat, dan interaktif yang dibangun menggunakan **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, dan **Firebase**. Aplikasi ini dirancang untuk membantumu membangun rutinitas positif ("Kebiasaan Baik") sekaligus menyadari dan mengurangi pola negatif ("Kebiasaan Buruk") dengan antarmuka yang sangat responsif, animasi premium, dan pelacakan statistik real-time.

---

## ✨ Fitur Utama

- **👥 Mode Tamu & Sinkronisasi Cloud (Firebase)**:
  - **Mode Pratinjau (Preview Mode)**: Mulai melacak secara instan tanpa perlu mendaftar. Data disimpan langsung di memori lokal.
  - **Autentikasi Firebase**: Masuk menggunakan Google Sign-In atau Email/Password untuk menyimpan data secara aman di Cloud Firestore.
  - **Sinkronisasi Real-time & Offline Cache**: Data disinkronkan secara real-time ke Firestore dengan dukungan caching offline di `localStorage` untuk performa instan (PWA-like).

- **🎯 Pelacakan Kebiasaan Baik & Buruk**:
  - **Kebiasaan Baik**: Lacak dan bangun kebiasaan sehat (seperti olahraga, meditasi, membaca).
  - **Kebiasaan Buruk**: Pantau dan kurangi perilaku negatif (seperti doomscrolling, merokok, makanan tidak sehat) dengan skor netral/pengurangan.

- **📊 Dashboard & Statistik Interaktif**:
  - **Daily Hero**: Ringkasan performa harian yang dinamis menampilkan skor netral, jumlah kebiasaan yang selesai, dan status streak aktif saat ini.
  - **Grafik Aktivitas (Heatmap Git-Style)**: Visualisasi aktivitas pelacakan selama 365 hari terakhir lengkap dengan detail performa saat tanggal diklik.
  - **Stats & Streak Tracker**: Analisis mendalam yang menghitung streak saat ini, streak terpanjang, total penyelesaian, dan tingkat konsistensi (%) untuk setiap kebiasaan.

- **⚡ Pengalaman Pengguna (UX) Premium**:
  - **Drag & Drop Reordering**: Urutkan daftar kebiasaan hari ini dengan mudah melalui gesture drag-and-drop.
  - **iOS-style Haptic Feedback**: Getaran mikro (haptic feedback) menggunakan navigator haptic pada perangkat seluler ketika kebiasaan selesai atau diatur ulang.
  - **Animasi Transisi & Confetti**: Efek transisi halus berbasis *Framer Motion* dan selebrasi *Canvas Confetti* saat mencapai target atau menyelesaikan tugas.
  - **Kustomisasi Avatar**: Unggah atau ubah avatar profil kustom yang tersimpan secara lokal.
  - **Tema Gelap & Terang**: Dukungan dark mode elegan yang terintegrasi dengan preferensi sistem atau pilihan manual.

---

## 🛠️ Tech Stack

Aplikasi ini menggunakan teknologi modern terbaik untuk memastikan performa yang cepat dan pengalaman pengguna yang mulus:

- **Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vite.dev/)
- **Database & Auth**: [Firebase v11](https://firebase.google.com/) (Firestore & Auth)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan [Shadcn UI](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **Animasi**: [Framer Motion](https://www.framer.com/motion/) & [Canvas Confetti](https://github.com/catdad/canvas-confetti)
- **Manajemen Tanggal**: [date-fns](https://date-fns.org/)
- **Notifikasi**: [Sonner](https://sonner.emilkowalski.se/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Memulai (Quick Start)

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini secara lokal di komputermu:

### 1. Prasyarat (Prerequisites)

Pastikan kamu sudah menginstal:
- [Node.js](https://nodejs.org/) (versi 18 atau lebih baru direkomendasikan)
- [npm](https://www.npmjs.com/) atau Yarn / pnpm

### 2. Instalasi Dependensi

Jalankan perintah berikut pada terminal di dalam folder proyek:
```bash
npm install
```

### 3. Konfigurasi Environment Variables

Salin berkas `.env.example` menjadi `.env` dan masukkan kredensial Firebase milikmu:
```bash
cp .env.example .env
```

Buka berkas `.env` baru tersebut, lalu isi dengan konfigurasi dari Firebase Console:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 4. Menjalankan Aplikasi di Mode Development

Mulai server lokal menggunakan perintah berikut:
```bash
npm run dev
```
Aplikasi akan berjalan secara lokal di [http://localhost:5173](http://localhost:5173).

### 5. Build untuk Produksi

Untuk melakukan kompilasi kode dan build untuk disebarkan (deploy) ke hosting produksi:
```bash
npm run build
```
Hasil build siap pakai akan tersedia di dalam folder `/dist`.

---

## 📁 Struktur Folder

```text
habit-tracker/
├── src/
│   ├── components/      # Komponen UI (AddHabitDialog, StatsOverview, dll)
│   │   ├── ui/          # Komponen dasar (Shadcn/Radix components)
│   │   └── icons/       # Custom icons untuk kebiasaan
│   ├── hooks/           # Custom React hooks (useAuth, useHabits, useConfetti)
│   ├── lib/             # Inisialisasi Firebase & Utilitas
│   ├── types/           # Definisi Type TypeScript (habit.ts)
│   ├── App.tsx          # Halaman utama & layouting aplikasi
│   ├── index.css        # Konfigurasi Tailwind & Global styling
│   └── main.tsx         # Entry point aplikasi
├── public/              # Aset statis aplikasi
├── .env.example         # Template file environment variables
├── Dockerfile           # Konfigurasi Docker
├── docker-compose.yml   # Konfigurasi Docker Compose
└── tailwind.config.js   # Konfigurasi Tailwind CSS
```

---

## 🔒 Lisensi

Proyek ini dibuat untuk keperluan pembelajaran dan pengembangan pribadi. Silakan gunakan dan sesuaikan sesuai dengan kebutuhanmu.
