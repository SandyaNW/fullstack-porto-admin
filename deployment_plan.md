# 🚀 Full-Stack Portfolio Deployment Plan (100% Lifetime Free)

Dokumen ini adalah panduan deployment monorepo portofolio tanpa biaya bulanan (Rp 0/bulan) menggunakan **Vercel**, **Render.com**, dan **Supabase**.

---

## 1. Project Architecture Overview

- **`/backend-api`**: Express.js API → **Render.com** (Free Web Service)
- **`Database & Storage`**: PostgreSQL & Storage Bucket → **Supabase** (Free Tier 500 MB DB + 1 GB Storage)
- **`/dashboard-admin`**: React SPA (Vite) → **Vercel** (Free Tier)
- **`/porto-page`**: Next.js 15 → **Vercel** (Free Tier)

---

## 2. Setup Supabase (Database & File Storage)

1. **Database PostgreSQL:**
   - Buat project baru di Supabase.
   - Ambil **URI Connection String** (Session Pooler mode) dari `Project Settings -> Database`.

2. **Storage Bucket (Menggantikan Multer Disk Local):**
   - Buka menu **Storage** -> Buat Bucket baru dengan nama `portfolio-assets`.
   - Centang opsi **Public Bucket** agar gambar/file CV bisa diakses publik via URL.

---

## 3. Deploy Backend API ke Render.com

1. Buat **New Web Service** di Render.com dan hubungkan repo GitHub.
2. Atur **Root Directory** ke `backend-api`.
3. Tambahkan **Environment Variables**:
   - `DATABASE_URL`: URI dari Supabase.
   - `SUPABASE_URL` & `SUPABASE_KEY`: Kunci API Supabase untuk penanganan upload file.
   - `ADMIN_URL` & `CLIENT_URL`: URL Vercel untuk konfigurasi CORS.
   - `JWT_SECRET` & `NODE_ENV=production`.

> ⚠️ **Catatan Cold Start:** Di Render Free Tier, backend akan *sleep* jika idle selama 15 menit. Request pertama setelah idle butuh waktu ~30 detik untuk *spin up*.

---

## 4. Deploy Frontend (Vercel)

1. **`dashboard-admin` (Vite):**
   - Root Directory: `dashboard-admin`
   - Env Variable: `VITE_API_URL` = URL Backend Render.

2. **`porto-page` (Next.js 15):**
   - Root Directory: `porto-page`
   - Env Variable: `NEXT_PUBLIC_API_URL` = URL Backend Render.

---

## 5. Konfigurasi CORS Sesuai Domain Produksi

```javascript
const allowedOrigins = [
  process.env.ADMIN_URL,
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS Policy Error'));
    }
  },
  credentials: true
}));
```
