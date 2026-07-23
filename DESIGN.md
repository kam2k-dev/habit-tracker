# Optibiz Design System Documentation — Habit Tracker Landing Page

Dokumentasi spesifikasi desain untuk Landing Page aplikasi Habit Tracker berbasis tokens dan panduan visual Optibiz.

---

## 1. Color System (Tokens)

Desain menggunakan perpaduan latar belakang gelap slate-teal navy dengan aksen hijau limau (*lime green*) ber-kontras tinggi untuk memancarkan kesan produktivitas modern, canggih, dan berwibawa.

| Token | Hex Code | Deskripsi & Penggunaan |
| :--- | :--- | :--- |
| **`brand-dark`** | `#0e1f26` | Warna latar belakang utama (dark mode). |
| **`brand-card`** | `#152932` | Warna latar permukaan komponen / card. |
| **`brand-surface`** | `#1b323d` | Warna permukaan ter-elevasi (hover card, container). |
| **`brand-accent`** | `#c8f041` | Aksen limau, fokus visual utama, tombol CTA utama, badge aktif. |
| **`brand-accentHover`**| `#b5dd32` | State hover untuk semua elemen `brand-accent`. |
| **`brand-lightBg`** | `#f8fafc` | Latar belakang seksi terang (light mode / fallback). |
| **`border-dark`** | `rgba(255,255,255,0.1)`| Border tipis `border-white/10` untuk kontras elegan. |
| **`border-light`** | `#e2e8f0` | Border terang `border-slate-200` jika dalam mode terang. |

---

## 2. Typography Hierarchy

Menggunakan font keluarga **Plus Jakarta Sans** (Google Fonts) untuk pembacaan modern yang bersih dan tegas.

*   **Hero Title (ExtraBold 800):** `text-4xl sm:text-5xl xl:text-6xl`, line-height `leading-[1.15]`, tracking `tracking-tight`. Digunakan untuk heading utama di banner.
*   **Section Heading (ExtraBold 800):** `text-3xl sm:text-4xl`, line-height `leading-tight`, tracking `tracking-normal`. Digunakan untuk judul section.
*   **Card Title (Bold 700):** `text-base` atau `text-sm`, line-height `leading-snug`, tracking `tracking-normal`.
*   **Body Large (Normal 400):** `text-base`, line-height `leading-relaxed`.
*   **Body Small (Normal/Medium 500):** `text-xs` atau `text-sm`, line-height `leading-normal`.
*   **Badge Labels (Bold 700):** `text-xs`, line-height `leading-none`, tracking `tracking-wider`.

---

## 3. Component Anatomy & Layout Rules

### 1. Nav Pill Capsule
*   **Struktur:** Container melayang berbentuk kapsul (`rounded-full`).
*   **Styling:** `bg-[#132730]/80`, `backdrop-blur-md`, `border border-white/10`.
*   **Interactions:** Hover state bergeser ke aksen limau (`hover:text-brand-accent`).

### 2. Glassmorphic Feature Card
*   **Struktur:** Box fitur dengan pancaran border halus vertikal.
*   **Styling:** `bg-brand-card/90`, `border border-white/5`, `rounded-2xl`, padding `p-5`.
*   **Ikon Aksen:** Menggunakan kapsul bundar limau (`bg-brand-accent`, `text-brand-dark`) berisi ikon SVGs Lucide.

### 3. Service Hero Card (Interactive Showcase)
*   **Struktur:** Container gambar di bagian atas + bar gelap di bagian bawah untuk action.
*   **Styling:** Sudut melengkung `rounded-2xl`, gambar bertransisi membesar saat di-hover (`hover:scale-105 duration-500`), area footer gelap dengan tombol panah aksi.

### 4. Spacing Rules & Grid Hierarchy
*   **Base Grid:** Kelipatan 8pt (`p-4`, `p-5`, `p-6`, `gap-4`, `gap-6`, `gap-8`, `gap-12`).
*   **Container Width:** Max width dikunci pada `max-w-7xl` dengan padding horizontal dinamis `px-4 sm:px-8`.
*   **Section Padding:** Padding vertikal berkisar antara `py-16` dan `py-20`.
*   **Corner Radius:** Standardized pill (`rounded-full`) dan blok card (`rounded-2xl`, `rounded-3xl`).
