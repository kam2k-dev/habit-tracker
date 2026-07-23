# Agent Development Rules — Habit Tracker Landing Page

Dokumentasi ini adalah aturan wajib bagi AI Agent (Cursor, Claude, Copilot, dll) dalam memodifikasi, memperluas, atau men-scale kode Landing Page Habit Tracker.

---

## 1. Codebase Constraints (Anti-Slop Rules)

Untuk menjaga visual premium minimalis bernuansa Optibiz Design System, ikuti aturan ini:

1. **Dilarang Menambahkan CSS Kustom yang Norak:**
   * Jangan gunakan efek gradient radial pelangi, glow neon berlebihan, atau text shadow norak.
   * Pertahankan border tipis transparan `border-white/10` dan backdrop blur `backdrop-blur-md` untuk efek glassmorphism.
2. **Disiplin Spacing Tailwind:**
   * Wajib gunakan standard spacing kelipatan 8pt: `p-4`, `p-5`, `p-6`, `p-8`, `gap-4`, `gap-6`, `gap-8`, `gap-12`.
   * Jangan menulis spacing kustom seperti `mt-[23px]` atau `p-[11px]`.
3. **Disiplin Warna (Strict Colors):**
   * Gunakan warna latar belakang utama `#0e1f26` (`bg-[#0e1f26]`).
   * Gunakan warna permukaan card `#152932` (`bg-[#152932]`).
   * Gunakan warna aksen limau `#c8f041` (`bg-[#c8f041]` atau `text-[#c8f041]`).
   * Jangan menggunakan warna acak selain palette di atas.
4. **Semantik HTML:**
   * Gunakan tag HTML5 semantik (`<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`) demi SEO dan struktur dokumen yang bersih.

---

## 2. Edit Protocols (Cara Nambah Fitur)

Jika Anda diminta untuk menambahkan seksi atau komponen baru:

1. **Gunakan Bento Layout untuk Fitur Baru:**
   * Seksi fitur tambahan harus dimasukkan ke dalam layout Bento Grid (grid modular dengan ukuran kolom yang bervariasi).
2. **Tombol CTA Tambahan:**
   * Tombol aksi primer wajib menggunakan kelas: `bg-[#c8f041] hover:bg-[#b5dd32] text-[#0e1f26] transition-all duration-200 active:scale-[0.98] rounded-full`.
   * Tombol sekunder wajib menggunakan kelas: `bg-transparent border border-white/10 hover:bg-white/5 text-white transition-all duration-200 active:scale-[0.98] rounded-full`.

---

## 3. Component Scaling Path (Jika di-porting ke React/Vue)

Jika halaman statis `index.html` ini dipindahkan ke framework React (`src/components/`), pecah strukturnya menjadi:

```text
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx (Glassmorphic)
│   │   └── NavPill.tsx (Floating Pill)
│   ├── sections/
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx (Bento Grid)
│   │   ├── StatsShowcase.tsx
│   │   └── Footer.tsx
```

---

## 4. Agent Validation Checklist (Lakukan Sebelum Output Code)

Sebelum menyajikan kode hasil modifikasi ke user, verifikasi hal-besikut:
- [ ] Apakah warna latar belakang tetap menggunakan `#0e1f26`?
- [ ] Apakah tombol utama tetap ber-aksen limau `#c8f041`?
- [ ] Apakah tata letak tombol melayang menggunakan `rounded-full`?
- [ ] Apakah font utama Plus Jakarta Sans di-import dengan benar?
- [ ] Apakah seluruh button & link interaktif memiliki efek `transition-all duration-200 active:scale-[0.98]`?
