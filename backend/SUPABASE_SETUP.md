# Supabase Setup

Isi file `backend/.env` dengan nilai dari Supabase Dashboard.

```txt
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
SUPABASE_BUCKET=tracking-documents
```

Ambil nilainya di:

- `SUPABASE_URL`: Project Settings -> API -> Project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Project Settings -> API -> service_role key
- `SUPABASE_BUCKET`: Storage -> nama bucket yang sudah dibuat

Setelah diisi, restart backend:

```sh
cd backend
npm run dev
```

Cek status:

```txt
http://localhost:4000/api/storage/status
```

Jika benar, response akan berisi:

```json
{
  "configured": true,
  "bucket": "tracking-documents",
  "hasSupabaseUrl": true,
  "hasServiceRoleKey": true
}
```

Penting: service role key hanya boleh ada di backend `.env` atau environment variable backend hosting. Jangan taruh di frontend atau Vercel frontend.
