# ============================================================
# SCRM PROJECT — Panduan Git & Setup Laptop Baru
# ============================================================


# ── UPLOAD PERTAMA KE GITHUB ──────────────────────────────
git init
git add .
git commit -m "Initial commit: SCRM Dashboard Perkebunan Teh Tambi"
git branch -M main
git remote add origin https://github.com/UsernameAnda/nama-project.git
git push -u origin main


# ── UPDATE / SIMPAN PERUBAHAN KE GITHUB ───────────────────
git add .
git commit -m "Deskripsi perubahan yang dilakukan"
git push


# ── CEK STATUS FILE ───────────────────────────────────────
git status


# ============================================================
# SETUP DI LAPTOP BARU / LAPTOP LAIN
# ============================================================

# 1. Clone project dari GitHub
git clone https://github.com/UsernameAnda/scrm-project.git
cd scrm-project

# 2. Install semua dependencies
npm install

# 3. Buat file .env (WAJIB — tidak ikut di GitHub karena alasan keamanan)
#    Buat file bernama ".env" di root project, isi dengan:
#
#    DATABASE_URL="file:./scrm.db"
#    JWT_SECRET="scrm-super-secret-key-2026-production-ready"
#
#    CATATAN: Pastikan JWT_SECRET sama persis dengan laptop utama!

# 4. Generate Prisma Client
npx prisma generate

# 5. Jalankan server
#    Jika npm tersedia langsung:
npm run dev
#    Jika npm tidak dikenali (Laragon), gunakan:
$env:PATH = "C:\laragon\bin\nodejs\node-v22;$env:PATH"; npm run dev

# 6. Buka di browser: http://localhost:3000


# ── UPDATE PROJECT DI LAPTOP LAIN ─────────────────────────
git pull
# Jika ada perubahan dependencies:
npm install
# Jika ada perubahan schema database:
npx prisma generate