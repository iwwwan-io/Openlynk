# OpenLynk 🚀

> **Platform Link-in-Bio & Toko Produk Digital All-in-One untuk Kreator Indonesia.**  
> Alternatif modern untuk Lynk.id dan Bento.me yang dibangun dengan fokus 100% pada produk digital, donasi sawer QRIS, dan kemandirian kreator.

---

## 📋 Daftar Isi
- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Struktur Proyek](#-struktur-proyek)
- [Panduan Memulai](#-panduan-memulai)
- [Variabel Lingkungan (Environment Variables)](#-variabel-lingkungan-environment-variables)
- [Arsitektur & Alur Kerja](#-arsitektur--alur-kerja)
  - [1. 100% Khusus Produk Digital](#1-100-khusus-produk-digital)
  - [2. Alur Pembayaran Midtrans](#2-alur-pembayaran-midtrans)
  - [3. Penyimpanan Aset & File via ImageKit](#3-penyimpanan-aset--file-via-imagekit)
  - [4. Notifikasi WhatsApp & Email Pengiriman](#4-notifikasi-whatsapp--email-pengiriman)
  - [5. Portal Akses Pembeli (Buyer Portal)](#5-portal-akses-pembeli-buyer-portal)
- [🔄 SOP Alur Kerja Pengembangan Aman](#-sop-alur-kerja-pengembangan-aman)
- [Pengujian Otomatis (Unit & Integration Tests)](#-pengujian-otomatis-unit--integration-tests)
- [Skrip NPM / Bun](#-skrip-npm--bun)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

### 🎨 Bento Grid Visual Studio
- **Drag & Drop Interactive Grid**: Atur tata letak kartu profil dengan ukuran fleksibel (1x1, 2x1, 2x2, 4x2) menggunakan `react-grid-layout`.
- **Tipe Kartu Lengkap**:
  - 🔗 **Tautan (Link)**: Tautan kustom dengan icon, preview gambar, dan tracking klik.
  - 📦 **Produk Digital**: Kartu etalase produk langsung ke modal checkout instan.
  - ☕ **Sawer / Donasi QRIS**: Terima apresiasi dan tip dari audiens lengkap dengan pesan kustom.
  - 👤 **Header & Bio**: Foto profil, nama tampilan, lencana verifikasi, bio, dan tombol sosial media.
  - 🖼️ **Media Gambar & Banner**: Galeri visual dan banner cover profil.
  - 🎬 **Embed Interaktif**: Dukungan pemutar YouTube, Spotify playlist/track, dan Google Maps.
  - 💻 **Widget Developer**: Tampilkan repositori GitHub dan Google Calendar.
- **Kustomisasi Tema**: Pengaturan warna aksen, background solid/gradien, tipografi, dan sudut membulat (*border radius*).

### 🛒 100% Toko Produk Digital
- **Khusus Produk Digital**: E-book, source code, preset, course, template, software license, atau file unduhan aman.
- **Tanpa Komplikasi Produk Fisik**: Bebas ongkir, tanpa pemilihan kurir, dan tanpa nomor resi logistik fisik.
- **Pengiriman Instan & Aman**: File dikirimkan langsung setelah pembayaran lunas via download URL berbatas waktu (*expiring signed download links*).

### 💳 Pembayaran & Checkout Otomatis
- **Gateway Pembayaran Terintegrasi (Midtrans)**: Mendukung QRIS, GoPay, ShopeePay, OVO, Virtual Account (BCA, Mandiri, BNI, BRI, Permata), dan Kartu Kredit.
- **Simulator Sandbox Bawaan**: Siap diuji secara instan di lingkungan lokal tanpa perlu mengisi API key Midtrans.
- **Skema Biaya Transparan**: Perhitungan otomatis komisi platform 5% dan saldo bersih kreator.

### 🏷️ Sistem Kupon & Diskon Dinamis
- **Tipe Diskon**: Potongan persentase (%) atau nominal tetap (Rp).
- **Aturan Kupon**: Batas kuota pemakaian, minimum transaksi belanja, dan masa kedaluwarsa kupon.
- **Pemulihan Kuota**: Kuota kupon otomatis dikembalikan jika pesanan kedaluwarsa atau dibatalkan.

### 📱 Pengiriman WhatsApp & Email Otomatis
- **WhatsApp Transactional Gateway**: Kirim pesan notifikasi instan dan link download digital ke WhatsApp pembeli via Fonnte, Wablas, atau Custom Webhook.
- **Normalisasi Nomor Telepon**: Format nomor otomatis disesuaikan menjadi standar Indonesia (`628xxx`).
- **Email Transaksional via Resend**: Salinan struk dan tautan berkas digital dikirim langsung ke kotak masuk email pembeli.

### 🔍 Portal Akses Pembeli Mandiri (`/akses`)
- Pembeli dapat mencari dan mengunduh kembali produk yang pernah dibeli cukup dengan memasukkan nomor WhatsApp atau Email mereka.

### 💼 Dompet Kreator & Penarikan Dana (Payouts)
- Dashboard pemantauan saldo bersih penjualan dan riwayat transaksi.
- Manajemen rekening bank penarikan dana (BCA, Mandiri, BRI, BNI, Bank Jago, Seabank, dll).
- Permohonan penarikan dana (*payout request*) dengan verifikasi saldo minimum.

### 🔒 Autentikasi Kreator & Multi-Tenancy
- Sistem login & registrasi terisolasi dengan hashing aman (`salt:key`).
- Kreator dapat membuat dan mengelola banyak halaman profil (*multi-page*) dari satu akun.
- Dropdown switcher profil terintegrasi langsung di navbar studio.
- Dukungan *Custom Domain* per halaman profil.

---

## 🛠️ Teknologi

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **UI & Styling**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Grid Layout**: [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout)
- **Database**: [SQLite](https://www.sqlite.org/) via [`@libsql/client`](https://github.com/tursodatabase/libsql-client-ts) & [Drizzle ORM](https://orm.drizzle.team/)
- **Storage**: [ImageKit](https://imagekit.io/) SDK (dengan fallback lokal otomatis)
- **Payment**: [Midtrans Snap API](https://midtrans.com/)
- **Email**: [Resend](https://resend.com/)
- **Testing**: `bun test` (84 Unit & Integration Tests)

---

## 📁 Struktur Proyek

```text
openlynk/
├── src/
│   ├── app/
│   │   ├── masuk|daftar|lupa-password/ # Auth kreator + reset password
│   │   ├── klaim|jelajahi|akses/  # Klaim slug, eksplorasi, portal pembeli
│   │   ├── [slug]/             # Halaman publik profil bento & checkout
│   │   ├── dashboard/          # Studio kreator (bento, toko, kupon, analitik, dompet)
│   │   ├── admin/              # Panel admin platform (guard role=admin)
│   │   └── api/                # REST API:
│   │       ├── auth/           # Login, register, logout, me, forgot/reset, Google OAuth
│   │       ├── admin/          # Overview, users, orders, audit, bootstrap
│   │       ├── buyer|coupons|downloads|orders|payouts/ # Alur pembeli & kreator
│   │       ├── payment/        # Snap & Midtrans webhook
│   │       └── uploads|storage|track|subscribe|analytics|health
│   ├── components/
│   │   ├── ui/                 # Komponen shadcn (button, dialog, table, dst.)
│   │   └── *.tsx               # ConfirmDialog, DataPagination, StatusBadge, Navbar, dll
│   └── lib/
│       ├── auth|admin|google|midtrans|payout|ratelimit # Backend inti
│       ├── db/{index,schema,seed-data}.ts # SQLite/Turso + migrasi + seed
│       ├── email|whatsapp|storage|export-csv|validate|types|themes|grid|embeds
├── data/                       # SQLite lokal (dev) — prod memakai Turso
├── tests/                      # 12 berkas pengujian otomatis (84 tests)
├── public/                     # Aset statis & berkas demo
└── components.json             # Konfigurasi shadcn/ui
```

---

## 🚀 Panduan Memulai

### 1. Prasyarat
- Pasang [Bun](https://bun.sh/) (rekomendasi: versi 1.2+).
- Node.js versi 20+ (opsional jika menggunakan bun).

### 2. Instalasi Dependensi
```bash
bun install
```

### 3. Konfigurasi Lingkungan (.env)
Salin contoh berkas konfigurasi lingkungan:
```bash
cp .env.example .env
```
Sesuaikan variabel lingkungan yang diperlukan (lihat tabel di bawah). Jika dibiarkan kosong, OpenLynk akan berjalan secara otomatis dalam **mode sandbox & fallback lokal**.

### 4. Menjalankan Server Pengembangan
```bash
bun run dev
```
Buka browser dan akses [http://localhost:3000](http://localhost:3000).
- Profil Demo Publik: [http://localhost:3000/alex](http://localhost:3000/alex)
- Dashboard Kreator: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- Portal Akses Pembeli: [http://localhost:3000/akses](http://localhost:3000/akses)

---

## 🔑 Variabel Lingkungan (Environment Variables)

| Variabel | Keterangan | Wajib? |
| --- | --- | :---: |
| `DATABASE_URL` | URL SQLite file path (default: `file:./data/openlynk.db`) | Opsional |
| `BETTER_AUTH_SECRET` | Secret key enkripsi sesi autentikasi | Disarankan |
| `NEXT_PUBLIC_URL` | Domain publik aplikasi (contoh: `http://localhost:3000`) | Ya |
| `MIDTRANS_SERVER_KEY` | Server Key Midtrans untuk verifikasi transaksi & Snap | Opsional (Sandbox fallback jika kosong) |
| `MIDTRANS_CLIENT_KEY` | Client Key Midtrans | Opsional |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Client Key Midtrans untuk Snap frontend | Opsional |
| `MIDTRANS_IS_PRODUCTION` | `false` untuk Sandbox, `true` untuk Production | Opsional |
| `IMAGEKIT_PUBLIC_KEY` | Public Key dari akun ImageKit | Opsional (Fallback lokal jika kosong) |
| `IMAGEKIT_PRIVATE_KEY` | Private Key dari akun ImageKit | Opsional |
| `IMAGEKIT_URL_ENDPOINT` | URL Endpoint ImageKit (contoh: `https://ik.imagekit.io/xxx`) | Opsional |
| `FONNTE_TOKEN` | Token API Gateway WhatsApp Fonnte | Opsional (Log konsol jika kosong) |
| `WABLAS_TOKEN` | Token API Gateway WhatsApp Wablas | Opsional |
| `WABLAS_DOMAIN` | Domain server Wablas (default: `https://kudus.wablas.com`) | Opsional |
| `RESEND_API_KEY` | API Key layanan email Resend | Opsional (Log konsol jika kosong) |
| `EMAIL_FROM` | Alamat pengirim email (contoh: `OpenLynk <noreply@openlynk.id>`) | Opsional |
| `ADMIN_TOKEN` | Kunci operator platform (bootstrap admin, bypass darurat) | Wajib di prod |
| `GOOGLE_CLIENT_ID` | Client ID OAuth Google (tombol login disembunyikan bila kosong) | Opsional |
| `GOOGLE_CLIENT_SECRET` | Client Secret OAuth Google | Opsional |

---

## 🏗️ Arsitektur & Alur Kerja

### 1. 100% Khusus Produk Digital
OpenLynk didesain murni untuk perdagangan produk non-fisik:
- Setiap item produk wajib menyertakan berkas digital (`fileUrl`) atau tautan akses eksternal.
- Formulir checkout hanya meminta **Nama**, **Email**, dan **Nomor WhatsApp**.
- Tidak ada tahap input alamat pengiriman, kalkulasi ongkos kirim (ongkir), atau integrasi kurir logistik.

### 2. Alur Pembayaran Midtrans
1. Pembeli memilih produk digital atau sawer donasi di halaman kreator (`/[slug]`).
2. Pembeli memasukkan kupon promo (jika ada) dan menekan **Bayar**.
3. Sistem membuat transaksi di Midtrans Snap API dan mencatat order berstatus `pending`.
4. Pembeli menyelesaikan pembayaran via QRIS atau saluran bank pilihan.
5. Midtrans mengirimkan notifikasi HTTP ke webhook: `POST /api/payment/midtrans-webhook`.
6. Sistem memverifikasi SHA-512 signature, mengubah status order menjadi `paid`, mengamankan saldo kreator, serta memicu pengiriman berkas digital.

### 3. Penyimpanan Aset & File via ImageKit
- Berkas unduhan digital dan gambar banner/avatar diunggah langsung melalui provider ImageKit.
- Apabila kredensial ImageKit belum disetel di `.env`, sistem secara mulus beralih ke penyimpan berkas lokal di folder `/public/uploads` sehingga pengembangan lokal tidak pernah terhambat.
- Pengunduhan berkas digital dilindungi endpoint otorisasi [`/api/downloads/[orderId]`](file:///root/openlynk/src/app/api/downloads/%5BorderId%5D/route.ts) yang memverifikasi kepemilikan order sebelum memberikan *signed download URL*.

### 4. Notifikasi WhatsApp & Email Pengiriman
- Begitu pesanan terkonfirmasi lunas, mesin notifikasi secara simultan:
  - Mengirim template pesan WhatsApp berisi ucapan terima kasih dan tombol tautan aman untuk mengunduh produk digital.
  - Mengirimkan email transaksional dengan rincian pembelian.

### 5. Portal Akses Pembeli (Buyer Portal)
- Pembeli yang kehilangan tautan unduhan tidak perlu menghubungi kreator secara manual.
- Cukup mengunjungi menu [`/akses`](file:///root/openlynk/src/app/akses/page.tsx), memasukkan nomor WhatsApp atau Email yang digunakan saat checkout, dan seluruh riwayat produk digital yang pernah dibeli akan langsung tersedia untuk diunduh kembali.

---

## 🔄 SOP Alur Kerja Pengembangan Aman

Untuk menjaga agar halaman yang sudah dipublikasikan (*live production*) tidak pernah rusak atau mengalami *downtime*, ikuti Standar Operasional Prosedur (SOP) pengembangan berikut:

### 1. Aturan Emas: Jangan Pernah Push Langsung ke `main`
Seluruh penambahan fitur, perbaikan bug, atau perubahan tampilan **wajib** dikerjakan melalui cabang (*branch*) terpisah dan digabungkan via **Pull Request (PR)**.

### 2. Alur 7 Langkah Siklus Pengembangan

1. **Sinkronkan Branch `main` Lokal Terkini**:
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Buat Cabang Baru untuk Fitur / Perbaikan**:
   ```bash
   git checkout -b feature/nama-fitur-baru
   # atau: git checkout -b fix/perbaikan-bug
   ```
3. **Kembangkan & Uji Coba di Lokal**:
   ```bash
   bun run dev
   ```
   Buka `http://localhost:3000` di browser dan lakukan modifikasi kode.
4. **Jalankan "Triple Check" Mandiri Sebelum Push**:
   ```bash
   bun run lint                     # 1. Cek kerapian & sintaks kode
   bun test --env-file=.env.test   # 2. Validasi seluruh tes otomatis lolos
   bun run build                    # 3. Uji kompilasi produksi Next.js 16
   ```
5. **Commit & Push ke GitHub**:
   ```bash
   git add .
   git commit -m "feat: deskripsi perubahan fitur"
   git push -u origin feature/nama-fitur-baru
   ```
6. **Buka Pull Request (PR) di GitHub**:
   - Di repositori GitHub, klik tombol **Compare & pull request**.
   - **GitHub Actions CI** akan otomatis menguji linting, tes, dan build (wajib centang hijau).
   - **Vercel** akan otomatis membuatkan **Preview Deployment URL** (misal: `https://openlynk-git-feature-xxx.vercel.app`) untuk uji coba nyata sebelum digabungkan.
7. **Merge ke Produksi**:
   - Setelah seluruh status check hijau dan hasil preview sesuai, klik **Merge pull request** → **Confirm merge**.
   - Vercel akan otomatis mendeploy versi baru ke produksi secara live dalam ~30 detik dengan *zero downtime*.

### 3. Migrasi Skema Basis Data
Jika Anda memodifikasi skema tabel di `src/lib/db/schema.ts`, sinkronkan perubahan skema ke database Turso cloud dengan perintah:
```bash
bun run db:push
```

### 4. Jaring Pengaman Terakhir: Vercel Instant Rollback
Jika terjadi kesalahan tak terduga yang lolos ke produksi:
1. Buka Vercel Dashboard → Tab **Deployments**.
2. Pilih deployment versi sebelumnya yang stabil.
3. Klik menu tiga titik `...` lalu pilih **Instant Rollback**. Website akan pulih ke versi stabil dalam waktu < 5 detik.

---

## 🧪 Pengujian Otomatis (Unit & Integration Tests)

Seluruh logika inti, kalkulasi diskon, proteksi berkas, dan multi-tenant telah divalidasi dengan rangkaian pengujian otomatis.

```bash
bun test --env-file=.env.test
```

### Ringkasan Rangkaian Tes:
- `tests/unit.test.ts`: Pemotongan platform fee 5%, validasi slug & reserved keyword, layout grid bento sizing, parsing URL embeds (YouTube, Spotify, Maps), dan URL routing dashboard.
- `tests/db.test.ts`: Inisialisasi SQLite database, pencatatan views & clicks atomik, serta persistensi data.
- `tests/coupons.test.ts`: Validasi diskon persentase dan diskon nominal, proteksi minimum belanja, validasi kedaluwarsa, dan tracking penggunaan kupon.
- `tests/socials.test.ts`: Normalisasi link media sosial (Instagram, TikTok, YouTube, WhatsApp, X, Spotify, dll) dan persistensi banner profil.
- `tests/transactions.test.ts`: Siklus transaksi donasi sawer QRIS, pemulihan kuota stok dan kupon saat order batal/expired.
- `tests/auth.test.ts`: Cryptographic password hashing, manajemen sesi, dan isolasi otorisasi data multi-tenant.
- `tests/storage.test.ts`: Pengujian provider ImageKit, fallback lokal, dan proteksi endpoint unduhan berkas digital.
- `tests/whatsapp_and_buyer_portal.test.ts`: Formatting nomor HP Indonesia, logging WhatsApp gateway, dan pencarian order di Portal Akses Pembeli.
- `tests/finance.test.ts`: Kalkulasi saldo kreator, manajemen rekening bank pencairan, validasi saldo minimum, dan lifecycle penarikan dana.
- `tests/growth_and_domains.test.ts`: Normalisasi dan persistensi custom domain kreator.

Hasil saat ini: **84 pass, 0 fail (334 expect calls)**.

---

## 📜 Skrip NPM / Bun

| Perintah | Deskripsi |
| --- | --- |
| `bun run dev` | Menjalankan server lokal Next.js dengan Turbopack |
| `bun run build` | Melakukan build produksi aplikasi |
| `bun run start` | Menjalankan server aplikasi versi produksi |
| `bun test` | Menjalankan seluruh rangkaian tes otomatis |
| `bun run lint` | Memeriksa kepatuhan kode dengan ESLint |
| `bun run db:push` | Mendorong perubahan skema Drizzle ORM ke SQLite |
| `bun run db:studio` | Membuka Drizzle Studio web GUI untuk menginspeksi basis data |

---

## 📄 Lisensi
Hak Cipta © 2026 OpenLynk Team. Dilisensikan di bawah [GNU General Public License v3.0 (GPL-3.0)](LICENSE).
