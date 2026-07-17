"use client";

import { useState } from "react";
import { Database, Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, AlertTriangle, ArrowUpDown } from "lucide-react";
import { useRiskData } from "@/contexts/RiskDataContext";
import { RiskAgent } from "@/data/dummyData";
import RiskAgentModal from "@/components/crud/RiskAgentModal";
import MetricTab from "@/components/crud/MetricTab";

const categoryColors: Record<string, string> = {
  Plan: "bg-sky-100 text-sky-700 border-sky-200",
  Source: "bg-violet-100 text-violet-700 border-violet-200",
  Make: "bg-amber-100 text-amber-700 border-amber-200",
  Deliver: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const arpColor = (arp: number) => {
  if (arp >= 200) return "text-red-600 font-bold";
  if (arp >= 100) return "text-amber-600 font-semibold";
  return "text-emerald-600 font-medium";
};

const PAGE_SIZE = 8;

export default function InputDataPage() {
  const [activeTab, setActiveTab] = useState<"risk" | "metric">("risk");

  const { agents, addAgent, updateAgent, deleteAgent } = useRiskData();
  const [search, setSearch] = useState("");
  const [filterSCOR, setFilterSCOR] = useState("All");
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RiskAgent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RiskAgent | null>(null);

  const scors = ["All", "Plan", "Source", "Make", "Deliver"];

  // Filter & search
  const filtered = agents.filter((a) => {
    const matchSCOR = filterSCOR === "All" || a.kategoriSCOR === filterSCOR;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.kodeRA.toLowerCase().includes(q) ||
      a.deskripsi.toLowerCase().includes(q) ||
      a.preventiveAction.toLowerCase().includes(q);
    return matchSCOR && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleOpenAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (agent: RiskAgent) => {
    setEditTarget(agent);
    setModalOpen(true);
  };

  const handleModalSubmit = (form: {
    kodeRA: string;
    deskripsi: string;
    severity: string;
    occurrence: string;
    detection: string;
    kategoriSCOR: RiskAgent["kategoriSCOR"];
    preventiveAction: string;
    kodePR: string;
  }) => {
    const payload = {
      kodeRA: form.kodeRA,
      deskripsi: form.deskripsi,
      severity: Number(form.severity),
      occurrence: Number(form.occurrence),
      detection: Number(form.detection),
      kategoriSCOR: form.kategoriSCOR,
      preventiveAction: form.preventiveAction,
      kodePR: form.kodePR,
    };

    if (editTarget) {
      updateAgent(editTarget.kodeRA, payload);
    } else {
      addAgent(payload);
    }
    setModalOpen(false);
    setPage(0);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      deleteAgent(deleteTarget.kodeRA);
      setDeleteTarget(null);
    }
  };

  // Stats
  const highRisk = agents.filter((a) => a.arp >= 200).length;
  const medRisk = agents.filter((a) => a.arp >= 100 && a.arp < 200).length;
  const lowRisk = agents.filter((a) => a.arp < 100).length;

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header & Tabs */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-1">
          <Database size={20} className="text-teal-600" />
          Input Data Aktual
        </h2>
        <p className="text-sm text-gray-400 mb-5">
          Kelola data parameter pemantauan — Create, Read, Update, Delete
        </p>
        
        <div className="flex items-center gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("risk")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "risk"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Agen Risiko
          </button>
          <button
            onClick={() => setActiveTab("metric")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "metric"
                ? "border-teal-600 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Metrik Produksi
          </button>
        </div>
      </div>

      {activeTab === "risk" ? (
        <>
          <div className="space-y-5">
            {/* Quick stats and Actions */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="grid grid-cols-3 gap-4 flex-1">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Total Agen Risiko</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{agents.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Risiko Tinggi (ARP ≥ 200)</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{highRisk}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Risiko Sedang / Rendah</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {medRisk} <span className="text-gray-300 font-light">|</span>{" "}
                  <span className="text-emerald-600">{lowRisk}</span>
                </p>
              </div>
            </div>
            
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm shadow-teal-600/20"
            >
              <Plus size={16} />
              Tambah Agen Risiko
            </button>
          </div>



        {/* Table card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder="Cari kode RA, deskripsi, atau tindakan..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors"
              />
            </div>

            {/* SCOR filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {scors.map((s) => (
                <button
                  key={s}
                  onClick={() => { setFilterSCOR(s); setPage(0); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filterSCOR === s
                      ? "bg-[#1a3a5c] text-white border-[#1a3a5c]"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-8">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <div className="flex items-center gap-1">Kode RA</div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Agen Risiko</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">S</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">O</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">D</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <div className="flex items-center justify-center gap-1">ARP <ArrowUpDown size={10} /></div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">SCOR</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Preventive Action</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-sm text-gray-400">
                      Tidak ada data yang cocok.
                    </td>
                  </tr>
                ) : (
                  pageData.map((agent) => (
                    <tr key={agent.kodeRA} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400">{agent.rank}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-bold font-mono">
                          {agent.kodeRA}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-700 max-w-xs">{agent.deskripsi}</p>
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-medium text-gray-600">{agent.severity}</td>
                      <td className="px-4 py-3 text-center text-xs font-medium text-gray-600">{agent.occurrence}</td>
                      <td className="px-4 py-3 text-center text-xs font-medium text-gray-600">{agent.detection}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm ${arpColor(agent.arp)}`}>{agent.arp}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${categoryColors[agent.kategoriSCOR]}`}>
                          {agent.kategoriSCOR}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-600 max-w-xs leading-tight">{agent.preventiveAction}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(agent)}
                            title="Edit"
                            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(agent)}
                            title="Hapus"
                            className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Menampilkan {filtered.length === 0 ? 0 : page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, filtered.length)} dari {filtered.length} data
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} className="text-gray-600" />
              </button>
              <span className="text-xs text-gray-600 px-1">
                {totalPages === 0 ? "0/0" : `${page + 1}/${totalPages}`}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(Math.max(0, totalPages - 1), p + 1))}
                disabled={page >= totalPages - 1}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <RiskAgentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        editData={editTarget}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Konfirmasi Hapus</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                Apakah Anda yakin ingin menghapus agen risiko{" "}
                <span className="font-bold text-gray-800">{deleteTarget.kodeRA}</span>?
                <br />
                <span className="text-xs text-gray-400 mt-1 block">{deleteTarget.deskripsi}</span>
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      ) : (
        <MetricTab />
      )}
    </div>
  );
}
