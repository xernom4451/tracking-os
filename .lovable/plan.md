## Rencana: Buat PDF Project Overview

Membuat dokumen PDF berisi penjelasan lengkap proyek **Sistem Tracking PB UMKU** yang dapat langsung diunduh dan dipakai untuk menjelaskan proyek di AI builder baru atau ke stakeholder.

### Isi PDF (Bahasa Indonesia)

1. **Cover / Judul** — Sistem Tracking PB UMKU (Overseas Internship Permit via OSS)
2. **Latar Belakang & Tujuan** — masalah transparansi proses PB UMKU, posisi sistem sebagai *tracking layer* (bukan workflow utama)
3. **Ruang Lingkup** — apa yang termasuk & tidak termasuk
4. **Aktor / Pengguna** — Publik (Pemohon) & Admin (Petugas)
5. **Portal & Halaman**
   - Public Portal (`/`) — pencarian & tracking
   - Admin Portal (`/admin/login`, `/admin`, `/admin/kelola/:id`)
6. **Alur Bisnis 5 Stage** — Pengajuan → Verifikasi Dokumen → Peninjauan → Persetujuan → Izin Terbit
7. **Aturan Stage-Gated & Verifikasi Dokumen Berurutan** — 8 dokumen, urutan wajib, status Approved/Revisi/Pending
8. **Konsep Status Visual** — 3 warna stepper: Hijau (Completed), Kuning (Active), Abu-abu (Locked)
9. **Fitur Utama** — ringkasan Public & Admin
10. **Arsitektur Teknis** — Vite + React + TypeScript + Tailwind + shadcn/ui, Context API, localStorage/demo backend
11. **Struktur Komponen Kunci** — `ProgressStepper`, `StageDetailUser/Admin`, `DocumentList`, `Timeline`, `SubmissionContext`
12. **Status Saat Ini & Keterbatasan** — prototype, mock data, tanpa auth produksi
13. **Roadmap** — database produksi, auth aman, audit log, notifikasi
14. **Penutup / Elevator Pitch**

### Teknis Pembuatan

- Gunakan Python `reportlab` dengan font Unicode **DejaVu Sans** (agar karakter Indonesia aman)
- Warna aksen mengikuti brand proyek: navy/slate + status hijau/kuning/abu
- Layout: cover halaman 1, lalu konten multi-halaman dengan heading, paragraf, dan bullet list rapi
- Output: `/mnt/documents/Project-Overview-Tracking-PB-UMKU.pdf`
- QA: render tiap halaman ke gambar, inspeksi visual (overflow, potongan teks, glyph hilang), perbaiki bila ada isu
- Kirim ke user via `<presentation-artifact>` agar bisa langsung diunduh

Tidak ada perubahan kode aplikasi — hanya menghasilkan artefak PDF.