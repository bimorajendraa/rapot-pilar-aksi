# DEPLOYMENT.md

Panduan ringkas deploy **Rapot Pilar Aksi** ke Vercel (frontend + API) dengan database Aiven MySQL.

## 1. Setup Aiven MySQL

1. Buat service **MySQL** baru di [Aiven](https://aiven.io/).
2. Setelah service running, buka tab **Overview** / **Connection information** dan catat:
   - Host
   - Port
   - User
   - Password
   - Database name (default biasanya `defaultdb`)
   - CA Certificate (biasanya di bagian "CA Certificate" — download atau copy isinya)

## 2. Copy Credential Aiven

Simpan kredensial di atas — akan dipakai di dua tempat: `.env.local` (untuk lokal) dan Environment Variables Vercel (untuk production).

## 3. Isi `.env.local` (atau `.env`)

Salin dari `.env.example`:

```
DB_HOST=<host-aiven>
DB_USER=<user-aiven>
DB_PASSWORD=<password-aiven>
DB_NAME=<nama-database>
DB_PORT=<port-aiven>
DB_SSL=true
DB_CA_CERT=<isi-ca-certificate>
```

Cara mengisi `DB_CA_CERT`:
- Salin seluruh isi file CA certificate dari Aiven (termasuk baris `-----BEGIN CERTIFICATE-----` dan `-----END CERTIFICATE-----`).
- Simpan sebagai satu baris environment variable. Jika newline di dalam certificate berubah jadi karakter escape `\n` literal (umum terjadi saat disalin ke env var single-line), tidak masalah — kode di `lib/db.js` sudah menangani ini lewat `.replace(/\\n/g, '\n')` sehingga certificate tetap terbaca benar oleh driver MySQL.

## 4. Jalankan `npm install`

```bash
npm install
```

## 5. Jalankan `npm run seed`

```bash
npm run seed
```

> ⚠️ Seed akan **TRUNCATE** tabel `members` dan `departments` sebelum mengisi ulang. Jangan jalankan pada database yang sudah berisi data asli (assessment, score, band anggota) kecuali memang ingin mereset.

Pastikan setelah seed, tabel berikut sudah ada di Aiven:
- `departments`
- `members`
- `assessments`

Test cepat: jalankan `npm run dev` lokal lalu buka `http://localhost:3000/api/members` dan `/api/departments` — harus mengembalikan data JSON.

## 6. Push ke GitHub

```bash
git add <file-yang-relevan>
git commit -m "Prepare for Vercel + Aiven MySQL deployment"
git push
```

Pastikan `.env` **tidak ikut ter-commit** (sudah ada di `.gitignore`).

## 7. Import Repo ke Vercel

1. Masuk ke [vercel.com](https://vercel.com) → **Add New Project**.
2. Import repository GitHub ini.
3. Framework Preset: **Other**.
4. Root Directory: root project (default, jangan diubah).
5. Build Command: kosongkan / default.
6. Output Directory: kosongkan / default.

## 8. Isi Environment Variables di Vercel

Di **Project Settings → Environment Variables**, tambahkan:

| Key | Value |
|---|---|
| `DB_HOST` | host Aiven |
| `DB_USER` | user Aiven |
| `DB_PASSWORD` | password Aiven |
| `DB_NAME` | nama database |
| `DB_PORT` | port Aiven |
| `DB_SSL` | `true` |
| `DB_CA_CERT` | isi CA certificate Aiven |

Terapkan untuk environment **Production** (dan **Preview** jika ingin preview deployment juga bisa akses database).

## 9. Deploy

Klik **Deploy**. Vercel akan:
- Menyajikan file statis di root (`index.html`, `styles.css`, `app.js`, `data.js`, asset gambar) langsung dari domain Vercel.
- Menjalankan `api/index.js` sebagai serverless function untuk semua request `/api/*` (lihat `vercel.json`).

## 10. Test API

Buka di browser atau lewat `curl`:

- `GET https://<domain-vercel>/api/health` → `{ "message": "Rapot Pilar Aksi API is running" }`
- `GET https://<domain-vercel>/api/members`
- `GET https://<domain-vercel>/api/departments`
- `GET https://<domain-vercel>/api/assessments/1`

## 11. Test Frontend

Buka `https://<domain-vercel>/` dan pastikan:
- Dashboard, chart, dan tabel anggota/departemen ter-load dari API (bukan data kosong / error).
- Halaman Assessment Input bisa menyimpan data (Simpan ke Database).
- Report Preview bisa menampilkan data anggota dan Generate/Download PDF berjalan normal.

---

## Jika `.env` atau `node_modules` sudah pernah ter-commit

Cek dulu:

```bash
git ls-files | grep -E "\.env$|node_modules"
```

Jika ada:

```bash
git rm --cached .env
git rm --cached backend/.env
git rm -r --cached node_modules
git rm -r --cached backend/node_modules
git commit -m "Stop tracking .env and node_modules"
```

**Jika credential database pernah ter-push ke repo publik, riwayat git tetap menyimpannya walau file sudah dihapus di commit baru — segera ganti (rotate) password database tersebut di Aiven / MySQL, jangan hanya mengandalkan penghapusan file.**
