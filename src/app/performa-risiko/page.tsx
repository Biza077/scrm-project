"use client";

import { useState, useEffect, useCallback } from "react";
import { ShieldAlert, TrendingDown, BarChart3, Loader2, Shield, Target } from "lucide-react";
import { useHorData } from "@/hooks/useHorData";
import { useRiskData } from "@/contexts/RiskDataContext";
import { ScorPhase } from "@/data/dummyData";
import { fetchWithAuth } from "@/lib/api";

const arpLevel = (arp: number) => {
  if (arp >= 200) return { label: "Tinggi",  bg: "bg-red-100",     text: "text-red-700",     bar: "#ef4444" };
  if (arp >= 100) return { label: "Sedang",  bg: "bg-amber-100",   text: "text-amber-700",   bar: "#f59e0b" };
  return               { label: "Rendah",  bg: "bg-emerald-100", text: "text-emerald-700", bar: "#22c55e" };
};

const diffLabel = (d: number) =>
  d === 3 ? { text: "Rendah",  cls: "bg-green-100 text-green-700" } :
  d === 4 ? { text: "Sedang",  cls: "bg-amber-100 text-amber-700" } :
            { text: "Tinggi",  cls: "bg-red-100 text-red-700" };

const SCOR_PHASES: ScorPhase[] = ["Plan", "Source", "Make", "Deliver", "Return"];

const phaseColors: Record<ScorPhase, string> = {
  Plan:    "#0ea5e9",
  Source:  "#8b5cf6",
  Make:    "#f59e0b",
  Deliver: "#22c55e",
  Return:  "#f43f5e",
};

interface Hor2Result {
  id: number; rank: number; code_action: string; description: string;
  difficulty: number; scor_phase: string | null;
  te_score: number; etd_score: number; year: number;
}

type ActiveSection = "hor1" | "hor2";

