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

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/health` | Cek API hidup — `{ "message": "Rapot Pilar Aksi API is running" }` |
| GET | `/api/members` | Ambil semua anggota |
| GET | `/api/departments` | Ambil semua departemen |
| GET | `/api/assessments/:memberId` | Ambil assessment terakhir milik satu anggota |
| POST | `/api/assessments` | Simpan assessment (update score/band member + insert detail) |

Struktur request/response mengikuti implementasi lama — tidak diubah.

## Troubleshooting

- **Fetch ke `/api/...` gagal / CORS error di lokal**: pastikan buka lewat `http://localhost:3000` (dari `npm run dev`), bukan lewat `file://` atau Live Server terpisah, karena frontend & API harus satu origin agar path relatif `/api` bekerja.
- **Error koneksi database di Vercel**: cek Environment Variables sudah lengkap, dan `DB_SSL=true` + `DB_CA_CERT` terisi benar untuk Aiven.
- **`DB_CA_CERT` tidak terbaca / error SSL handshake**: pastikan isi certificate disalin utuh; kode sudah menangani newline literal `\n` lewat `.replace(/\\n/g, '\n')`.
- **Data hilang setelah deploy**: jangan jalankan `npm run seed` ulang di database production yang sudah ada data asli.

## Catatan Keamanan

- Tidak ada credential database yang di-hardcode di source code.
- `.env` dan `node_modules/` tidak boleh (dan sudah di-`.gitignore`) masuk ke git.
- Jika credential database pernah ter-commit ke git history publik, **segera ganti password database** — riwayat git tetap menyimpan versi lama meski file dihapus dari commit berikutnya.
