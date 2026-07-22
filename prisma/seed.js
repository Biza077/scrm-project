/**
 * prisma/seed.js — HOR Fase 1 + Fase 2 Seed Data
 * Prisma 7 + better-sqlite3 adapter compatible
 */

const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const bcrypt = require("bcryptjs");

const DB_PATH = path.join(process.cwd(), "prisma", "scrm.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${DB_PATH}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding HOR database (Fase 1 + Fase 2)...\n");

  // ── 1. Users ─────────────────────────────────────────────
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      name: "Administrator",
      password: await bcrypt.hash("admin123", 10),
      division: "Manajemen Risiko",
      role: "Admin",
    },
  });
  await prisma.user.upsert({
    where: { username: "maulida" },
    update: {},
    create: {
      username: "maulida",
      name: "Maulida",
      password: await bcrypt.hash("tambi2026", 10),
      division: "Divisi Produksi",
      role: "Operator",
    },
  });
  console.log("✅ Users seeded");

  // ── 2. Risk Events (E) ───────────────────────────────────
  const eventsData = [
    { code_e: "E1", description: "Gagal panen akibat cuaca ekstrem (hujan/kemarau panjang)", severity: 9, scor_phase: "Plan", year: 2026 },
    { code_e: "E2", description: "Keterlambatan pengiriman pupuk dan pestisida dari pemasok", severity: 7, scor_phase: "Source", year: 2026 },
    { code_e: "E3", description: "Kerusakan mesin pengolah teh di pabrik", severity: 8, scor_phase: "Make", year: 2026 },
    { code_e: "E4", description: "Penolakan produk oleh pembeli karena kualitas tidak standar SNI", severity: 8, scor_phase: "Make", year: 2026 },
    { code_e: "E5", description: "Keterlambatan pengiriman ke distributor/ekspor", severity: 6, scor_phase: "Deliver", year: 2026 },
    { code_e: "E6", description: "Keluhan dan retur produk dari pelanggan", severity: 5, scor_phase: "Return", year: 2026 },
    { code_e: "E7", description: "Kekurangan stok pucuk teh segar untuk produksi", severity: 8, scor_phase: "Source", year: 2026 },
    { code_e: "E8", description: "Fluktuasi harga jual teh kering di pasar global", severity: 6, scor_phase: "Deliver", year: 2026 },
  ];

  const createdEvents = [];
  for (const e of eventsData) {
    const ev = await prisma.riskEvent.upsert({
      where: { code_e: e.code_e },
      update: e,
      create: e,
    });
    createdEvents.push(ev);
  }
  console.log(`✅ ${createdEvents.length} Risk Events seeded`);

  // ── 3. Risk Agents (A) ──────────────────────────────────
  const agentsData = [
    { code_pa: "A1", description: "Curah hujan sangat tinggi (>300mm/bulan)", occurrence: 7, scor_phase: "Plan", code_pa_ref: "PA-01", year: 2026 },
    { code_pa: "A2", description: "Supplier tunggal untuk kebutuhan pupuk (single-source)", occurrence: 6, scor_phase: "Source", code_pa_ref: "PA-02", year: 2026 },
    { code_pa: "A3", description: "Usia mesin pengolah teh >15 tahun tanpa overhaul", occurrence: 5, scor_phase: "Make", code_pa_ref: "PA-03", year: 2026 },
    { code_pa: "A4", description: "Operator pengolahan teh belum tersertifikasi SNI", occurrence: 6, scor_phase: "Make", code_pa_ref: "PA-04", year: 2026 },
    { code_pa: "A5", description: "Tidak ada kontrak jangka panjang dengan distributor utama", occurrence: 5, scor_phase: "Deliver", code_pa_ref: "PA-05", year: 2026 },
    { code_pa: "A6", description: "Sistem QC masih manual tanpa otomasi", occurrence: 7, scor_phase: "Make", code_pa_ref: "PA-06", year: 2026 },
    { code_pa: "A7", description: "Kapasitas cold-storage pucuk segar terbatas", occurrence: 4, scor_phase: "Source", code_pa_ref: "PA-07", year: 2026 },
    { code_pa: "A8", description: "Tidak ada sistem traceability produk dari kebun ke konsumen", occurrence: 5, scor_phase: "Return", code_pa_ref: "PA-08", year: 2026 },
  ];

  const createdAgents = [];
  for (const a of agentsData) {
    const ag = await prisma.riskAgent.upsert({
      where: { code_pa: a.code_pa },
      update: a,
      create: a,
    });
    createdAgents.push(ag);
  }
  console.log(`✅ ${createdAgents.length} Risk Agents seeded`);

  // ── 4. Correlation Matrix HOR Fase 1 (Event x Agent) ─────
  const eMap = Object.fromEntries(createdEvents.map((e) => [e.code_e, e.id]));
  const aMap = Object.fromEntries(createdAgents.map((a) => [a.code_pa, a.id]));

  const correlationsData = [
    { e: "E1", a: "A1", r: 9 }, { e: "E1", a: "A3", r: 1 },
    { e: "E2", a: "A2", r: 9 }, { e: "E2", a: "A7", r: 3 },
    { e: "E3", a: "A3", r: 9 }, { e: "E3", a: "A4", r: 3 },
    { e: "E4", a: "A4", r: 9 }, { e: "E4", a: "A6", r: 9 }, { e: "E4", a: "A3", r: 3 },
    { e: "E5", a: "A5", r: 9 }, { e: "E5", a: "A6", r: 3 },
    { e: "E6", a: "A8", r: 9 }, { e: "E6", a: "A6", r: 9 }, { e: "E6", a: "A4", r: 3 },
    { e: "E7", a: "A1", r: 9 }, { e: "E7", a: "A7", r: 9 }, { e: "E7", a: "A2", r: 3 },
    { e: "E8", a: "A5", r: 9 }, { e: "E8", a: "A8", r: 3 },
  ];

  for (const c of correlationsData) {
    await prisma.correlation.upsert({
      where: { event_id_agent_id: { event_id: eMap[c.e], agent_id: aMap[c.a] } },
      update: { r_value: c.r },
      create: { event_id: eMap[c.e], agent_id: aMap[c.a], r_value: c.r },
    });
  }
  console.log(`✅ ${correlationsData.length} Correlations (HOR 1) seeded`);

  // ── 5. Hitung ARP dan rank (HOR Fase 1) ─────────────────
  const allAgents = await prisma.riskAgent.findMany({
    include: { correlations: { include: { event: true } } },
  });
  const arps = allAgents.map((ag) => ({
    id: ag.id,
    arp: ag.occurrence * ag.correlations.reduce((sum, c) => sum + c.event.severity * c.r_value, 0),
  }));
  arps.sort((a, b) => b.arp - a.arp);
  for (let i = 0; i < arps.length; i++) {
    await prisma.riskAgent.update({
      where: { id: arps[i].id },
      data: { arp_score: arps[i].arp, rank: i + 1 },
    });
  }
  console.log("✅ ARP scores & ranks (HOR 1) calculated");

  // ── 6. Preventive Actions PA (HOR Fase 2) ───────────────
  const actionsData = [
    { code_action: "PA1", description: "Implementasi sistem pemantauan cuaca real-time BMKG dan drainase adaptif", difficulty: 4, scor_phase: "Plan", year: 2026 },
    { code_action: "PA2", description: "Diversifikasi supplier pupuk & pestisida minimum 3 vendor terdaftar", difficulty: 3, scor_phase: "Source", year: 2026 },
    { code_action: "PA3", description: "Jadwal perawatan preventif mesin setiap 3 bulan sekali (overhaul rutin)", difficulty: 4, scor_phase: "Make", year: 2026 },
    { code_action: "PA4", description: "Program pelatihan & sertifikasi SNI untuk seluruh operator pabrik", difficulty: 3, scor_phase: "Make", year: 2026 },
    { code_action: "PA5", description: "Negosiasi kontrak distribusi jangka panjang minimum 1 tahun", difficulty: 3, scor_phase: "Deliver", year: 2026 },
    { code_action: "PA6", description: "Implementasi sistem QC digital dengan sensor kadar air otomatis", difficulty: 5, scor_phase: "Make", year: 2026 },
    { code_action: "PA7", description: "Investasi penambahan cold-storage kapasitas 20 ton pucuk segar", difficulty: 5, scor_phase: "Source", year: 2026 },
    { code_action: "PA8", description: "Implementasi sistem barcode/QR code traceability dari kebun ke konsumen", difficulty: 4, scor_phase: "Return", year: 2026 },
  ];

  const createdActions = [];
  for (const pa of actionsData) {
    const action = await prisma.preventiveAction.upsert({
      where: { code_action: pa.code_action },
      update: pa,
      create: pa,
    });
    createdActions.push(action);
  }
  console.log(`✅ ${createdActions.length} Preventive Actions seeded`);

  // ── 7. Action Correlation Matrix HOR Fase 2 (Agent x PA) ─
  const paMap = Object.fromEntries(createdActions.map((pa) => [pa.code_action, pa.id]));

  // Matriks: setiap agent berkorelasi dengan PA yang relevan
  const actionCorrelationsData = [
    { a: "A1", pa: "PA1", r: 9 }, { a: "A1", pa: "PA7", r: 3 },
    { a: "A2", pa: "PA2", r: 9 }, { a: "A2", pa: "PA5", r: 1 },
    { a: "A3", pa: "PA3", r: 9 }, { a: "A3", pa: "PA6", r: 3 },
    { a: "A4", pa: "PA4", r: 9 }, { a: "A4", pa: "PA6", r: 3 },
    { a: "A5", pa: "PA5", r: 9 }, { a: "A5", pa: "PA2", r: 1 },
    { a: "A6", pa: "PA6", r: 9 }, { a: "A6", pa: "PA4", r: 3 }, { a: "A6", pa: "PA3", r: 1 },
    { a: "A7", pa: "PA7", r: 9 }, { a: "A7", pa: "PA1", r: 3 },
    { a: "A8", pa: "PA8", r: 9 }, { a: "A8", pa: "PA6", r: 3 },
  ];

  for (const c of actionCorrelationsData) {
    await prisma.actionCorrelation.upsert({
      where: { agent_id_action_id: { agent_id: aMap[c.a], action_id: paMap[c.pa] } },
      update: { r_value: c.r },
      create: { agent_id: aMap[c.a], action_id: paMap[c.pa], r_value: c.r },
    });
  }
  console.log(`✅ ${actionCorrelationsData.length} Action Correlations (HOR 2) seeded`);

  // ── 8. Hitung TE dan ETD (HOR Fase 2) ───────────────────
  // TE_k = Σ(ARP_j × R_jk), ETD_k = TE_k / D_k
  const agentsWithArp = await prisma.riskAgent.findMany({ select: { id: true, arp_score: true } });
  const arpLookup = Object.fromEntries(agentsWithArp.map((ag) => [ag.id, ag.arp_score]));

  const allActions = await prisma.preventiveAction.findMany({
    include: { correlations: true },
  });

  const etdResults = allActions.map((action) => {
    const te = action.correlations.reduce((sum, c) => {
      return sum + (arpLookup[c.agent_id] || 0) * c.r_value;
    }, 0);
    const etd = action.difficulty > 0 ? te / action.difficulty : 0;
    return { id: action.id, te, etd };
  });

  etdResults.sort((a, b) => b.etd - a.etd);
  for (let i = 0; i < etdResults.length; i++) {
    await prisma.preventiveAction.update({
      where: { id: etdResults[i].id },
      data: { te_score: etdResults[i].te, etd_score: etdResults[i].etd, rank: i + 1 },
    });
  }
  console.log("✅ TE & ETD scores (HOR 2) calculated");

  // ── 9. Production Metrics 2026 ───────────────────────────
  const months2026 = [
    { month: "Januari", short_month: "Jan", year: 2026, rainfall_mm: 285, raw_tea_ton: 42.5, dry_tea_ton: 8.9 },
    { month: "Februari", short_month: "Feb", year: 2026, rainfall_mm: 312, raw_tea_ton: 38.2, dry_tea_ton: 8.0 },
    { month: "Maret", short_month: "Mar", year: 2026, rainfall_mm: 298, raw_tea_ton: 44.1, dry_tea_ton: 9.2 },
    { month: "April", short_month: "Apr", year: 2026, rainfall_mm: 275, raw_tea_ton: 46.8, dry_tea_ton: 9.8 },
    { month: "Mei", short_month: "Mei", year: 2026, rainfall_mm: 190, raw_tea_ton: 51.3, dry_tea_ton: 10.7 },
    { month: "Juni", short_month: "Jun", year: 2026, rainfall_mm: 145, raw_tea_ton: 55.7, dry_tea_ton: 11.6 },
    { month: "Juli", short_month: "Jul", year: 2026, rainfall_mm: 110, raw_tea_ton: 58.2, dry_tea_ton: 12.2 },
    { month: "Agustus", short_month: "Agu", year: 2026, rainfall_mm: 95, raw_tea_ton: 60.1, dry_tea_ton: 12.6 },
    { month: "September", short_month: "Sep", year: 2026, rainfall_mm: 130, raw_tea_ton: 54.8, dry_tea_ton: 11.5 },
    { month: "Oktober", short_month: "Okt", year: 2026, rainfall_mm: 210, raw_tea_ton: 48.3, dry_tea_ton: 10.1 },
    { month: "November", short_month: "Nov", year: 2026, rainfall_mm: 260, raw_tea_ton: 43.6, dry_tea_ton: 9.1 },
    { month: "Desember", short_month: "Des", year: 2026, rainfall_mm: 290, raw_tea_ton: 40.2, dry_tea_ton: 8.4 },
  ];
  for (const m of months2026) {
    await prisma.productionMetric.upsert({
      where: { month_year: { month: m.month, year: m.year } },
      update: m,
      create: m,
    });
  }
  console.log("✅ Production Metrics 2026 seeded");

  console.log("\n🎉 Seeding HOR Fase 1 + Fase 2 selesai!");
}

main()
  .catch((e) => { console.error("❌ Seed error:", e.message); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
