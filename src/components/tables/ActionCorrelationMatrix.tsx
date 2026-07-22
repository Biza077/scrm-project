"use client";

import { Loader2 } from "lucide-react";
import { PreventiveAction } from "@/data/dummyData";

interface Agent {
  id: number;
  code_pa: string;
  description: string;
  arp_score: number;
}

interface ActionCorrelationMatrixProps {
  agents: Agent[];
  actions: PreventiveAction[];
  rMatrix: Record<string, number>;
  onSetR: (agent_id: number, action_id: number, r_value: number) => Promise<void>;
  isLoading?: boolean;
}

const R_VALUES = [0, 1, 3, 9];
const R_CYCLE: Record<number, number> = { 0: 1, 1: 3, 3: 9, 9: 0 };

const rStyle = (r: number) => {
  if (r === 9) return { cell: "bg-rose-600 text-white font-bold", label: "9" };
  if (r === 3) return { cell: "bg-amber-400 text-amber-900 font-semibold", label: "3" };
  if (r === 1) return { cell: "bg-sky-200 text-sky-800 font-medium", label: "1" };
  return { cell: "bg-gray-50 text-gray-300 hover:bg-gray-100", label: "" };
};

const difficultyLabel = (d: number) => {
  if (d === 3) return { text: "D=3 Rendah", color: "bg-green-100 text-green-700" };
  if (d === 4) return { text: "D=4 Sedang", color: "bg-amber-100 text-amber-700" };
  return { text: "D=5 Tinggi", color: "bg-red-100 text-red-700" };
};

export default function ActionCorrelationMatrix({
  agents, actions, rMatrix, onSetR, isLoading = false,
}: ActionCorrelationMatrixProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 size={24} className="animate-spin mr-2" />
        <span className="text-sm">Memuat matriks mitigasi...</span>
      </div>
    );
  }

  if (agents.length === 0 || actions.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        <p>Belum ada data Risk Agent atau Tindakan Pencegahan untuk tahun ini.</p>
        <p className="text-xs mt-1">Tambahkan data terlebih dahulu di tab Risk Agent dan Tindakan Pencegahan.</p>
      </div>
    );
  }

  const handleClick = async (agent_id: number, action_id: number, current: number) => {
    const next = R_CYCLE[current] ?? 0;
    await onSetR(agent_id, action_id, next);
  };

  return (
    <div className="overflow-x-auto">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <span className="text-xs text-gray-500 font-medium">Nilai R:</span>
        {R_VALUES.map((r) => {
          const s = rStyle(r);
          return (
            <div key={r} className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${s.cell}`}>
                {s.label || "0"}
              </div>
              <span className="text-xs text-gray-500">
                {r === 0 ? "Tidak ada" : r === 1 ? "Lemah" : r === 3 ? "Sedang" : "Kuat"}
              </span>
            </div>
          );
        })}
        <span className="text-xs text-gray-400 ml-2">Klik sel untuk mengubah nilai</span>
      </div>

      <table className="min-w-full border-separate border-spacing-0 text-xs">
        <thead>
          {/* Row 1: PA headers */}
          <tr>
            <th className="sticky left-0 z-10 bg-white px-3 py-2 text-left font-bold text-gray-700 border-b border-r border-gray-200 w-56 min-w-[14rem]">
              Risk Agent (A) / Tindakan (PA)
            </th>
            <th className="px-2 py-1 text-center text-gray-500 border-b border-gray-200 w-16">
              ARP
            </th>
            {actions.map((action) => {
              const diff = difficultyLabel(action.difficulty);
              return (
                <th key={action.id} className="px-1 py-2 border-b border-l border-gray-200 min-w-[4rem]">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-rose-700">{action.code_action}</span>
                    <span className={`text-[9px] px-1.5 rounded-full font-medium ${diff.color}`}>
                      {diff.text}
                    </span>
                  </div>
                </th>
              );
            })}
            <th className="px-2 py-2 text-center text-gray-500 border-b border-l border-gray-200 min-w-[3rem]">
              TE
            </th>
          </tr>
          {/* Row 2: PA short desc */}
          <tr>
            <th className="sticky left-0 z-10 bg-gray-50 px-3 py-1.5 text-left text-[10px] text-gray-400 border-b border-r border-gray-200">
              Kode Agent — Deskripsi
            </th>
            <th className="bg-gray-50 border-b border-gray-200" />
            {actions.map((action) => (
              <th key={action.id} className="bg-gray-50 px-1 py-1 border-b border-l border-gray-200 max-w-[5rem]">
                <p className="text-[9px] text-gray-400 leading-tight text-center line-clamp-2 font-normal">
                  {action.description}
                </p>
              </th>
            ))}
            <th className="bg-gray-50 border-b border-l border-gray-200" />
          </tr>
        </thead>

        <tbody>
          {agents.map((agent, rowIdx) => {
            // TE = sum of ARP_j * R_jk for this agent across all actions
            let agentTE = 0;
            return (
              <tr key={agent.id} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
                {/* Agent info */}
                <td className="sticky left-0 z-10 bg-inherit px-3 py-2 border-b border-r border-gray-200">
                  <div>
                    <span className="font-bold text-violet-700 mr-1">{agent.code_pa}</span>
                    <span className="text-gray-600 line-clamp-1">{agent.description}</span>
                  </div>
                </td>
                {/* ARP value */}
                <td className="px-2 py-2 text-center border-b border-gray-200">
                  <span className="text-[10px] font-semibold text-gray-600 font-mono">{agent.arp_score}</span>
                </td>
                {/* R value cells */}
                {actions.map((action) => {
                  const key = `${agent.id}:${action.id}`;
                  const r = rMatrix[key] ?? 0;
                  agentTE += agent.arp_score * r;
                  const s = rStyle(r);
                  return (
                    <td key={action.id} className="px-1 py-1.5 border-b border-l border-gray-200 text-center">
                      <button
                        onClick={() => handleClick(agent.id, action.id, r)}
                        className={`w-8 h-8 rounded-lg transition-all hover:scale-110 active:scale-95 ${s.cell}`}
                        title={`${agent.code_pa} × ${action.code_action} = ${r}`}
                      >
                        {s.label}
                      </button>
                    </td>
                  );
                })}
                {/* TE for this agent row */}
                <td className="px-2 py-2 text-center border-b border-l border-gray-200">
                  <span className="text-[10px] font-bold text-rose-600 font-mono">{agentTE}</span>
                </td>
              </tr>
            );
          })}

          {/* Footer: ETD row */}
          <tr className="bg-rose-50">
            <td className="sticky left-0 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 border-t-2 border-rose-200 border-r border-gray-200">
              ETD = TE / D
            </td>
            <td className="border-t-2 border-rose-200" />
            {actions.map((action) => {
              const te = agents.reduce((sum, agent) => {
                const r = rMatrix[`${agent.id}:${action.id}`] ?? 0;
                return sum + agent.arp_score * r;
              }, 0);
              const etd = action.difficulty > 0 ? (te / action.difficulty).toFixed(1) : "0";
              return (
                <td key={action.id} className="px-1 py-2 border-t-2 border-l border-rose-200 text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] text-gray-400">TE={te}</span>
                    <span className="text-xs font-bold text-rose-700 font-mono">{etd}</span>
                  </div>
                </td>
              );
            })}
            <td className="border-t-2 border-l border-rose-200" />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
