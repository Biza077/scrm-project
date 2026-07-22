"use client";

import { useState } from "react";
import { TrendingDown, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { useRiskData } from "@/contexts/RiskDataContext";
import { ScorPhase } from "@/data/dummyData";

const categoryColors: Record<string, string> = {
  Plan:    "bg-sky-100 text-sky-700 border-sky-200",
  Source:  "bg-violet-100 text-violet-700 border-violet-200",
  Make:    "bg-amber-100 text-amber-700 border-amber-200",
  Deliver: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Return:  "bg-rose-100 text-rose-700 border-rose-200",
};

const arpColor = (arp: number) => {
  if (arp >= 200) return "text-red-600 font-bold";
  if (arp >= 100) return "text-amber-600 font-semibold";
  return "text-emerald-600 font-medium";
};

const arpBg = (arp: number) => {
  if (arp >= 200) return "bg-red-50/40";
  if (arp >= 100) return "bg-amber-50/40";
  return "";
};

const PAGE_SIZE = 8;

export default function RiskAgentTable() {
  const { agents } = useRiskData();
  const [page, setPage] = useState(0);
  const [filterSCOR, setFilterSCOR] = useState<string>("All");

  const scors: Array<"All" | ScorPhase> = ["All", "Plan", "Source", "Make", "Deliver", "Return"];

  const filtered =
    filterSCOR === "All"
      ? agents
      : agents.filter((r) => r.scor_phase === filterSCOR);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
            <TrendingDown size={15} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Peringkat Agen Risiko</h3>
            <p className="text-xs text-gray-400">Terurut berdasarkan ARP tertinggi</p>
          </div>
        </div>
        {/* Filter SCOR */}
        <div className="flex items-center gap-1 flex-wrap">
          {scors.map((s) => (
            <button
              key={s}
              onClick={() => { setFilterSCOR(s); setPage(0); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterSCOR === s
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Kode PA</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Deskripsi Agen</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">O</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <span className="flex items-center justify-center gap-1">ARP <ArrowUpDown size={10} /></span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">SCOR</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Preventive Action</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Kode PA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-xs text-gray-400">
                  Belum ada data agen risiko
                </td>
              </tr>
            ) : pageData.map((agent) => (
              <tr
                key={agent.id}
                className={`hover:bg-gray-50/70 transition-colors ${arpBg(agent.arp_score)}`}
              >
                <td className="px-4 py-3 text-xs text-gray-400 font-medium">{agent.rank}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-violet-100 text-violet-700 text-xs font-bold font-mono">
                    {agent.code_pa}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-gray-700 max-w-xs leading-snug">{agent.description}</p>
                </td>
                <td className="px-4 py-3 text-center text-xs font-medium text-gray-600">{agent.occurrence}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm ${arpColor(agent.arp_score)}`}>{agent.arp_score}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${categoryColors[agent.scor_phase]}`}>
                    {agent.scor_phase}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-gray-400">{agent.code_pa_ref || "—"}</p>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold font-mono">
                    {agent.code_pa_ref || "—"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {filtered.length === 0 ? "0 agen" : `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, filtered.length)} dari ${filtered.length} agen risiko`}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} className="text-gray-600" />
          </button>
          <span className="text-xs text-gray-600 px-1">{Math.max(1, page + 1)} / {Math.max(1, totalPages)}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
