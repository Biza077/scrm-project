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

// --- 3. HOR TYPES ---
export type ScorPhase = "Plan" | "Source" | "Make" | "Deliver" | "Return";

/** Risk Event (E) — Kejadian risiko dengan nilai Severity */
export interface RiskEvent {
  id: number;
  code_e: string;
  description: string;
  severity: number;         // S: 1–10
  scor_phase: ScorPhase;
  year: number;
}

/** Risk Agent (PA) — Agen penyebab dengan nilai Occurrence */
export interface RiskAgent {
  id: number;
  rank: number;
  code_pa: string;
  description: string;
  occurrence: number;       // O: 1-10
  arp_score: number;        // Dihitung: O x S(S*R)
  scor_phase: ScorPhase;
  code_pa_ref: string;
  year: number;
}

/** HOR Result Agent — Agent dengan detail breakdown kalkulasi ARP */
export interface HorAgent extends RiskAgent {
  sumSR: number;
  breakdown: Array<{
    event_id: number;
    event_code: string;
    event_desc: string;
    severity: number;
    r_value: number;
    contribution: number;
  }>;
}

/** HOR Fase 2 — Tindakan Pencegahan dengan Degree of Difficulty */
export interface PreventiveAction {
  id: number;
  rank: number;
  code_action: string;      // e.g. "PA1", "PA2"
  description: string;
  difficulty: number;       // D: 3 (Rendah), 4 (Sedang), 5 (Tinggi)
  scor_phase: ScorPhase | null;
  te_score: number;         // TE = Sum(ARP_j * R_jk)
  etd_score: number;        // ETD = TE / D — hasil prioritas utama
  year: number;
}


// Data agen risiko sepenuhnya berasal dari database via API /api/agents
// Gunakan useRiskData() hook untuk mengakses data agen risiko


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
