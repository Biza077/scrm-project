# 📋 Panduan Setup — SCRM Dashboard Perkebunan Teh Tambi

> Panduan ini mencakup cara mengelola proyek dengan Git dan cara setup di laptop baru.

---

## 🗂️ Daftar Isi

1. [Upload Pertama ke GitHub](#1-upload-pertama-ke-github)
2. [Menyimpan Perubahan ke GitHub](#2-menyimpan-perubahan-ke-github)
3. [Setup di Laptop Baru](#3-setup-di-laptop-baru)
4. [Update Project di Laptop Lain](#4-update-project-di-laptop-lain)

---

## 1. Upload Pertama ke GitHub

Jalankan perintah berikut **sekali saja** saat pertama kali menghubungkan proyek ke GitHub.

```bash
git init
git add .
git commit -m "Initial commit: SCRM Dashboard Perkebunan Teh Tambi"
git branch -M main
git remote add origin https://github.com/Biza077/scrm-project.git
git push -u origin main
```

---

## 2. Menyimpan Perubahan ke GitHub

Setiap kali selesai membuat perubahan, jalankan perintah berikut:

```bash
git add .
git commit -m "Deskripsi singkat perubahan yang dilakukan"
git push
```

**Cek status file yang berubah:**

```bash
git status
```

---

## 3. Setup di Laptop Baru

Ikuti langkah-langkah berikut secara **berurutan**.

### Langkah 1 — Clone project dari GitHub

```bash
git clone https://github.com/Biza077/scrm-project.git
cd scrm-project
```

### Langkah 2 — Install semua dependencies

```bash
npm install
```

> Jika `npm` tidak dikenali (pengguna Laragon), gunakan:
> ```powershell
> $env:PATH = "C:\laragon\bin\nodejs\node-v22;$env:PATH"; npm install
> ```

### Langkah 3 — Buat file `.env`

> ⚠️ **Wajib!** File ini tidak ikut di GitHub karena alasan keamanan.

Buat file baru bernama **`.env`** di folder root proyek, lalu isi dengan:

```env
DATABASE_URL="file:./scrm.db"
JWT_SECRET="scrm-super-secret-key-2026-production-ready"
```

> 📌 Pastikan `JWT_SECRET` **sama persis** dengan yang ada di laptop utama agar token login tidak konflik.

### Langkah 4 — Generate Prisma Client

```bash
npx prisma generate
```

### Langkah 5 — Jalankan Server

```bash
npm run dev
```

> Jika `npm` tidak dikenali (pengguna Laragon):
> ```powershell
> $env:PATH = "C:\laragon\bin\nodejs\node-v22;$env:PATH"; npm run dev
> ```

### Langkah 6 — Buka di Browser

```
http://localhost:3000
```

---

## 4. Update Project di Laptop Lain

Jika laptop utama sudah melakukan `git push`, jalankan di laptop lain:

```bash
git pull
```

Jika ada perubahan *dependencies* atau *schema database*:

```bash
npm install
npx prisma generate
```

---

## 🗄️ Catatan Database

| Item | Detail |
|---|---|
| **Jenis Database** | SQLite (file-based) |
| **Lokasi file** | `prisma/scrm.db` |
| **Ikut di GitHub?** | ✅ Ya — data langsung tersedia setelah clone |

> File database `scrm.db` **sengaja disertakan** di GitHub agar laptop lain langsung mendapat data tanpa perlu setup ulang.