export default function PerformaRisikoPage() {
  const { selectedYear, setSelectedYear } = useRiskData();
  const { agents, isLoading } = useHorData(selectedYear);

  const [filterPhase, setFilterPhase] = useState<string>("All");
  const [section, setSection] = useState<ActiveSection>("hor1");

  // HOR 2 state
  const [hor2Data, setHor2Data]     = useState<Hor2Result[]>([]);
  const [hor2Loading, setHor2Loading] = useState(false);

  const fetchHor2 = useCallback(async () => {
    setHor2Loading(true);
    try {
      const res = await fetchWithAuth(`/api/hor2?year=${selectedYear}`);
      if (res.ok) {
        const { data } = await res.json();
        setHor2Data(data);
      }
    } catch {}
    finally { setHor2Loading(false); }
  }, [selectedYear]);

  useEffect(() => {
    if (section === "hor2") fetchHor2();
  }, [section, fetchHor2]);

  const filtered = filterPhase === "All"
    ? agents
    : agents.filter((a) => a.scor_phase === filterPhase);

  const maxArp = Math.max(1, ...agents.map((a) => a.arp_score));
  const maxEtd = Math.max(1, ...hor2Data.map((a) => a.etd_score));

  const highRisk = agents.filter((a) => a.arp_score >= 200).length;
  const medRisk  = agents.filter((a) => a.arp_score >= 100 && a.arp_score < 200).length;
  const lowRisk  = agents.filter((a) => a.arp_score < 100).length;

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShieldAlert size={20} className="text-violet-600" />
            Performa Risiko — House of Risk
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Analisis HOR Fase 1 (ARP) & Fase 2 (ETD Mitigasi)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">Tahun:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Section Switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setSection("hor1")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${section === "hor1" ? "bg-white text-violet-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <ShieldAlert size={14} /> HOR Fase 1 — Ranking ARP
        </button>
        <button
          onClick={() => setSection("hor2")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${section === "hor2" ? "bg-white text-rose-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Shield size={14} /> HOR Fase 2 — Prioritas Mitigasi (ETD)
        </button>
      </div>

      {/* ══ HOR FASE 1 ══════════════════════════════════════════ */}
      {section === "hor1" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <TrendingDown size={22} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{highRisk}</p>
                <p className="text-xs text-gray-500 font-medium">Risiko Tinggi (ARP &ge; 200)</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <BarChart3 size={22} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{medRisk}</p>
                <p className="text-xs text-gray-500 font-medium">Risiko Sedang (100–199)</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <ShieldAlert size={22} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{lowRisk}</p>
                <p className="text-xs text-gray-500 font-medium">Risiko Rendah (&lt; 100)</p>
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Filter SCOR:</span>
            <select
              value={filterPhase}
              onChange={(e) => setFilterPhase(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="All">Semua SCOR</option>
              {SCOR_PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* ARP Ranking Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Peringkat Agen Risiko — ARP ({selectedYear})</h3>
              <span className="text-xs text-gray-400">{filtered.length} agen</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Loader2 size={24} className="animate-spin mr-2" />
                <span className="text-sm">Menghitung ARP...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ShieldAlert size={36} className="mb-3 text-gray-200" />
                <p className="text-sm font-medium">Belum ada data agen risiko untuk tahun {selectedYear}</p>
                <p className="text-xs mt-1">Tambahkan data di halaman Input Data</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map((ag, i) => {
                  const level = arpLevel(ag.arp_score);
                  const barPct = Math.round((ag.arp_score / maxArp) * 100);
                  return (
                    <div key={ag.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${i === 0 ? "bg-red-100 text-red-700" : i === 1 ? "bg-orange-100 text-orange-700" : i === 2 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                          {ag.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-mono font-bold text-sm text-violet-700">{ag.code_pa}</span>
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: phaseColors[ag.scor_phase as ScorPhase] }} />
                            <span className="text-xs text-gray-500">{ag.scor_phase}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${level.bg} ${level.text}`}>{level.label}</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-snug mb-2">{ag.description}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${barPct}%`, backgroundColor: level.bar }} />
                            </div>
                            <span className={`text-sm font-bold flex-shrink-0 ${level.text}`}>ARP = {ag.arp_score}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">
                            O={ag.occurrence} × &Sigma;(S&times;R)={ag.sumSR} = {ag.arp_score}
                            {ag.code_pa_ref && <span className="ml-2 font-mono">· {ag.code_pa_ref}</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Formula Legend */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-xs text-gray-500">
            <p className="font-semibold text-gray-600 mb-1">📐 Rumus Kalkulasi HOR Fase 1</p>
            <p><strong>ARP<sub>j</sub></strong> = O<sub>j</sub> × &Sigma;(S<sub>i</sub> × R<sub>ij</sub>)</p>
            <p className="mt-1">di mana: <strong>O</strong> = Occurrence agen · <strong>S</strong> = Severity event · <strong>R</strong> = Korelasi (0, 1, 3, 9)</p>
          </div>
        </>
      )}

      {/* ══ HOR FASE 2 ══════════════════════════════════════════ */}
      {section === "hor2" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Target size={22} className="text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-600">{hor2Data.length}</p>
                <p className="text-xs text-gray-500 font-medium">Total Tindakan Pencegahan</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <Shield size={22} className="text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-600">{hor2Data[0]?.code_action || "—"}</p>
                <p className="text-xs text-gray-500 font-medium">Prioritas Mitigasi #1 (ETD Tertinggi)</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <BarChart3 size={22} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{hor2Data[0]?.etd_score?.toFixed(1) || "0"}</p>
                <p className="text-xs text-gray-500 font-medium">Nilai ETD Tertinggi</p>
              </div>
            </div>
          </div>

          {/* ETD Ranking Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Prioritas Tindakan Mitigasi — ETD ({selectedYear})</h3>
              <span className="text-xs text-gray-400">{hor2Data.length} tindakan</span>
            </div>

            {hor2Loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Loader2 size={24} className="animate-spin mr-2" />
                <span className="text-sm">Menghitung ETD...</span>
              </div>
            ) : hor2Data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Shield size={36} className="mb-3 text-gray-200" />
                <p className="text-sm font-medium">Belum ada data Tindakan Pencegahan untuk tahun {selectedYear}</p>
                <p className="text-xs mt-1">Tambahkan data di Input Data → Tindakan Pencegahan</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {hor2Data.map((pa, i) => {
                  const diff = diffLabel(pa.difficulty);
                  const barPct = Math.round((pa.etd_score / maxEtd) * 100);
                  return (
                    <div key={pa.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${i === 0 ? "bg-rose-100 text-rose-700" : i === 1 ? "bg-orange-100 text-orange-700" : i === 2 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                          {pa.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-mono font-bold text-sm text-rose-700">{pa.code_action}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${diff.cls}`}>D={pa.difficulty} {diff.text}</span>
                            {pa.scor_phase && (
                              <span className="text-xs text-gray-400 font-medium">{pa.scor_phase}</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 leading-snug mb-2">{pa.description}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-2 rounded-full bg-rose-400 transition-all duration-700" style={{ width: `${barPct}%` }} />
                            </div>
                            <span className="text-sm font-bold text-rose-600 flex-shrink-0">ETD = {pa.etd_score.toFixed(1)}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">
                            TE = {pa.te_score.toFixed(0)} / D = {pa.difficulty} = ETD {pa.etd_score.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Formula Legend */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-xs text-gray-500">
            <p className="font-semibold text-gray-600 mb-1">📐 Rumus Kalkulasi HOR Fase 2</p>
            <p><strong>TE<sub>k</sub></strong> = &Sigma;(ARP<sub>j</sub> × R<sub>jk</sub>) &nbsp;|&nbsp; <strong>ETD<sub>k</sub></strong> = TE<sub>k</sub> / D<sub>k</sub></p>
            <p className="mt-1">di mana: <strong>TE</strong> = Total Effectiveness · <strong>D</strong> = Degree of Difficulty (3/4/5) · <strong>R</strong> = Korelasi Agent × Aksi</p>
          </div>
        </>
      )}
    </div>
  );
}
