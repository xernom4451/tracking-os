# Tracking OS

Frontend prototype untuk pelacakan dan pengelolaan proses izin PB UMKU/OSS Penyelenggaraan Pemagangan Luar Negeri. Aplikasi ini menyediakan:

- Portal publik untuk melacak progres permohonan berdasarkan nomor permohonan.
- Portal admin untuk membuat, mengelola, memverifikasi, meninjau, menyetujui, dan menerbitkan izin.
- Simulasi alur dokumen multi-tahap lengkap dengan timeline, riwayat sesi, dan unggah revisi.

## Stack

- Vite
- React 18
- TypeScript
- React Router
- Tailwind CSS
- shadcn/ui
- Vitest + Testing Library

## Cara Menjalankan

```sh
npm install
npm run dev
```

Perintah lain:

```sh
npm run lint
npm run test
npm run build
```

## Backend untuk Testing Semi-Realistis

Project ini sekarang memiliki backend minimum di folder `backend/`. Backend ini menyimpan data permohonan di server-side JSON file sehingga demo bisa diuji lintas browser/perangkat selama semua client memakai API yang sama.

Menjalankan backend:

```sh
cd backend
copy .env.example .env
npm run dev
```

Default API:

```txt
http://localhost:4000
```

Hubungkan frontend ke backend dengan membuat `.env.local` di root project:

```txt
VITE_API_BASE_URL=http://localhost:4000
```

Lalu jalankan frontend:

```sh
npm run dev
```

Akun demo default:

```txt
Email: admin@tracking-os.local
Password: admin123
```

Endpoint utama tersedia untuk login admin, daftar/detail permohonan, public tracking, dan aksi workflow seperti konfirmasi pengajuan, verifikasi, peninjauan, upload revisi metadata, persetujuan, dan penerbitan izin. Detail endpoint ada di `backend/README.md`.

Catatan: jika `VITE_API_BASE_URL` tidak diisi, frontend otomatis kembali ke mode prototype lama berbasis `localStorage`.

Untuk preview/download PDF lintas device, isi konfigurasi Supabase Storage di `backend/.env`:

```txt
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service-role-key-dari-supabase
SUPABASE_BUCKET=tracking-documents
```

`SUPABASE_SERVICE_ROLE_KEY` hanya boleh disimpan di backend, bukan di frontend/Vercel frontend.

## Arsitektur Singkat

### Routing

- `/`: portal publik
- `/admin/login`: login admin
- `/admin`: dashboard admin
- `/admin/kelola/:id`: detail pengelolaan satu permohonan

### State dan penyimpanan

- `src/contexts/AuthContext.tsx`
  Memakai backend demo saat `VITE_API_BASE_URL` aktif, dan fallback ke `localStorage` jika tidak aktif.
- `src/contexts/SubmissionContext.tsx`
  Memakai backend demo saat `VITE_API_BASE_URL` aktif, dan fallback ke `localStorage` jika tidak aktif.

### Halaman utama

- `src/pages/Index.tsx`
  Pencarian nomor permohonan, detail progres publik, dan daftar izin yang sudah terbit.
- `src/pages/AdminDashboard.tsx`
  Ringkasan statistik, daftar permohonan, tambah data baru, pencarian, sortir, dan hapus.
- `src/pages/AdminKelola.tsx`
  Detail setiap tahap permohonan untuk admin.

### Komponen domain penting

- `src/components/StageDetailAdmin.tsx`
  UI paling kompleks untuk workflow admin: pengajuan, verifikasi, peninjauan, persetujuan, izin terbit.
- `src/components/StageDetailUser.tsx`
  Tampilan detail tahapan dari sisi pemohon.
- `src/components/Timeline.tsx`
  Riwayat aktivitas dengan filter tahapan, status, dan tanggal.
- `src/components/PublishedTable.tsx`
  Daftar izin yang sudah diterbitkan.
- `src/data/mockData.ts`
  Tipe domain, helper status/stage, dan utilitas format tanggal/status.

## Workflow Bisnis Saat Ini

1. Pengajuan dibuat admin.
2. Admin mengonfirmasi pengajuan.
3. Admin melakukan verifikasi dokumen.
4. Jika ada revisi, pemohon mengunggah dokumen perbaikan.
5. Admin melakukan peninjauan dokumen.
6. Admin menyimpan data persetujuan.
7. Admin menetapkan status izin pada tahap izin terbit.

Semua perubahan menambah timeline dan memperbarui status aktif tahap secara otomatis.

## Pengujian

Test utama ada di `src/test/session-flow.test.tsx` dan sudah mencakup:

- validasi sesi verifikasi/peninjauan
- upload revisi dokumen
- finalisasi persetujuan dan izin terbit
- edit data pengajuan
- konfirmasi aksi penting
- pembuatan permohonan baru
- persistence `localStorage`

## Kondisi Saat Ini

Yang sudah baik:

- Alur bisnis frontend sudah cukup lengkap.
- State persist antar refresh/tab dengan `localStorage`.
- Build produksi berhasil.
- Test flow utama sudah tersedia.

Batasan saat ini:

- Backend minimum sudah tersedia untuk testing semi-realistis dan frontend dapat dihubungkan lewat `VITE_API_BASE_URL`.
- Login admin sudah dapat memakai backend demo saat mode API aktif.
- Backend masih memakai JSON file untuk data permohonan demo; production resmi tetap perlu PostgreSQL/database managed.
- Preview/download PDF lintas device tersedia saat Supabase Storage sudah dikonfigurasi.
- Lint masih menyisakan beberapa warning `react-refresh` pada file utilitas/shadcn bawaan.

## Pengembangan Terbaru

Perubahan terakhir yang sudah diterapkan:

- route-level lazy loading di `App.tsx`
- lazy loading komponen berat di halaman publik dan detail admin
- perbaikan lint error pada pemanggilan date picker
- perbaikan aksesibilitas dialog edit data permohonan
- pemecahan bundle agar initial load lebih ringan

## Prioritas Lanjutan yang Disarankan

- Integrasi file storage nyata untuk dokumen
- Validasi role/credential admin yang sebenarnya
- Refactor domain workflow agar logika context lebih modular
- Rapikan warning lint bawaan shadcn/context export
- Tambah test integrasi untuk routing dan error states
