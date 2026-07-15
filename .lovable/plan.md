Tujuan: membuatkan satu project brief / project overview document yang bersih dan siap pakai untuk presentasi stakeholder, berdasarkan kondisi codebase dan fitur Tracking OS saat ini.

Isi brief yang akan dibuat:

1. Executive Summary
   - Nama project: Tracking OS
   - Tagline: sistem pelacakan dan pengelolaan permohonan izin PB UMKU/OSS untuk penyelenggaraan pemagangan luar negeri.
   - Tujuan utama: transparansi progres untuk pemohon + alur kerja terstruktur untuk petugas admin.

2. Problem Statement
   - Proses PB UMKU memerlukan banyak dokumen dan tahapan.
   - Pemohon sulit mengetahui status permohonan secara real-time.
   - Petugas perlu alat bantu agar tidak melewati tahapan atau dokumen.

3. Solution Overview
   - Portal publik read-only untuk tracking via nomor permohonan OSS.
   - Portal admin dengan workflow stage-gated: Pengajuan → Verifikasi Dokumen → Peninjauan → Persetujuan → Izin Terbit.
   - Verifikasi dokumen bersifat sequential: dokumen ke-N baru diproses setelah dokumen ke-(N-1) disetujui.
   - Status tiap tahap otomatis (derived): hijau (selesai), kuning (aktif), abu-abu (terkunci).

4. Target Users & Roles
   - Pemohon / Publik: mencari dan melihat status.
   - Admin / Petugas: mengelola, memverifikasi, meninjau, menyetujui, menerbitkan izin.

5. Key Features
   - Search nomor permohonan OSS.
   - Clickable stepper dengan detail tahap.
   - Timeline / riwayat aktivitas.
   - Verifikasi dokumen sequential dengan catatan perbaikan.
   - Upload revisi dokumen dan file SK izin.
   - Dashboard admin dengan statistik dan daftar permohonan.
   - Persistence backend (JSON demo) atau localStorage fallback.

6. Technical Stack
   - Frontend: Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui.
   - Routing: React Router.
   - State: React Context + backend API / localStorage.
   - Testing: Vitest + Testing Library.
   - Backend demo: Node.js built-in + JSON file, opsional Supabase Storage.

7. Workflow Detail
   - Admin buat pengajuan → konfirmasi pengajuan → verifikasi 8 dokumen secara berurutan → peninjauan dengan catatan → persetujuan → penerbitan izin dengan nomor, tanggal, file PDF.

8. Current State & Limitations
   - Prototype: alur frontend sudah lengkap, test tersedia, build berhasil.
   - Backend demo masih pakai JSON; production perlu PostgreSQL, JWT, audit log, validasi ketat.
   - Login admin masih demo.

9. Next Steps / Roadmap
   - Integrasi file storage production.
   - Autentikasi dan role-based access yang aman.
   - Audit log immutable.
   - Refactor domain workflow lebih modular.
   - Testing integrasi routing dan error states.

Deliverable: file `docs/PROJECT-BRIEF.md` (atau format lain sesuai permintaan) berisi seluruh poin di atas dalam Bahasa Indonesia dengan gaya formal pemerintah. Jika user ingin format lain (PDF, slide, one-pager HTML), akan disesuaikan.