# Rapot Pilar Aksi

Sistem penilaian kinerja (performance report) untuk anggota fungsional HMSI Kabinet Pilar Aksi — dashboard, input assessment 16 indikator per 4 pilar, analytics, dan generate raport PDF per anggota.

## Arsitektur

Satu repo GitHub, dua target deploy:

```
Browser
  │
  ├── Vercel Static Hosting  → index.html, styles.css, app.js, data.js, assets
  │
  └── Vercel Serverless API → /api/*  (Express app di api/index.js)
                                  │
                                  └── Aiven MySQL (mysql2 connection pool)
```

- **Frontend**: HTML/CSS/JS statis, tidak ada build step.
- **Backend**: Express, diekspor sebagai handler (bukan `app.listen`) supaya bisa jalan sebagai Vercel Function.
- **Database**: MySQL yang di-host di Aiven, diakses lewat connection pool (`mysql2/promise`) yang di-cache secara global agar aman dipakai di lingkungan serverless.

Logic penilaian (16 indikator, 4 pilar, formula skor, band, generate PDF) **tidak diubah** — hanya cara deploy & koneksi database yang disesuaikan.

## Struktur Folder

```
rapot-pilar-aksi/
├── index.html          # entry point frontend (dulu "rapottt pilar.html")
├── styles.css
├── app.js               # logic frontend + fetch ke /api
├── data.js               # mock data (fallback/reference struktur)
├── *.png / *.jpg         # asset gambar (logo, cover raport, dll)
├── Logo Departemen/      # logo tiap departemen
│
├── api/
│   └── index.js          # Express app, diekspor sbg Vercel Function
├── lib/
│   └── db.js              # koneksi pool MySQL (Aiven-ready, SSL support)
│
├── seed.js                # seeding departments & members awal
├── local-server.js        # server lokal (reuse app yang sama dgn Vercel)
├── package.json
├── vercel.json            # rewrite /api/* -> api/index.js
├── .gitignore
├── .env.example
├── README.md
└── DEPLOYMENT.md
```

## Tech Stack

- Frontend: HTML, CSS, vanilla JS, Tailwind (CDN), Chart.js (CDN), html2pdf.js (CDN)
- Backend: Node.js, Express 5
- Database driver: mysql2 (promise API)
- Hosting: Vercel (static + serverless functions)
- Database: Aiven MySQL

## Instalasi

```bash
npm install
```

## Setup Environment

Salin `.env.example` menjadi `.env` (untuk MySQL lokal) atau isi langsung sesuai kredensial Aiven:

```
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=3306
DB_SSL=true
DB_CA_CERT=
```

- `DB_SSL=false` untuk MySQL lokal tanpa SSL.
- `DB_SSL=true` + `DB_CA_CERT` untuk Aiven (lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk cara mengambil CA certificate).
- Jangan pernah commit file `.env` — sudah ada di `.gitignore`.

## Menjalankan Seed

```bash
npm run seed
```

Seed akan:
- Membuat tabel `departments`, `members`, `assessments` jika belum ada.
- **Mengosongkan (TRUNCATE)** tabel `members` & `departments`, lalu mengisi ulang data awal.

> ⚠️ **Jangan jalankan `npm run seed` di production setelah data asli (assessment, score, band) sudah masuk** — proses ini akan mereset data anggota dan departemen.

## Menjalankan Lokal

```bash
npm install
npm run seed     # sekali saja, untuk isi data awal
npm run dev
```

Buka `http://localhost:3000` — frontend dan API jalan di satu origin yang sama (Express menyajikan file statis sekaligus route `/api/*`), sama seperti perilaku di Vercel.

## Deploy ke Vercel

Lihat langkah lengkap di [DEPLOYMENT.md](DEPLOYMENT.md).

Ringkas:
1. Push repo ke GitHub.
2. Import project di Vercel, framework preset **Other**.
3. Isi Environment Variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `DB_SSL`, `DB_CA_CERT`).
4. Deploy.
5. Test `/api/health`, `/api/members`, `/api/departments`.

## Setup Aiven MySQL

Lihat [DEPLOYMENT.md](DEPLOYMENT.md) bagian Aiven.

## Endpoint API

Semua endpoint (kecuali `/api/health` dan `/api/auth/login`) memerlukan header:
`Authorization: Bearer <token>` (didapat dari `/api/auth/login`).

| Method | Endpoint | Fungsi | Auth |
|---|---|---|---|
| GET | `/api/health` | Cek API hidup | Publik |
| POST | `/api/auth/login` | Login, mengembalikan JWT | Publik |
| GET | `/api/auth/me` | Info akun yang sedang login | Wajib |
| GET | `/api/members?period=MID_YEAR` | Ambil anggota (scoped by role), score/band sesuai periode | Wajib |
| GET | `/api/departments` | Ambil semua departemen (metadata, tidak scoped) | Wajib |
| GET | `/api/analytics?period=MID_YEAR` | Rata-rata per departemen + distribusi band (scoped by role) | Wajib |
| GET | `/api/assessments/:memberId?period=MID_YEAR` | Ambil assessment 1 anggota untuk 1 periode | Wajib + scope |
| POST | `/api/assessments` | Upsert assessment (`memberId`, `period`, `ratings[16]`, `notes`) | Wajib + scope |

