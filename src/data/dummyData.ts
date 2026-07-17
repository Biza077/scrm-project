// ============================================================
// SCRM Dashboard — Dummy Data
// Konteks: Perkebunan & Manufaktur Teh (Tea Plantation & Manufacturing)
// ============================================================

// --- 1. SUMMARY CARDS ---
export interface SummaryCard {
  id: string;
  label: string;
  value: number;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const summaryCards: SummaryCard[] = [
  {
    id: "total",
    label: "Total Risiko",
    value: 47,
    description: "Keseluruhan agen risiko teridentifikasi",
    color: "#0ea5e9",
    bgColor: "#e0f2fe",
    icon: "shield",
  },
  {
    id: "high",
    label: "Risiko Tinggi",
    value: 12,
    description: "ARP ≥ 200 — Perlu tindakan segera",
    color: "#ef4444",
    bgColor: "#fee2e2",
    icon: "alert-triangle",
  },
  {
    id: "medium",
    label: "Risiko Sedang",
    value: 21,
    description: "ARP 100–199 — Perlu pemantauan rutin",
    color: "#f59e0b",
    bgColor: "#fef3c7",
    icon: "alert-circle",
  },
  {
    id: "low",
    label: "Risiko Rendah",
    value: 14,
    description: "ARP < 100 — Dalam batas toleransi",
    color: "#22c55e",
    bgColor: "#dcfce7",
    icon: "check-circle",
  },
];

// --- 2. SCOR PROCESS RISK ---
export interface ScorProcess {
  id: string;
  process: string;
  code: string;
  score: number;
  status: "Poor" | "Marginal" | "Average" | "Good" | "Excellent";
  riskCount: number;
  highRisk: number;
  color: string;
  metrics: { label: string; value: number; unit: string }[];
}

export const scorProcesses: ScorProcess[] = [
  {
    id: "plan",
    process: "Plan",
    code: "P",
    score: 64,
    status: "Average",
    riskCount: 15,
    highRisk: 4,
    color: "#0ea5e9",
    metrics: [
      { label: "Establish Sourcing Plans Cycle Time", value: 64, unit: "%" },
      { label: "Balance Production Resources", value: 79, unit: "%" },
    ],
  },
  {
    id: "source",
    process: "Source",
    code: "S",
    score: 63,
    status: "Average",
    riskCount: 11,
    highRisk: 3,
    color: "#8b5cf6",
    metrics: [
      { label: "Orders Received On-Time to Demand", value: 63, unit: "%" },
      { label: "Orders Received With Correct Packaging", value: 68, unit: "%" },
    ],
  },
  {
    id: "make",
    process: "Make",
    code: "M",
    score: 71,
    status: "Good",
    riskCount: 13,
    highRisk: 3,
    color: "#f59e0b",
    metrics: [
      { label: "Production Schedule Achievement", value: 71, unit: "%" },
      { label: "Quality Conformance Rate", value: 76, unit: "%" },
    ],
  },
  {
    id: "deliver",
    process: "Deliver",
    code: "D",
    score: 58,
    status: "Marginal",
    riskCount: 8,
    highRisk: 2,
    color: "#22c55e",
    metrics: [
      { label: "On-Time Delivery to Customer", value: 58, unit: "%" },
      { label: "Order Fulfillment Cycle Time", value: 62, unit: "%" },
    ],
  },
];

// Performance score → status mapping
export const performanceThresholds = [
  { max: 40, label: "Poor", color: "#ef4444" },
  { max: 59, label: "Marginal", color: "#f59e0b" },
  { max: 69, label: "Average", color: "#eab308" },
  { max: 89, label: "Good", color: "#84cc16" },
  { max: 100, label: "Excellent", color: "#22c55e" },
];

export function getStatusColor(score: number): string {
  if (score < 40) return "#ef4444";
  if (score < 60) return "#f59e0b";
  if (score < 70) return "#eab308";
  if (score < 90) return "#84cc16";
  return "#22c55e";
}

// --- 3. RISK AGENT RANKING (ARP) ---
export interface RiskAgent {
  rank: number;
  kodeRA: string;
  deskripsi: string;
  severity: number;
  occurrence: number;
  detection: number;
  arp: number;
  kategoriSCOR: "Plan" | "Source" | "Make" | "Deliver";
  preventiveAction: string;
  kodePR: string;
}

export const riskAgents: RiskAgent[] = [
  {
    rank: 1,
    kodeRA: "A3",
    deskripsi: "Tidak akurat dalam perencanaan material",
    severity: 8,
    occurrence: 7,
    detection: 5,
    arp: 280,
    kategoriSCOR: "Plan",
    preventiveAction: "Membuat proses pengadaan lebih fleksibel",
    kodePR: "PA3",
  },
  {
    rank: 2,
    kodeRA: "A5",
    deskripsi: "Maksimum inventory kurang efektif",
    severity: 7,
    occurrence: 8,
    detection: 4,
    arp: 224,
    kategoriSCOR: "Plan",
    preventiveAction: "Mengintegrasikan seluruh bagian dalam perencanaan rantai pasok",
    kodePR: "PA1",
  },
  {
    rank: 3,
    kodeRA: "B2",
    deskripsi: "Keterlambatan pengiriman bahan baku dari pemasok",
    severity: 8,
    occurrence: 6,
    detection: 4,
    arp: 192,
    kategoriSCOR: "Source",
    preventiveAction: "Kolaborasi dengan pemasok dalam meningkatkan proses rantai pasok",
    kodePR: "PA2",
  },
  {
    rank: 4,
    kodeRA: "A1",
    deskripsi: "Tidak akurat dalam perencanaan material",
    severity: 7,
    occurrence: 6,
    detection: 4,
    arp: 168,
    kategoriSCOR: "Plan",
    preventiveAction: "Kolaborasi dengan pemasok dalam meningkatkan proses rantai pasok",
    kodePR: "PA2",
  },
  {
    rank: 5,
    kodeRA: "C1",
    deskripsi: "Gangguan mesin pengolahan teh selama produksi",
    severity: 9,
    occurrence: 4,
    detection: 4,
    arp: 144,
    kategoriSCOR: "Make",
    preventiveAction: "Preventive maintenance terjadwal dan pengecekan berkala",
    kodePR: "PA5",
  },
  {
    rank: 6,
    kodeRA: "A7",
    deskripsi: "Pembuatan batch produksi yang tidak sesuai",
    severity: 6,
    occurrence: 6,
    detection: 4,
    arp: 144,
    kategoriSCOR: "Plan",
    preventiveAction: "Membuat proses pengadaan lebih fleksibel",
    kodePR: "PA15",
  },
  {
    rank: 7,
    kodeRA: "B4",
    deskripsi: "Pihak pemasok kurang terlibat dalam pengiriman bahan baku",
    severity: 7,
    occurrence: 5,
    detection: 4,
    arp: 140,
    kategoriSCOR: "Source",
    preventiveAction: "Kolaborasi dengan pemasok dalam meningkatkan proses rantai pasok",
    kodePR: "PA2",
  },
  {
    rank: 8,
    kodeRA: "D1",
    deskripsi: "Keterlambatan pengiriman produk ke pelanggan",
    severity: 7,
    occurrence: 5,
    detection: 4,
    arp: 140,
    kategoriSCOR: "Deliver",
    preventiveAction: "Optimalisasi rute distribusi dan kemitraan logistik",
    kodePR: "PA8",
  },
  {
    rank: 9,
    kodeRA: "A2",
    deskripsi: "Tidak akurat dalam perencanaan material",
    severity: 6,
    occurrence: 6,
    detection: 3,
    arp: 108,
    kategoriSCOR: "Plan",
    preventiveAction: "Mengintegrasikan perencanaan dengan permintaan pelanggan",
    kodePR: "PA4",
  },
  {
    rank: 10,
    kodeRA: "C3",
    deskripsi: "Ketidaksesuaian standar kualitas teh kering",
    severity: 8,
    occurrence: 4,
    detection: 3,
    arp: 96,
    kategoriSCOR: "Make",
    preventiveAction: "Implementasi SOP quality control yang ketat",
    kodePR: "PA6",
  },
  {
    rank: 11,
    kodeRA: "A4",
    deskripsi: "Ketidakpastian permintaan",
    severity: 5,
    occurrence: 5,
    detection: 3,
    arp: 75,
    kategoriSCOR: "Plan",
    preventiveAction: "Kolaborasi dengan pemasok dalam meningkatkan proses rantai pasok",
    kodePR: "PA2",
  },
  {
    rank: 12,
    kodeRA: "D3",
    deskripsi: "Kerusakan kemasan produk saat distribusi",
    severity: 5,
    occurrence: 4,
    detection: 3,
    arp: 60,
    kategoriSCOR: "Deliver",
    preventiveAction: "Standarisasi prosedur pengemasan dan penanganan produk",
    kodePR: "PA9",
  },
];

// --- 4. CURAH HUJAN BULANAN (mm) ---
export interface MonthlyData {
  month: string;
  shortMonth: string;
  value: number;
}

export const rainfallData: MonthlyData[] = [
  { month: "Januari", shortMonth: "Jan", value: 312 },
  { month: "Februari", shortMonth: "Feb", value: 287 },
  { month: "Maret", shortMonth: "Mar", value: 265 },
  { month: "April", shortMonth: "Apr", value: 198 },
  { month: "Mei", shortMonth: "Mei", value: 143 },
  { month: "Juni", shortMonth: "Jun", value: 87 },
  { month: "Juli", shortMonth: "Jul", value: 64 },
  { month: "Agustus", shortMonth: "Ags", value: 72 },
  { month: "September", shortMonth: "Sep", value: 118 },
  { month: "Oktober", shortMonth: "Okt", value: 224 },
  { month: "November", shortMonth: "Nov", value: 298 },
  { month: "Desember", shortMonth: "Des", value: 341 },
];

// --- 5. VOLUME PUCUK DIPETIK (ton/bulan) ---
export const leafVolumeData: MonthlyData[] = [
  { month: "Januari", shortMonth: "Jan", value: 420.5 },
  { month: "Februari", shortMonth: "Feb", value: 398.2 },
  { month: "Maret", shortMonth: "Mar", value: 445.8 },
  { month: "April", shortMonth: "Apr", value: 478.3 },
  { month: "Mei", shortMonth: "Mei", value: 512.6 },
  { month: "Juni", shortMonth: "Jun", value: 489.4 },
  { month: "Juli", shortMonth: "Jul", value: 463.1 },
  { month: "Agustus", shortMonth: "Ags", value: 441.7 },
  { month: "September", shortMonth: "Sep", value: 418.9 },
  { month: "Oktober", shortMonth: "Okt", value: 395.2 },
  { month: "November", shortMonth: "Nov", value: 372.8 },
  { month: "Desember", shortMonth: "Des", value: 401.3 },
];

// --- 6. VOLUME TEH KERING (ton/bulan) ---
export const dryTeaData: MonthlyData[] = [
  { month: "Januari", shortMonth: "Jan", value: 88.3 },
  { month: "Februari", shortMonth: "Feb", value: 83.6 },
  { month: "Maret", shortMonth: "Mar", value: 93.6 },
  { month: "April", shortMonth: "Apr", value: 100.4 },
  { month: "Mei", shortMonth: "Mei", value: 107.6 },
  { month: "Juni", shortMonth: "Jun", value: 102.8 },
  { month: "Juli", shortMonth: "Jul", value: 97.3 },
  { month: "Agustus", shortMonth: "Ags", value: 92.8 },
  { month: "September", shortMonth: "Sep", value: 88.0 },
  { month: "Oktober", shortMonth: "Okt", value: 83.0 },
  { month: "November", shortMonth: "Nov", value: 78.3 },
  { month: "Desember", shortMonth: "Des", value: 84.3 },
];

// Conversion ratio pucuk → teh kering (approx 4.75:1)
export const conversionRatio = 4.75;

// Sidebar navigation items
export const navItems = [
  { id: "dashboard", label: "Dashboard Utama", icon: "layout-dashboard", href: "/" },
  { id: "risk", label: "Performa Risiko", icon: "shield-alert", href: "/risk" },
  { id: "scor", label: "Proses SCOR", icon: "git-branch", href: "/scor" },
  { id: "data", label: "Input Data Aktual", icon: "database", href: "/data" },
  { id: "history", label: "Riwayat & Aksi", icon: "history", href: "/history" },
];
