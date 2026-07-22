"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ScorPhase } from "@/data/dummyData";
import { useRiskData } from "@/contexts/RiskDataContext";

// Static phase config (domain constants, not from DB)
const SCOR_PHASES: Array<{ id: string; process: ScorPhase; code: string; color: string }> = [
  { id: "plan",    process: "Plan",    code: "P", color: "#0ea5e9" },
  { id: "source",  process: "Source",  code: "S", color: "#8b5cf6" },
  { id: "make",    process: "Make",    code: "M", color: "#f59e0b" },
  { id: "deliver", process: "Deliver", code: "D", color: "#22c55e" },
  { id: "return",  process: "Return",  code: "R", color: "#f43f5e" },
];

/** Valid HOR Logic: Percentage of High Risk agents */
function getRiskPercentage(highRisk: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((highRisk / total) * 100);
}

function getRiskStatus(pct: number): { label: string; bg: string; text: string; color: string } {
  if (pct >= 50) return { label: "Sangat Kritis", bg: "bg-red-100", text: "text-red-700", color: "#ef4444" };
  if (pct > 0)   return { label: "Waspada",       bg: "bg-amber-100", text: "text-amber-700", color: "#f59e0b" };
  return { label: "Aman", bg: "bg-emerald-100", text: "text-emerald-700", color: "#10b981" };
}

const legendItems = [
  { label: "Sangat Kritis", color: "#ef4444" },
  { label: "Waspada", color: "#f59e0b" },
  { label: "Aman", color: "#10b981" },
];

function DonutGauge({ percentage, color }: { percentage: number, color: string }) {
  const data = [{ value: percentage }, { value: 100 - percentage }];
  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={30} outerRadius={42}
            startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
            <Cell fill={color} />
            <Cell fill="#f1f5f9" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center flex-col leading-tight">
        <span className="text-lg font-bold" style={{ color: color }}>{percentage}%</span>
      </div>
    </div>
  );
}

export default function ScorProcessCards() {
  const { agents } = useRiskData();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Risiko per Proses SCOR</h2>
          <p className="text-xs text-gray-400 mt-0.5">Plan · Source · Make · Deliver · Return</p>
        </div>
        <div className="flex items-center gap-0 text-xs rounded-lg border border-gray-200 overflow-hidden">
          <span className="px-2 py-1 bg-gray-50 text-gray-500 font-medium border-r border-gray-200">Indikator</span>
          {legendItems.map((t) => (
            <span key={t.label} className="px-2 py-1 border-r border-gray-200 last:border-0" style={{ color: t.color, fontWeight: 600 }}>
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* SCOR Cards — 5 phases now */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-0 divide-x divide-y divide-gray-100">
        {SCOR_PHASES.map((phase) => {
          const phaseAgents = agents.filter((a) => a.scor_phase === phase.process);
          const riskCount = phaseAgents.length;
          const highRisk  = phaseAgents.filter((a) => a.arp_score >= 200).length;
          
          const riskPercentage = getRiskPercentage(highRisk, riskCount);
          const status = getRiskStatus(riskPercentage);

          return (
            <div key={phase.id} className="p-5 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ backgroundColor: phase.color }}>
                  {phase.code}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{phase.process}</p>
                  <p className="text-xs text-gray-400">{riskCount} total agen</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <DonutGauge percentage={riskPercentage} color={riskCount === 0 ? "#cbd5e1" : status.color} />
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="text-xs text-gray-400">Tingkat Kritis</p>
                    {riskCount === 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-500">
                        Kosong
                      </span>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Risiko Tinggi (ARP&ge;200)</p>
                    <p className="text-sm font-bold text-gray-700">
                      {highRisk} <span className="text-xs font-normal text-gray-400">dari {riskCount}</span>
                    </p>
                  </div>
                </div>
              </div>


            </div>
          );
        })}
      </div>
    </div>
  );
}
