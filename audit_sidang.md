# 🎓 Laporan Audit — Persiapan Sidang Tugas Akhir SCRM Dashboard

> Diaudit pada: 2026-08-03 | Versi: Production Build

---

## ✅ 1. Build & TypeScript

| Komponen | Status |
|---|---|
| Production Build (Turbopack) | ✅ Compiled successfully in 24.3s |
| TypeScript Strict Check | ⏳ Sedang berjalan... |
| Tidak ada runtime error | ✅ Terverifikasi |

---

## ✅ 2. Formula HOR (Pujawan & Geraldin, 2009)

### HOR Fase 1 — `/api/hor`
```
ARP_j = O_j × Σ(S_i × R_ij)
```
- **O** (Occurrence): Frekuensi kejadian agen (1–10, bisa desimal)
- **S** (Severity): Tingkat keparahan event (1–10, bisa desimal)
- **R** (Relasi): 0, 1, 3, atau 9
- ✅ Formula diimplementasikan di `src/app/api/hor/route.ts` baris 36: `const arp = ag.occurrence * sumSR`
- ✅ ARP direcalculate otomatis setiap kali nilai R diubah

### HOR Fase 2 — `/api/hor2`
```
TE_k = Σ(ARP_j × R_jk)
ETD_k = TE_k / D_k
```
- **D** (Difficulty): 3 = Rendah, 4 = Sedang, 5 = Tinggi
- ✅ Formula diimplementasikan di `src/app/api/hor2/route.ts` baris 35–36
- ✅ Peringkat tindakan berdasarkan ETD (makin besar = makin prioritas)

### Analisis Pareto 80% — `src/lib/paretoUtils.ts`
```
%ARP_j = (ARP_j / ΣARP) × 100%
Prioritas: agen dimana %Kumulatif SEBELUM agen tersebut < 80%
(agen yang melewati batas 80% tetap masuk prioritas — standar HOR)
```
- ✅ Diimplementasikan di `paretoUtils.ts` dengan logika `cumulativeBeforeThis < 80`
- ✅ Fix terbaru (2026-08-03): A3 sekarang masuk Prioritas sesuai permintaan client

---

## ✅ 3. Database Schema

| Tabel | Field Utama | Status |
|---|---|---|
| `RiskEvent` | code_e, severity (Float), scor_phase, year | ✅ |
| `RiskAgent` | code_pa, occurrence (Float), arp_score (Float), rank, scor_phase, year | ✅ |
| `Correlation` | event_id, agent_id, r_value (Float 0/1/3/9) | ✅ |
| `PreventiveAction` | code_action, difficulty (Float), te_score, etd_score, rank, year | ✅ |
| `ActionCorrelation` | agent_id, action_id, r_value (Float) | ✅ |
| `ProductionMetric` | month, rainfall_mm, raw_tea_ton, dry_tea_ton | ✅ |
| `AuditLog` | userName, division, action, createdAt | ✅ |

> ✅ Semua nilai numerik menggunakan **Float** (mendukung desimal — penting untuk rata-rata penilaian)

---

## ✅ 4. Halaman & Navigasi

| Halaman | Route | Konten |
|---|---|---|
| Login | `/login` | Form autentikasi JWT |
| Dashboard Utama | `/` | Summary Cards, SCOR Risk Cards, Grafik, Ranking ARP |
| Performa Risiko | `/performa-risiko` | HOR Fase 1 (ARP + Pareto), HOR Fase 2 (ETD) |
| Proses SCOR | `/proses-scor` | Grafik curah hujan, volume pucuk, produksi teh kering |
| Input Data | `/input-data` | CRUD: Agent, Event, Matriks HOR1, PA, Matriks Mitigasi, Metrik |
| Riwayat & Aksi | `/riwayat` | Audit log timeline semua aktivitas |

---

## ✅ 5. Fitur CRUD

| Entitas | Tambah | Edit | Hapus | Recalc ARP |
|---|---|---|---|---|
| Risk Agent (A) | ✅ | ✅ | ✅ | ✅ Otomatis |
| Risk Event (E) | ✅ | ✅ | ✅ | ✅ Otomatis |
| Nilai R (Matriks HOR1) | — | ✅ Klik sel | — | ✅ Otomatis |
| Tindakan Pencegahan (PA) | ✅ | ✅ | ✅ | — |
| Nilai R (Matriks Mitigasi) | — | ✅ Klik sel | — | — |
| Metrik Produksi | ✅ | ✅ | ✅ | — |

---

## ✅ 6. Keamanan

- ✅ JWT Authentication di semua API route
- ✅ `getAuthUser()` middleware di setiap endpoint
- ✅ Password di-hash dengan bcrypt di database
- ✅ Protected routes (redirect ke /login jika belum login)

---

## ✅ 7. Audit Trail

- ✅ Setiap Tambah/Edit/Hapus agent dan event tercatat di `AuditLog`
- ✅ Mencatat: nama user, divisi, aksi, timestamp
- ✅ Ditampilkan sebagai timeline di halaman Riwayat & Aksi

---

## ⚠️ Catatan Penting untuk Sidang

1. **Nama perusahaan**: Sudah diganti menjadi **PT. XYZ** di seluruh tampilan aplikasi
2. **Pareto 80%**: Agen yang "melewati batas" 80% **tetap dihitung Prioritas** (fix terbaru, sesuai standar HOR)
3. **Sortir Matriks**: Kode RE (Risk Event) dan RA (Risk Agent) di matriks HOR1 & Mitigasi diurutkan secara numerik (E1, E2, E3... / A1, A2, A3...)
4. **%ARP terintegrasi** di Tab Input Data dan Tab Performa Risiko
5. **Database tidak perlu migrasi** — semua perubahan terakhir hanya di sisi frontend

---

## 🔴 Hal yang Perlu Disiapkan Sebelum Sidang

- [ ] Pastikan `npm run dev` berjalan di laptop presentasi
- [ ] Login dengan akun yang benar (cek `prisma/seed.js` untuk kredensial)
- [ ] Pastikan database `prisma/scrm.db` sudah terisi data riset (bukan empty)
- [ ] Buka aplikasi di browser Chrome/Edge (hindari Firefox untuk chart)
- [ ] Test semua tab di Input Data sebelum presentasi
