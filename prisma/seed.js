/**
 * SCRM Dashboard — Prisma Seed Script (Prisma 7 + better-sqlite3)
 */

const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const bcrypt = require("bcryptjs");
const DB_PATH = path.join(__dirname, "scrm.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${DB_PATH}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Memulai seeding database SCRM...\n");

  // ─── 1. USERS ──────────────────────────────────────────────────────────────
  const users = [
    {
      username: "admin",
      name: "Maulida Fatimatul Mukaromah",
      password: await bcrypt.hash("admin123", 10),
      division: "Divisi Produksi",
      role: "Administrator",
    },
    {
      username: "maulida",
      name: "Maulida Fatimatul Mukaromah",
      password: await bcrypt.hash("scrm2026", 10),
      division: "Divisi Produksi",
      role: "Operator",
    },
    {
      username: "produksi",
      name: "Operator Produksi",
      password: await bcrypt.hash("produksi123", 10),
      division: "Divisi Produksi",
      role: "Operator",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: { name: user.name, password: user.password },
      create: user,
    });
  }
  console.log(`✅ Users: ${users.length} records`);

  // ─── 2. PRODUCTION METRICS ─────────────────────────────────────────────────
  const metrics = [
    { month: "Januari", short_month: "Jan", year: 2024, rainfall_mm: 312, raw_tea_ton: 420.5, dry_tea_ton: 88.3 },
    { month: "Februari", short_month: "Feb", year: 2024, rainfall_mm: 287, raw_tea_ton: 398.2, dry_tea_ton: 83.6 },
    { month: "Maret", short_month: "Mar", year: 2024, rainfall_mm: 265, raw_tea_ton: 445.8, dry_tea_ton: 93.6 },
    { month: "April", short_month: "Apr", year: 2024, rainfall_mm: 198, raw_tea_ton: 478.3, dry_tea_ton: 100.4 },
    { month: "Mei", short_month: "Mei", year: 2024, rainfall_mm: 143, raw_tea_ton: 512.6, dry_tea_ton: 107.6 },
    { month: "Juni", short_month: "Jun", year: 2024, rainfall_mm: 87, raw_tea_ton: 489.4, dry_tea_ton: 102.8 },
    { month: "Juli", short_month: "Jul", year: 2024, rainfall_mm: 64, raw_tea_ton: 463.1, dry_tea_ton: 97.3 },
    { month: "Agustus", short_month: "Ags", year: 2024, rainfall_mm: 72, raw_tea_ton: 441.7, dry_tea_ton: 92.8 },
    { month: "September", short_month: "Sep", year: 2024, rainfall_mm: 118, raw_tea_ton: 418.9, dry_tea_ton: 88.0 },
    { month: "Oktober", short_month: "Okt", year: 2024, rainfall_mm: 224, raw_tea_ton: 395.2, dry_tea_ton: 83.0 },
    { month: "November", short_month: "Nov", year: 2024, rainfall_mm: 298, raw_tea_ton: 372.8, dry_tea_ton: 78.3 },
    { month: "Desember", short_month: "Des", year: 2024, rainfall_mm: 341, raw_tea_ton: 401.3, dry_tea_ton: 84.3 },
  ];

  for (const m of metrics) {
    await prisma.productionMetric.upsert({
      where: { month_year: { month: m.month, year: m.year } },
      update: { rainfall_mm: m.rainfall_mm, raw_tea_ton: m.raw_tea_ton, dry_tea_ton: m.dry_tea_ton, short_month: m.short_month },
      create: m,
    });
  }
  console.log(`✅ ProductionMetric: ${metrics.length} records`);

  // ─── 3. RISK AGENTS ────────────────────────────────────────────────────────
  const risks = [
    { code_ra: "A3", description: "Tidak akurat dalam perencanaan material", s_score: 8, o_score: 7, d_score: 5, arp_score: 280, scor_phase: "Plan", preventive_action: "Membuat proses pengadaan lebih fleksibel", code_pr: "PA3" },
    { code_ra: "A5", description: "Maksimum inventory kurang efektif", s_score: 7, o_score: 8, d_score: 4, arp_score: 224, scor_phase: "Plan", preventive_action: "Mengintegrasikan seluruh bagian dalam perencanaan rantai pasok", code_pr: "PA1" },
    { code_ra: "B2", description: "Keterlambatan pengiriman bahan baku dari pemasok", s_score: 8, o_score: 6, d_score: 4, arp_score: 192, scor_phase: "Source", preventive_action: "Kolaborasi dengan pemasok dalam meningkatkan proses rantai pasok", code_pr: "PA2" },
    { code_ra: "A1", description: "Tidak akurat dalam perencanaan material (minor)", s_score: 7, o_score: 6, d_score: 4, arp_score: 168, scor_phase: "Plan", preventive_action: "Kolaborasi dengan pemasok dalam meningkatkan proses rantai pasok", code_pr: "PA2" },
    { code_ra: "C1", description: "Gangguan mesin pengolahan teh selama produksi", s_score: 9, o_score: 4, d_score: 4, arp_score: 144, scor_phase: "Make", preventive_action: "Preventive maintenance terjadwal dan pengecekan berkala", code_pr: "PA5" },
    { code_ra: "A7", description: "Pembuatan batch produksi yang tidak sesuai", s_score: 6, o_score: 6, d_score: 4, arp_score: 144, scor_phase: "Plan", preventive_action: "Membuat proses pengadaan lebih fleksibel", code_pr: "PA15" },
    { code_ra: "B4", description: "Pihak pemasok kurang terlibat dalam pengiriman bahan baku", s_score: 7, o_score: 5, d_score: 4, arp_score: 140, scor_phase: "Source", preventive_action: "Kolaborasi dengan pemasok dalam meningkatkan proses rantai pasok", code_pr: "PA2" },
    { code_ra: "D1", description: "Keterlambatan pengiriman produk ke pelanggan", s_score: 7, o_score: 5, d_score: 4, arp_score: 140, scor_phase: "Deliver", preventive_action: "Optimalisasi rute distribusi dan kemitraan logistik", code_pr: "PA8" },
    { code_ra: "A2", description: "Tidak akurat dalam perencanaan material (rendah)", s_score: 6, o_score: 6, d_score: 3, arp_score: 108, scor_phase: "Plan", preventive_action: "Mengintegrasikan perencanaan dengan permintaan pelanggan", code_pr: "PA4" },
    { code_ra: "C3", description: "Ketidaksesuaian standar kualitas teh kering", s_score: 8, o_score: 4, d_score: 3, arp_score: 96, scor_phase: "Make", preventive_action: "Implementasi SOP quality control yang ketat", code_pr: "PA6" },
    { code_ra: "A4", description: "Ketidakpastian permintaan", s_score: 5, o_score: 5, d_score: 3, arp_score: 75, scor_phase: "Plan", preventive_action: "Kolaborasi dengan pemasok dalam meningkatkan proses rantai pasok", code_pr: "PA2" },
    { code_ra: "D3", description: "Kerusakan kemasan produk saat distribusi", s_score: 5, o_score: 4, d_score: 3, arp_score: 60, scor_phase: "Deliver", preventive_action: "Standarisasi prosedur pengemasan dan penanganan produk", code_pr: "PA9" },
  ];

  for (const risk of risks) {
    await prisma.riskAgent.upsert({
      where: { code_ra: risk.code_ra },
      update: { description: risk.description, s_score: risk.s_score, o_score: risk.o_score, d_score: risk.d_score, arp_score: risk.arp_score, scor_phase: risk.scor_phase, preventive_action: risk.preventive_action, code_pr: risk.code_pr },
      create: risk,
    });
  }
  console.log(`✅ RiskAgent: ${risks.length} records`);

  console.log("\n🎉 Seeding selesai! Database siap digunakan.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