`period` bernilai `MID_YEAR` atau `END_YEAR` (default `MID_YEAR` bila tidak dikirim).

Role `DEPT` yang mencoba mengakses `memberId` di luar departemennya (lewat URL/API langsung) akan mendapat `403`, bukan hanya disembunyikan di UI.

## Role & Akses

- **EB** (super admin): melihat & menilai seluruh anggota semua departemen, dashboard dan analytics seluruh kabinet.
- **DEPT** (`hrd`, `ia`, `swf`, `rta`, `im`, `ea`, `es`, `socdev`, `manage`): hanya melihat & menilai anggota departemennya sendiri. Difilter di backend (SQL `WHERE`), bukan hanya disembunyikan di frontend.

## Periode Assessment

Sistem mendukung 2 periode penilaian per tahun kabinet:

- `MID_YEAR` — ditampilkan sebagai "Mid-Year 2026"
- `END_YEAR` — ditampilkan sebagai "End-Year 2026"

Satu anggota maksimal punya **satu** assessment per periode (`UNIQUE (member_id, assessment_period)` di database). Submit ulang untuk member + periode yang sama akan **mengedit** row yang sudah ada, bukan membuat duplikat.

## Menjalankan Migration

Sebelum fitur login/periode bisa dipakai, jalankan migration terhadap database (disarankan backup/export dulu, karena migration ini menghapus baris assessment duplikat lama):

```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < migrations/20260704_auth_period_assessments.sql
```

Migration ini akan:
1. Menambah kolom `assessment_period` (default `MID_YEAR` untuk data lama) dan `updated_at`.
2. Menghitung ulang `total_score`/`band` untuk assessment lama yang tersimpan 0 (bug lama, lihat bagian Troubleshooting).
3. Menghapus duplikat assessment lama (member + periode sama), menyisakan yang terbaru.
4. Menambah unique constraint `(member_id, assessment_period)`.
5. Membuat tabel `users` untuk login.

## Membuat Akun Login

Setelah migration, isi `JWT_SECRET`, `DEFAULT_EB_PASSWORD`, dan `DEFAULT_DEPT_PASSWORD` di `.env`, lalu:

```bash
npm run seed:users
```

Ini membuat 10 akun: `eb` (role `EB`, password `DEFAULT_EB_PASSWORD`) dan `hrd`/`ia`/`swf`/`rta`/`im`/`ea`/`es`/`socdev`/`manage` (role `DEPT`, password `DEFAULT_DEPT_PASSWORD`). Aman dijalankan berkali-kali — meng-upsert berdasarkan `username`, tidak menyentuh tabel `members`/`departments`/`assessments`. Menjalankan ulang dengan password default yang berbeda akan menimpa hash password akun-akun tersebut.

## Login sebagai EB vs Departemen

Buka aplikasi → layar login akan tampil sebelum dashboard. Login dengan salah satu username di atas + passwordnya:
- Login sebagai `eb` → melihat seluruh data kabinet, semua departemen bisa diakses.
- Login sebagai mis. `hrd` → hanya melihat anggota, assessment, dan dashboard departemen HRD saja.

Token disimpan di `localStorage`; tombol logout ada di footer sidebar (ikon sign-out).

## Endpoint API (lama)

Struktur request/response endpoint assessment mengikuti implementasi lama (16 indikator, formula, band) — **tidak diubah**, hanya ditambah scoping dan periode.

## Troubleshooting

- **Fetch ke `/api/...` gagal / CORS error di lokal**: pastikan buka lewat `http://localhost:3000` (dari `npm run dev`), bukan lewat `file://` atau Live Server terpisah, karena frontend & API harus satu origin agar path relatif `/api` bekerja.
- **Error koneksi database di Vercel**: cek Environment Variables sudah lengkap, dan `DB_SSL=true` + `DB_CA_CERT` terisi benar untuk Aiven.
- **`DB_CA_CERT` tidak terbaca / error SSL handshake**: pastikan isi certificate disalin utuh; kode sudah menangani newline literal `\n` lewat `.replace(/\\n/g, '\n')`.
- **Data hilang setelah deploy**: jangan jalankan `npm run seed` ulang di database production yang sudah ada data asli. `npm run seed:users` **aman** dijalankan di production (tidak menyentuh members/departments/assessments), tapi `npm run seed` (yang lama) tetap **tidak boleh**.
- **Assessment tersimpan dengan score 0**: bug lama disebabkan frontend mengirim skor dari tampilan tanpa dihitung ulang di backend. Sekarang backend selalu menghitung ulang `total_score`/`band` dari 16 rating yang dikirim (`lib/scoring.js`), skor/band dari frontend tidak pernah dipakai langsung. Data lama yang sudah 0 diperbaiki oleh migration di atas.

## Catatan Keamanan

- Tidak ada credential database yang di-hardcode di source code.
- `.env` dan `node_modules/` tidak boleh (dan sudah di-`.gitignore`) masuk ke git.
- Jika credential database pernah ter-commit ke git history publik, **segera ganti password database** — riwayat git tetap menyimpan versi lama meski file dihapus dari commit berikutnya.
