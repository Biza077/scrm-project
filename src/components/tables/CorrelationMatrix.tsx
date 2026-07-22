"use client";

import { useState } from "react";
import { Loader2, Info } from "lucide-react";
import { RiskEvent, RiskAgent } from "@/data/dummyData";
import toast from "react-hot-toast";

const R_VALUES = [0, 1, 3, 9] as const;
type RValue = (typeof R_VALUES)[number];

const R_LABELS: Record<RValue, { label: string; bg: string; text: string }> = {
  0: { label: "—",  bg: "bg-gray-100",   text: "text-gray-400" },
  1: { label: "1",  bg: "bg-blue-100",   text: "text-blue-700" },
  3: { label: "3",  bg: "bg-amber-100",  text: "text-amber-700" },
  9: { label: "9",  bg: "bg-red-100",    text: "text-red-700" },
};

interface CorrelationMatrixProps {
  events: RiskEvent[];
  agents: RiskAgent[];
  rMatrix: Record<string, number>;  // "event_id:agent_id" → r_value
  onSetR: (event_id: number, agent_id: number, r_value: number) => Promise<void>;
  isLoading?: boolean;
}

export default function CorrelationMatrix({
  events, agents, rMatrix, onSetR, isLoading = false
}: CorrelationMatrixProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const getR = (event_id: number, agent_id: number): RValue => {
    const val = rMatrix[`${event_id}:${agent_id}`] ?? 0;
    return (R_VALUES.includes(val as RValue) ? val : 0) as RValue;
  };

  const nextR = (current: RValue): RValue => {
    const idx = R_VALUES.indexOf(current);
    return R_VALUES[(idx + 1) % R_VALUES.length];
  };

  const handleClick = async (event_id: number, agent_id: number) => {
    const current = getR(event_id, agent_id);
    const next = nextR(current);
    const key = `${event_id}:${agent_id}`;
    setUpdating(key);
    try {
      await onSetR(event_id, agent_id, next);
    } catch {
      toast.error("Gagal memperbarui nilai korelasi.");
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 size={24} className="animate-spin mr-2" />
        <span className="text-sm">Memuat matriks korelasi...</span>
      </div>
    );
  }

  if (events.length === 0 || agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Info size={32} className="mb-2 text-gray-300" />
        <p className="text-sm font-medium">Belum ada data</p>
        <p className="text-xs mt-1">Tambahkan Risk Event dan Risk Agent terlebih dahulu</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-xs">
        <span className="text-gray-500 font-medium">Nilai R:</span>
        {R_VALUES.map((r) => (
          <div key={r} className="flex items-center gap-1.5">
            <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${R_LABELS[r].bg} ${R_LABELS[r].text}`}>
              {R_LABELS[r].label}
            </span>
            <span className="text-gray-500">
              {r === 0 ? "Tidak ada korelasi" : r === 1 ? "Lemah" : r === 3 ? "Sedang" : "Kuat"}
            </span>
          </div>
        ))}
        <span className="text-gray-400 italic">Klik sel untuk mengubah nilai R</span>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50">
              {/* Corner */}
              <th className="sticky left-0 z-10 bg-gray-50 border-b border-r border-gray-200 px-3 py-2.5 text-left min-w-[180px]">
                <div className="text-gray-500 font-medium">Event ↓ / Agent →</div>
              </th>
              {agents.map((ag) => (
                <th key={ag.id} className="border-b border-r border-gray-200 px-2 py-2 text-center min-w-[70px] last:border-r-0">
                  <div className="font-bold text-gray-700">{ag.code_pa}</div>
                  <div className="text-gray-400 font-normal text-[10px] mt-0.5">O={ag.occurrence}</div>
                </th>
              ))}
              <th className="border-b border-gray-200 px-2 py-2 text-center min-w-[80px] bg-amber-50">
                <div className="font-bold text-amber-700">Σ(S×R)</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev, evIdx) => {
              // Calculate Σ(S×R) per event (for row totals)
              const sumSR = agents.reduce((sum, ag) => {
                return sum + ev.severity * getR(ev.id, ag.id);
              }, 0);

              return (
                <tr key={ev.id} className={evIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  {/* Event label */}
                  <td className="sticky left-0 z-10 bg-inherit border-b border-r border-gray-200 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 flex-shrink-0">
                        {ev.code_e}
                      </span>
                      <span className="text-gray-600 leading-tight line-clamp-2">{ev.description}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5 pl-8">S={ev.severity}</div>
                  </td>
                  {/* R cells */}
                  {agents.map((ag) => {
                    const r = getR(ev.id, ag.id);
                    const key = `${ev.id}:${ag.id}`;
                    const isUpdating = updating === key;
                    return (
                      <td key={ag.id} className="border-b border-r border-gray-200 px-1 py-1 text-center last:border-r-0">
                        <button
                          onClick={() => handleClick(ev.id, ag.id)}
                          disabled={isUpdating}
                          title={`E${ev.code_e} × ${ag.code_pa}: Klik untuk ubah R`}
                          className={`w-10 h-8 rounded-md font-bold transition-all hover:scale-110 active:scale-95 disabled:opacity-50 ${R_LABELS[r].bg} ${R_LABELS[r].text} ${isUpdating ? "animate-pulse" : ""}`}
                        >
                          {isUpdating ? "..." : R_LABELS[r].label}
                        </button>
                      </td>
                    );
                  })}
                  {/* Row total */}
                  <td className="border-b border-gray-200 px-2 py-1 text-center bg-amber-50">
                    <span className="font-bold text-amber-700">{sumSR}</span>
                  </td>
                </tr>
              );
            })}
            {/* Footer: ARP row */}
            <tr className="bg-violet-50 font-semibold">
              <td className="sticky left-0 z-10 bg-violet-50 border-t-2 border-violet-200 px-3 py-2.5 text-violet-700 text-xs">
                ARP = O × Σ(S×R)
              </td>
              {agents.map((ag) => {
                const arp = ag.occurrence * events.reduce((sum, ev) => {
                  return sum + ev.severity * getR(ev.id, ag.id);
                }, 0);
                return (
                  <td key={ag.id} className="border-t-2 border-violet-200 px-2 py-2.5 text-center">
                    <span className={`font-bold text-sm ${arp >= 200 ? "text-red-600" : arp >= 100 ? "text-amber-600" : "text-emerald-600"}`}>
                      {arp}
                    </span>
                  </td>
                );
              })}
              <td className="border-t-2 border-violet-200 bg-violet-50" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
