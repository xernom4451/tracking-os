# Project Brief – Tracking OS

Sistem Pelacakan dan Pengelolaan Permohonan Izin PB UMKU / OSS Penyelenggaraan Pemagangan Luar Negeri

---

## 1. Executive Summary

**Nama Project:** Tracking OS  
**Kategori:** Sistem Pelacakan dan Manajemen Workflow Izin  
**Pemilik Proses:** Kementerian Ketenagakerjaan Republik Indonesia (Kemnaker) / Unit terkait PB UMKU  

**Tagline:**  
> Sistem pelacakan dan pengelolaan permohonan izin PB UMKU/OSS untuk penyelenggaraan pemagangan luar negeri, memberikan transparansi progres kepada pemohon dan mengendalikan alur kerja petugas secara terstruktur.

**Tujuan Utama:**

1. Memberikan transparansi status permohonan kepada pemohon melalui portal publik berbasis nomor permohonan OSS.
2. Memberikan alat kerja kepada petugas admin untuk mengelola proses pengajuan, verifikasi, peninjauan, persetujuan, dan penerbitan izin secara berurutan dan terkendali.

---

## 2. Problem Statement

Proses perizinan PB UMKU melibatkan banyak dokumen dan beberapa tahapan validasi. Sebelum Tracking OS, pemohon sering kesulitan mengetahui:

- Di tahap mana permohonannya berada.
- Dokumen mana yang belum atau perlu diperbaiki.
- Kapan izin akan diterbitkan.

Di sisi petugas, alur kerja manual rentan terhadap:

- Lompat tahap atau dokumen terlewat.
- Tidak ada riwayat audit jelas.
- Kesulitan melacak revisi dan unggahan ulang.

---

## 3. Solution Overview

Tracking OS menyelesaikan masalah di atas dengan dua portal dalam satu sistem:

### Portal Publik (Read-Only)

Pemohon dapat memasukkan nomor permohonan OSS dan melihat:

- Tahapan proses yang sudah selesai, sedang berjalan, atau masih terkunci.
- Detail tiap tahap, termasuk progress verifikasi dokumen.
- Riwayat aktivitas permohonan.
- Informasi izin jika sudah diterbitkan.

### Portal Admin

Petugas dapat:

- Membuat dan mengelola daftar permohonan.
- Mengonfirmasi pengajuan.
- Memverifikasi dokumen secara berurutan.
- Mencatat hasil peninjauan dan memutuskan persetujuan.
- Menerbitkan izin dengan nomor, tanggal, dan dokumen SK.

### Prinsip Stage-Gated Workflow

Sistem mengunci tahapan secara otomatis. Hanya satu tahap yang dapat aktif pada satu waktu. Tahap berikutnya baru terbuka setelah tahap sebelumnya diselesaikan. Hal ini memastikan tidak ada tahapan yang terlewat.

---

## 4. Target Users & Roles

| Role | Akses | Kegiatan Utama |
|------|-------|----------------|
| Pemohon / Publik | Portal publik | Mencari nomor permohonan dan melihat status |
| Admin / Petugas | Portal admin | Membuat, mengelola, dan memajukan permohonan |
| Stakeholder | Dashboard | Melihat ringkasan statistik dan daftar izin terbit |

---

## 5. Key Features

### 5.1 Publik

- **Pencarian Nomor Permohonan OSS** – pemohon memasukkan nomor untuk melihat status.
- **Stepper Progres** – visualisasi 5 tahapan proses dengan status hijau, kuning, atau abu-abu.
- **Detail Tahap** – informasi spesifik sesuai tahap yang dipilih.
- **Riwayat Aktivitas** – catatan kronologis perubahan status dan keputusan.
- **Daftar Izin Terbit** – informasi publik izin yang sudah diterbitkan.

### 5.2 Admin

- **Dashboard Statistik** – ringkasan total permohonan, dalam verifikasi, dalam peninjauan, dan izin terbit.
- **Daftar Permohonan** – tabel dengan pencarian, sortir, filter, dan aksi kelola.
- **Pengelolaan Tahap** – panel aksi per tahap sesuai dengan tahap yang sedang aktif.
- **Verifikasi Dokumen Sequential** – hanya satu dokumen yang dapat diperiksa pada satu waktu; dokumen berikutnya terkunci sampai dokumen sebelumnya disetujui.
- **Catatan Perbaikan** – admin dapat meminta revisi dengan catatan yang wajib diisi.
- **Upload Revisi & SK** – pemohon dapat mengunggah perbaikan; admin dapat mengunggah file SK.
- **Timeline Audit** – setiap aksi tercatat dalam riwayat.

