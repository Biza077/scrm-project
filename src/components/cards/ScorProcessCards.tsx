"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ScorPhase } from "@/data/dummyData";
import { useRiskData } from "@/contexts/RiskDataContext";
import { computePareto } from "@/lib/paretoUtils";

const SCOR_PHASES: Array<{ id: string; process: ScorPhase; code: string; color: string }> = [
  { id: "plan",    process: "Plan",    code: "P", color: "#0ea5e9" },
  { id: "source",  process: "Source",  code: "S", color: "#8b5cf6" },
  { id: "make",    process: "Make",    code: "M", color: "#f59e0b" },
  { id: "deliver", process: "Deliver", code: "D", color: "#22c55e" },
  { id: "return",  process: "Return",  code: "R", color: "#f43f5e" },
];

function DonutGauge({ percentage, color }: { percentage: number; color: string }) {
  const data = [{ value: percentage }, { value: 100 - percentage }];
  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={26} outerRadius={38}
            startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
            <Cell fill={color} />
            <Cell fill="#f1f5f9" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center flex-col leading-tight">
        <span className="text-base font-bold" style={{ color }}>{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

export default function ScorProcessCards() {
  const { agents } = useRiskData();

  const paretoAgents = computePareto(agents as Parameters<typeof computePareto>[0]);
  const totalArp = agents.reduce((s, a) => s + a.arp_score, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Risiko Prioritas per Proses SCOR</h2>
          <p className="text-xs text-gray-400 mt-0.5">Berdasarkan Analisis Pareto 80% ARP Kumulatif</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <span className="text-gray-500">Sumber Prioritas (≤80%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gray-300 inline-block" />
            <span className="text-gray-500">Non-Prioritas (&gt;80%)</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-0 divide-x divide-y divide-gray-100">
        {SCOR_PHASES.map((phase) => {
          const phasePareto = paretoAgents.filter((a) => a.scor_phase === phase.process);
          const priorityAgents = phasePareto.filter((a) => a.is_priority);
          const riskCount = phasePareto.length;
          const phaseArp = phasePareto.reduce((s, a) => s + a.arp_score, 0);
          const phaseArpPct = totalArp > 0 ? (phaseArp / totalArp) * 100 : 0;

          return (
            <div key={phase.id} className="p-5 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ backgroundColor: phase.color }}>
                  {phase.code}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{phase.process}</p>
                  <p className="text-xs text-gray-400">{riskCount} agen risiko</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <DonutGauge
                  percentage={riskCount === 0 ? 0 : Math.round(phaseArpPct)}
                  color={riskCount === 0 ? "#cbd5e1" : phase.color}
                />
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div>
                    <p className="text-[10px] text-gray-400">Kontribusi ARP</p>
                    <p className="text-sm font-bold" style={{ color: phase.color }}>
                      {phaseArp > 0 ? `${Number(phaseArpPct.toFixed(1))}%` : "0%"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Agen Prioritas</p>
                    <p className="text-sm font-bold text-red-600">
                      {priorityAgents.length}
                      <span className="text-xs font-normal text-gray-400"> / {riskCount}</span>
                    </p>
                  </div>
                </div>
              </div>

              {riskCount === 0 ? (
                <p className="text-[10px] text-gray-300 italic">Belum ada data</p>
              ) : priorityAgents.length === 0 ? (
                <p className="text-[10px] text-gray-300 italic">Tidak ada agen prioritas</p>
              ) : (
                <div className="space-y-1">
                  {priorityAgents.slice(0, 5).map((ag) => (
                    <div key={ag.id} className="flex items-center justify-between gap-1">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono"
                        style={{ backgroundColor: `${phase.color}18`, color: phase.color }}
                      >
                        {ag.code_pa}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {Number(ag.pct_arp.toFixed(1))}%
                      </span>
                    </div>
                  ))}
                  {priorityAgents.length > 5 && (
                    <p className="text-[9px] text-gray-300 italic">+{priorityAgents.length - 5} lainnya</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
