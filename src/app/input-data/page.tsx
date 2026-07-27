"use client";

import { useState } from "react";
import {
  Database, Plus, Pencil, Trash2, Search, AlertTriangle,
  ChevronLeft, ChevronRight, ArrowUpDown, GitBranch, Network,
  BookOpen, Shield,
} from "lucide-react";
import { useRiskData } from "@/contexts/RiskDataContext";
import { RiskAgent, RiskEvent, PreventiveAction, ScorPhase } from "@/data/dummyData";
import RiskAgentModal from "@/components/crud/RiskAgentModal";
import RiskEventModal from "@/components/crud/RiskEventModal";
import PreventiveActionModal from "@/components/crud/PreventiveActionModal";
import CorrelationMatrix from "@/components/tables/CorrelationMatrix";
import ActionCorrelationMatrix from "@/components/tables/ActionCorrelationMatrix";
import MetricTab from "@/components/crud/MetricTab";
import { useHorData } from "@/hooks/useHorData";
import { useHor2Data } from "@/hooks/useHor2Data";
import { fetchWithAuth } from "@/lib/api";
import toast from "react-hot-toast";

const SCOR_PHASES: ScorPhase[] = ["Plan", "Source", "Make", "Deliver", "Return"];

const phaseColors: Record<ScorPhase, string> = {
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

const diffLabel = (d: number) =>
  d === 3 ? { text: "Rendah", cls: "bg-green-100 text-green-700" } :
  d === 4 ? { text: "Sedang", cls: "bg-amber-100 text-amber-700" } :
            { text: "Tinggi", cls: "bg-red-100 text-red-700" };

const PAGE_SIZE = 8;
type MainTab = "agent" | "event" | "matrix" | "action" | "action-matrix" | "metric";

export default function InputDataPage() {
  const [activeTab, setActiveTab] = useState<MainTab>("agent");

  const {
    agents, events, selectedYear, setSelectedYear,
    addAgent, updateAgent, deleteAgent,
    addEvent, updateEvent, deleteEvent,
  } = useRiskData();

  const horData  = useHorData(selectedYear);
  const hor2Data = useHor2Data(selectedYear);

  // ── Agent state ──────────────────────────────────────────
  const [agentSearch, setAgentSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("All");
  const [agentPage, setAgentPage]     = useState(0);
  const [agentModal, setAgentModal]   = useState(false);
  const [editAgent, setEditAgent]     = useState<RiskAgent | null>(null);
  const [deleteAgent_, setDeleteAgent_] = useState<RiskAgent | null>(null);

  // ── Event state ──────────────────────────────────────────
  const [eventSearch, setEventSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("All");
  const [eventPage, setEventPage]     = useState(0);
  const [eventModal, setEventModal]   = useState(false);
  const [editEvent, setEditEvent]     = useState<RiskEvent | null>(null);
  const [deleteEvent_, setDeleteEvent_] = useState<RiskEvent | null>(null);

  // ── Action (PA) state ────────────────────────────────────
  const [actions, setActions] = useState<PreventiveAction[]>([]);
  const [actionsLoaded, setActionsLoaded] = useState(false);
  const [actionModal, setActionModal]     = useState(false);
  const [editAction, setEditAction]       = useState<PreventiveAction | null>(null);
  const [deleteAction_, setDeleteAction_] = useState<PreventiveAction | null>(null);
  const [actionSearch, setActionSearch]   = useState("");
  const [actionPage, setActionPage]       = useState(0);

  // Load actions when tab is activated
  const loadActions = async () => {
    try {
      const res = await fetchWithAuth(`/api/actions?year=${selectedYear}`);
      if (res.ok) {
        const { data } = await res.json();
        setActions(data);
        setActionsLoaded(true);
      }
    } catch {}
  };

  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
    if ((tab === "action" || tab === "action-matrix") && !actionsLoaded) {
      loadActions();
    }
  };

  // ── Filtered agents ──────────────────────────────────────
  const filteredAgents = agents.filter((a) => {
    const matchPhase = agentFilter === "All" || a.scor_phase === agentFilter;
    const q = agentSearch.toLowerCase();
    return matchPhase && (!q || a.code_pa.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  });
  const agentPages  = Math.ceil(filteredAgents.length / PAGE_SIZE);
  const pagedAgents = filteredAgents.slice(agentPage * PAGE_SIZE, (agentPage + 1) * PAGE_SIZE);

  // ── Filtered events ──────────────────────────────────────
  const filteredEvents = events.filter((e) => {
    const matchPhase = eventFilter === "All" || e.scor_phase === eventFilter;
    const q = eventSearch.toLowerCase();
    return matchPhase && (!q || e.code_e.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
  });
  const eventPages  = Math.ceil(filteredEvents.length / PAGE_SIZE);
  const pagedEvents = filteredEvents.slice(eventPage * PAGE_SIZE, (eventPage + 1) * PAGE_SIZE);

  // ── Filtered actions ─────────────────────────────────────
  const filteredActions = actions.filter((a) => {
    const q = actionSearch.toLowerCase();
    return !q || a.code_action.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
  });
  const actionPages  = Math.ceil(filteredActions.length / PAGE_SIZE);
  const pagedActions = filteredActions.slice(actionPage * PAGE_SIZE, (actionPage + 1) * PAGE_SIZE);

  // ── Agent handlers ────────────────────────────────────────
  const handleAgentSubmit = async (form: any) => {
    if (editAgent) {
      await updateAgent(editAgent.id, {
        description: form.description,
        occurrence: Number(form.occurrence),
        scor_phase: form.scor_phase,
        code_pa_ref: form.code_pa_ref,
        year: Number(form.year),
      });
    } else {
      await addAgent({
        code_pa: form.code_pa,
        description: form.description,
        occurrence: Number(form.occurrence),
        scor_phase: form.scor_phase,
        code_pa_ref: form.code_pa_ref,
        year: Number(form.year),
      });
    }
    await horData.refresh();
    setAgentModal(false);
    setEditAgent(null);
  };

  const handleAgentDelete = async () => {
    if (deleteAgent_) {
      await deleteAgent(deleteAgent_.id);
      await horData.refresh();
      await hor2Data.refresh();
      setDeleteAgent_(null);
    }
  };

  // ── Event handlers ────────────────────────────────────────
  const handleEventSubmit = async (form: any) => {
    if (editEvent) {
      await updateEvent(editEvent.id, {
        description: form.description,
        severity: Number(form.severity),
        scor_phase: form.scor_phase,
        year: Number(form.year),
      });
    } else {
      await addEvent({
        code_e: form.code_e,
        description: form.description,
        severity: Number(form.severity),
        scor_phase: form.scor_phase,
        year: Number(form.year),
      });
    }
    await horData.refresh();
    setEventModal(false);
    setEditEvent(null);
  };

  const handleEventDelete = async () => {
    if (deleteEvent_) {
      await deleteEvent(deleteEvent_.id);
      await horData.refresh();
      setDeleteEvent_(null);
    }
  };

  // ── Action (PA) handlers ──────────────────────────────────
  const handleActionSubmit = async (form: any) => {
    const method = editAction ? "PUT" : "POST";
    const url    = editAction ? `/api/actions/${editAction.id}` : "/api/actions";
    const res = await fetchWithAuth(url, {
      method,
      body: JSON.stringify({
        code_action: form.code_action,
        description: form.description,
        difficulty:  Number(form.difficulty),
        scor_phase:  form.scor_phase || null,
        year:        Number(form.year) || selectedYear,
      }),
    });
    if (res.ok) {
      toast.success(editAction ? "Tindakan Pencegahan diperbarui!" : "Tindakan Pencegahan ditambahkan!");
      await loadActions();
      await hor2Data.refresh();
    } else {
      const err = await res.json();
      toast.error(`Gagal: ${err.error || "Server error"}`);
    }
    setActionModal(false);
    setEditAction(null);
  };

  const handleActionDelete = async () => {
    if (!deleteAction_) return;
    const res = await fetchWithAuth(`/api/actions/${deleteAction_.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Tindakan Pencegahan dihapus.");
      await loadActions();
      await hor2Data.refresh();
    } else {
      toast.error("Gagal menghapus.");
    }
    setDeleteAction_(null);
  };

  const TABS = [
    { id: "agent"         as MainTab, label: "Risk Agent (A)",      icon: <Database size={14} /> },
    { id: "event"         as MainTab, label: "Risk Event (E)",       icon: <BookOpen size={14} /> },
    { id: "matrix"        as MainTab, label: "Matriks HOR 1",        icon: <Network size={14} /> },
    { id: "action"        as MainTab, label: "Tindakan Pencegahan",  icon: <Shield size={14} /> },
    { id: "action-matrix" as MainTab, label: "Matriks Mitigasi",     icon: <ArrowUpDown size={14} /> },
    { id: "metric"        as MainTab, label: "Metrik Produksi",      icon: <GitBranch size={14} /> },
  ];

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Database size={20} className="text-blue-600" />
            Input Data
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">Manajemen data HOR Fase 1 & 2 — House of Risk</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Tahun:</span>
          <select
            value={selectedYear}
            onChange={(e) => { setSelectedYear(Number(e.target.value)); setActionsLoaded(false); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Risk Agent ──────────────────────────────── */}
      {activeTab === "agent" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Risk Agent (A) — HOR Fase 1</h3>
              <p className="text-xs text-gray-400 mt-0.5">Agen penyebab risiko dengan nilai Occurrence (O)</p>
            </div>
            <button
              onClick={() => { setEditAgent(null); setAgentModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors"
            >
              <Plus size={14} /> Tambah Agent
            </button>
          </div>

          {/* Search + Filter */}
          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={agentSearch}
                onChange={(e) => { setAgentSearch(e.target.value); setAgentPage(0); }}
                placeholder="Cari kode atau deskripsi..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <select
              value={agentFilter}
              onChange={(e) => { setAgentFilter(e.target.value); setAgentPage(0); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="All">Semua SCOR</option>
              {SCOR_PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Kode</th>
                  <th className="px-4 py-3 text-left">Deskripsi Agen Penyebab</th>
                  <th className="px-4 py-3 text-center">O</th>
                  <th className="px-4 py-3 text-center">ARP</th>
                  <th className="px-4 py-3 text-center">Rank</th>
                  <th className="px-4 py-3 text-left">Fase SCOR</th>
                  <th className="px-4 py-3 text-center"><ArrowUpDown size={12} /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pagedAgents.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">Belum ada data Risk Agent.</td></tr>
                ) : pagedAgents.map((ag) => (
                  <tr key={ag.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-violet-700">{ag.code_pa}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs">
                      <p className="line-clamp-2">{ag.description}</p>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">{Number.isInteger(ag.occurrence) ? ag.occurrence : Number(ag.occurrence.toFixed(3))}</td>
                    <td className={`px-4 py-3 text-center text-sm font-mono ${arpColor(ag.arp_score)}`}>{Number.isInteger(ag.arp_score) ? ag.arp_score : Number(ag.arp_score.toFixed(3))}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold">#{ag.rank}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-1 rounded-full border font-medium ${phaseColors[ag.scor_phase as ScorPhase]}`}>
                        {ag.scor_phase}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setEditAgent(ag); setAgentModal(true); }} className="p-1.5 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition-colors" title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteAgent_(ag)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {agentPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>{filteredAgents.length} agen ditemukan</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setAgentPage(p => Math.max(0, p - 1))} disabled={agentPage === 0} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14} /></button>
                <span>{agentPage + 1} / {agentPages}</span>
                <button onClick={() => setAgentPage(p => Math.min(agentPages - 1, p + 1))} disabled={agentPage >= agentPages - 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Risk Event ──────────────────────────────── */}
      {activeTab === "event" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Risk Event (E) — HOR Fase 1</h3>
              <p className="text-xs text-gray-400 mt-0.5">Kejadian risiko dengan nilai Severity (S)</p>
            </div>
            <button
              onClick={() => { setEditEvent(null); setEventModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors"
            >
              <Plus size={14} /> Tambah Event
            </button>
          </div>

          <div className="px-5 py-3 border-b border-gray-50 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={eventSearch}
                onChange={(e) => { setEventSearch(e.target.value); setEventPage(0); }}
                placeholder="Cari kode atau deskripsi..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <select
              value={eventFilter}
              onChange={(e) => { setEventFilter(e.target.value); setEventPage(0); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="All">Semua SCOR</option>
              {SCOR_PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Kode</th>
                  <th className="px-4 py-3 text-left">Deskripsi Kejadian Risiko</th>
                  <th className="px-4 py-3 text-center">Severity (S)</th>
                  <th className="px-4 py-3 text-left">Fase SCOR</th>
                  <th className="px-4 py-3 text-center"><ArrowUpDown size={12} /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pagedEvents.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">Belum ada data Risk Event.</td></tr>
                ) : pagedEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-sky-700">{ev.code_e}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs"><p className="line-clamp-2">{ev.description}</p></td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold font-mono ${ev.severity >= 8 ? "text-red-600" : ev.severity >= 6 ? "text-amber-600" : "text-emerald-600"}`}>
                        {Number.isInteger(ev.severity) ? ev.severity : Number(ev.severity.toFixed(3))}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-1 rounded-full border font-medium ${phaseColors[ev.scor_phase as ScorPhase]}`}>
                        {ev.scor_phase}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => { setEditEvent(ev); setEventModal(true); }} className="p-1.5 rounded-lg hover:bg-sky-50 text-gray-400 hover:text-sky-600 transition-colors" title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteEvent_(ev)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {eventPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>{filteredEvents.length} event ditemukan</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setEventPage(p => Math.max(0, p - 1))} disabled={eventPage === 0} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14} /></button>
                <span>{eventPage + 1} / {eventPages}</span>
                <button onClick={() => setEventPage(p => Math.min(eventPages - 1, p + 1))} disabled={eventPage >= eventPages - 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Matriks Korelasi HOR 1 ──────────────────── */}
      {activeTab === "matrix" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-800">Matriks Korelasi HOR Fase 1 — {selectedYear}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Klik sel untuk mengatur nilai R (Korelasi Event × Agent). ARP dihitung ulang otomatis oleh server.</p>
          </div>
          <CorrelationMatrix
            events={horData.events}
            agents={horData.agents}
            rMatrix={horData.rMatrix}
            onSetR={horData.setRValue}
            isLoading={horData.isLoading}
          />
        </div>
      )}

      {/* ── Tab: Tindakan Pencegahan (PA) ────────────────── */}
      {activeTab === "action" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Tindakan Pencegahan (PA) — HOR Fase 2</h3>
              <p className="text-xs text-gray-400 mt-0.5">Daftar aksi mitigasi dengan Degree of Difficulty (D = 3, 4, 5)</p>
            </div>
            <button
              onClick={() => { setEditAction(null); setActionModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
            >
              <Plus size={14} /> Tambah PA
            </button>
          </div>

          <div className="px-5 py-3 border-b border-gray-50">
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={actionSearch}
                onChange={(e) => { setActionSearch(e.target.value); setActionPage(0); }}
                placeholder="Cari kode atau deskripsi PA..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Kode</th>
                  <th className="px-4 py-3 text-left">Deskripsi Tindakan Pencegahan</th>
                  <th className="px-4 py-3 text-center">D</th>
                  <th className="px-4 py-3 text-center">TE</th>
                  <th className="px-4 py-3 text-center">ETD</th>
                  <th className="px-4 py-3 text-center">Rank</th>
                  <th className="px-4 py-3 text-left">SCOR</th>
                  <th className="px-4 py-3 text-center"><ArrowUpDown size={12} /></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pagedActions.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">Belum ada Tindakan Pencegahan. Klik "Tambah PA" untuk memulai.</td></tr>
                ) : pagedActions.map((pa) => {
                  const diff = diffLabel(pa.difficulty);
                  return (
                    <tr key={pa.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-rose-700">{pa.code_action}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs"><p className="line-clamp-2">{pa.description}</p></td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${diff.cls}`}>D={pa.difficulty} {diff.text}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-sm text-gray-600">{Number.isInteger(pa.te_score) ? pa.te_score : Number(pa.te_score.toFixed(3))}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-rose-600">{Number.isInteger(pa.etd_score) ? pa.etd_score : Number(pa.etd_score.toFixed(3))}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-xs font-bold">#{pa.rank}</span>
                      </td>
                      <td className="px-4 py-3">
                        {pa.scor_phase && (
                          <span className={`text-[10px] px-2 py-1 rounded-full border font-medium ${phaseColors[pa.scor_phase as ScorPhase]}`}>
                            {pa.scor_phase}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => { setEditAction(pa); setActionModal(true); }} className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"><Pencil size={13} /></button>
                          <button onClick={() => setDeleteAction_(pa)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {actionPages > 1 && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>{filteredActions.length} aksi ditemukan</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setActionPage(p => Math.max(0, p - 1))} disabled={actionPage === 0} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14} /></button>
                <span>{actionPage + 1} / {actionPages}</span>
                <button onClick={() => setActionPage(p => Math.min(actionPages - 1, p + 1))} disabled={actionPage >= actionPages - 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Matriks Mitigasi (HOR 2) ─────────────────── */}
      {activeTab === "action-matrix" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-800">Matriks Mitigasi HOR Fase 2 — {selectedYear}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Klik sel untuk mengatur nilai R (korelasi Agent × Tindakan Pencegahan). ETD dihitung ulang otomatis.</p>
          </div>
          <ActionCorrelationMatrix
            agents={hor2Data.agents}
            actions={hor2Data.actions}
            rMatrix={hor2Data.rMatrix}
            onSetR={hor2Data.setRValue}
            isLoading={hor2Data.isLoading}
          />
        </div>
      )}

      {/* ── Tab: Metrik Produksi ─────────────────────────── */}
      {activeTab === "metric" && <MetricTab />}

      {/* ══ Modals ══════════════════════════════════════════ */}
      <RiskAgentModal
        isOpen={agentModal}
        onClose={() => { setAgentModal(false); setEditAgent(null); }}
        onSubmit={handleAgentSubmit}
        editData={editAgent}
      />

      <RiskEventModal
        isOpen={eventModal}
        onClose={() => { setEventModal(false); setEditEvent(null); }}
        onSubmit={handleEventSubmit}
        editData={editEvent}
      />

      <PreventiveActionModal
        isOpen={actionModal}
        onClose={() => { setActionModal(false); setEditAction(null); }}
        onSubmit={handleActionSubmit}
        editData={editAction}
      />

      {/* Delete Agent Confirm */}
      {deleteAgent_ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><AlertTriangle size={20} className="text-red-500" /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Hapus Risk Agent</h3>
                <p className="text-xs text-gray-400 mt-0.5">Aksi ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">Hapus <strong>{deleteAgent_.code_pa}</strong>? Semua data korelasi terkait akan ikut terhapus dan ARP akan dihitung ulang.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteAgent_(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 font-medium">Batal</button>
              <button onClick={handleAgentDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Event Confirm */}
      {deleteEvent_ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><AlertTriangle size={20} className="text-red-500" /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Hapus Risk Event</h3>
                <p className="text-xs text-gray-400 mt-0.5">Semua korelasi terkait juga akan terhapus</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">Hapus event <strong>{deleteEvent_.code_e}</strong>? ARP semua agen terkait akan dihitung ulang.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteEvent_(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 font-medium">Batal</button>
              <button onClick={handleEventDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Action Confirm */}
      {deleteAction_ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><AlertTriangle size={20} className="text-red-500" /></div>
              <div>
                <h3 className="text-sm font-bold text-gray-800">Hapus Tindakan Pencegahan</h3>
                <p className="text-xs text-gray-400 mt-0.5">Korelasi mitigasi terkait akan ikut terhapus</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">Hapus <strong>{deleteAction_.code_action}</strong>? ETD ranking akan dihitung ulang.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteAction_(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 font-medium">Batal</button>
              <button onClick={handleActionDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