---

## 6. Workflow Detail

Tahapan utama dan transisinya:

```text
[Pengajuan] ──► [Verifikasi Dokumen] ──► [Peninjauan Dokumen] ──► [Persetujuan] ──► [Izin Terbit]
```

### Tahap 1: Pengajuan

- Data permohonan masuk ke sistem.
- Admin mengonfirmasi pengajuan.
- Setelah dikonfirmasi, tahap berikutnya terbuka otomatis.

### Tahap 2: Verifikasi Dokumen

Delapan dokumen wajib diverifikasi secara berurutan:

1. Surat Permohonan Izin
2. Salinan Izin Usaha
3. Salinan Akreditasi
4. Perjanjian Kerja Sama Luar Negeri
5. Program Pemagangan
6. Rencana Penempatan Pasca Pemagangan
7. Profil LPK
8. Draft Perjanjian Pemagangan

Aturan:

- Hanya dokumen pertama yang belum disetujui yang dapat diperiksa.
- Status: Disetujui, Sedang Diverifikasi, atau Perlu Perbaikan.
- Jika semua dokumen disetujui, tahap Verifikasi selesai dan tahap Peninjauan terbuka otomatis.

### Tahap 3: Peninjauan Dokumen

- Admin mencatat hasil peninjauan.
- Admin menyelesaikan peninjauan untuk membuka tahap Persetujuan.

### Tahap 4: Persetujuan Permohonan

- Admin menyetujui permohonan.
- Setelah disetujui, tahap Izin Terbit terbuka.

### Tahap 5: Izin Terbit

- Admin mengisi nomor izin, tanggal terbit, dan mengunggah dokumen SK.
- Setelah diterbitkan, seluruh alur selesai.

---

## 7. Technical Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui |
| Routing | React Router |
| State Management | React Context + Backend API atau localStorage fallback |
| Testing | Vitest, Testing Library |
| Backend Demo | Node.js built-in, JSON file storage |
| File Storage | Supabase Storage (opsional) |

---

## 8. Status & Visual State

Sistem menggunakan tiga visual status utama pada stepper:

| Visual | Arti |
|--------|------|
| Hijau dengan ikon check | Selesai |
| Kuning dengan lingkaran solid | Dalam Proses |
| Abu-abu dengan lingkaran kosong | Terkunci |

Status ini dihitung secara otomatis dari kondisi data (derived), bukan diatur manual oleh admin. Dashboard admin menampilkan status dengan badge: Selesai, Sedang Diproses, Perlu Perbaikan, atau Pending.

---

## 9. Current State & Limitations

### Sudah Tersedia

- Alur bisnis frontend lengkap dengan validasi sequential.
- Stepper clickable dan detail tahap dinamis.
- Riwayat aktivitas dan statistik dashboard.
- Upload revisi dan SK dengan metadata file.
- Persistence data via backend demo atau localStorage.
- Test otomatis untuk flow utama.
- Build produksi berhasil.

### Batasan Saat Ini

- Backend demo masih menggunakan JSON file; production memerlukan database terkelola (PostgreSQL).
- Autentikasi admin masih sederhana; production memerlukan JWT/session dan role-based access.
- Belum ada audit log immutable.
- Validasi dan security hardening perlu ditingkatkan untuk production.

---

## 10. Next Steps / Roadmap

1. **Integrasi Database Production** – migrasi dari JSON ke PostgreSQL melalui Lovable Cloud.
2. **Autentikasi & Role-Based Access** – login yang aman dengan JWT dan pemisahan role.
3. **Audit Log Immutable** – setiap aksi admin tercatat secara permanan dan tidak dapat diubah.
4. **File Storage Production** – integrasi dengan storage managed untuk dokumen dan SK.
5. **Refactor Domain Workflow** – memisahkan logika bisnis dari context menjadi service/module.
6. **Test Integrasi & Error Handling** – menambah test untuk routing, state error, dan network failure.

---

## 11. Success Metrics

- Pemohon dapat menemukan status permohonan dalam waktu singkat.
- Admin tidak dapat melompat tahap atau melewati dokumen.
- Waktu rata-rata penyelesaian permohonan dapat dipantau melalui dashboard.
- Seluruh riwayat perubahan status tercatat dan dapat diaudit.

---

*Dokumen ini dibuat untuk keperluan project brief dan project overview Tracking OS.*
