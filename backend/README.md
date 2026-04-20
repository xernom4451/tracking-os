# Tracking OS Backend

Backend minimum untuk testing semi-realistis Tracking OS. API ini sengaja memakai Node.js built-in tanpa dependency eksternal supaya cepat dijalankan untuk demo/UAT awal.

## Menjalankan Lokal

```sh
cd backend
copy .env.example .env
npm run dev
```

Default server:

```txt
http://localhost:4000
```

Health check:

```txt
GET /health
```

## Akun Demo

Nilai default dapat diganti lewat environment variable.

```txt
ADMIN_EMAIL=admin@tracking-os.local
ADMIN_PASSWORD=admin123
AUTH_TOKEN=dev-tracking-os-token
```

## Supabase Storage untuk Preview/Download PDF

Isi nilai berikut di `backend/.env` setelah membuat project dan bucket Supabase:

```txt
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service-role-key-dari-supabase
SUPABASE_BUCKET=tracking-documents
```

Cara menemukan nilainya di Supabase:

- `SUPABASE_URL`: Project Settings -> API -> Project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Project Settings -> API -> service_role key
- `SUPABASE_BUCKET`: nama bucket yang dibuat di Storage, misalnya `tracking-documents`

Penting: `SUPABASE_SERVICE_ROLE_KEY` hanya boleh ada di backend `.env` atau environment variable Railway/Render. Jangan pernah masukkan key ini ke frontend atau Vercel frontend.

Jika Supabase env belum diisi, backend tetap berjalan tetapi upload hanya menyimpan metadata.

## Endpoint Utama

```txt
POST   /api/auth/login
GET    /api/submissions
POST   /api/submissions
GET    /api/submissions/:id
PUT    /api/submissions/:id
DELETE /api/submissions/:id
GET    /api/public/submissions
GET    /api/public/track/:submissionNumber
GET    /api/files?key=:storageKey
POST   /api/submissions/:id/confirm-pengajuan
POST   /api/submissions/:id/verification
POST   /api/submissions/:id/review
POST   /api/submissions/:id/revision-upload
POST   /api/submissions/:id/approval
POST   /api/submissions/:id/issue-license
```

Endpoint admin membutuhkan header:

```txt
Authorization: Bearer <AUTH_TOKEN>
```

## Catatan Penting

Backend ini cukup untuk testing semi-realistis karena data sudah tersimpan server-side di `data/db.json` dan bisa dipakai lintas device selama semua client mengarah ke server yang sama.

Untuk production resmi, ganti penyimpanan JSON menjadi PostgreSQL, gunakan hashing password, token JWT/session yang benar, audit log immutable, rate limiting, validasi input yang lebih ketat, dan storage dokumen seperti S3/R2/Supabase Storage.
