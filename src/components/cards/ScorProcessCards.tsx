"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { performanceThresholds, getStatusColor } from "@/data/dummyData";
import { useRiskData } from "@/contexts/RiskDataContext";
import type { RiskAgent } from "@/data/dummyData";

interface DonutChartProps {
  score: number;
  color: string;
}

function DonutGauge({ score, color }: DonutChartProps) {
  const scoreColor = getStatusColor(score);
  const data = [
    { value: score },
    { value: 100 - score },
  ];

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={42}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={scoreColor} />
            <Cell fill="#f1f5f9" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* Center score */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color: scoreColor }}>
          {score}
        </span>
      </div>
    </div>
  );
}

// Static phase config (domain constants, not from DB)
const SCOR_PHASES = [
  { id: "plan",    process: "Plan",    code: "P", color: "#0ea5e9",
    kpiLabels: ["Ketepatan Rencana Pasokan", "Keseimbangan Sumber Daya"] },
  { id: "source",  process: "Source",  code: "S", color: "#8b5cf6",
    kpiLabels: ["Penerimaan Order Tepat Waktu", "Order Sesuai Spesifikasi"] },
  { id: "make",    process: "Make",    code: "M", color: "#f59e0b",
    kpiLabels: ["Pencapaian Jadwal Produksi", "Tingkat Kesesuaian Kualitas"] },
  { id: "deliver", process: "Deliver", code: "D", color: "#22c55e",
    kpiLabels: ["Pengiriman Tepat Waktu", "Siklus Pemenuhan Order"] },
];

/** Convert average ARP to a 0-100 performance score. Lower ARP = higher score. */
function arpToScore(agents: RiskAgent[]): number {
  if (agents.length === 0) return 100;
  const avgArp = agents.reduce((sum, a) => sum + a.arp, 0) / agents.length;
  return Math.max(0, Math.round(100 - avgArp / 10));
}

function scoreToStatus(score: number): string {
  if (score < 40) return "Poor";
  if (score < 60) return "Marginal";
  if (score < 70) return "Average";
  if (score < 90) return "Good";
  return "Excellent";
}

/** Build metric bars from worst 2 agents in the phase */
function buildMetrics(phaseAgents: RiskAgent[], kpiLabels: string[]) {
  const sorted = [...phaseAgents].sort((a, b) => b.arp - a.arp);
  return kpiLabels.map((label, i) => {
    const agent = sorted[i];
    const value = agent ? Math.max(0, Math.round(100 - agent.arp / 10)) : 100;
    return { label, value };
  });
}

const statusBg: Record<string, string> = {
  Poor: "bg-red-100 text-red-700",
  Marginal: "bg-amber-100 text-amber-700",
  Average: "bg-yellow-100 text-yellow-700",
  Good: "bg-lime-100 text-lime-700",
  Excellent: "bg-green-100 text-green-700",
};


export default function ScorProcessCards() {
  const { agents } = useRiskData();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Risiko per Proses SCOR</h2>
          <p className="text-xs text-gray-400 mt-0.5">Plan · Source · Make · Deliver</p>
        </div>

        {/* Performance legend */}
        <div className="flex items-center gap-0 text-xs rounded-lg border border-gray-200 overflow-hidden">
          <span className="px-2 py-1 bg-gray-50 text-gray-500 font-medium border-r border-gray-200">
            Skor Monitoring
          </span>
          {performanceThresholds.map((t) => (
            <span
              key={t.label}
              className="px-2 py-1 border-r border-gray-200 last:border-0"
              style={{ color: t.color, fontWeight: 600 }}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>

      {/* SCOR Cards Grid — fully dynamic from DB agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-0 divide-x divide-y divide-gray-100">
        {SCOR_PHASES.map((phase) => {
          const phaseAgents = agents.filter((a) => a.kategoriSCOR === phase.process);
          const riskCount  = phaseAgents.length;
          const highRisk   = phaseAgents.filter((a) => a.arp >= 200).length;
          const score      = arpToScore(phaseAgents);
          const status     = scoreToStatus(score);
          const metrics    = buildMetrics(phaseAgents, phase.kpiLabels);

          return (
            <div key={phase.id} className="p-5 hover:bg-gray-50/50 transition-colors">
              {/* Process header */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: phase.color }}
                >
                  {phase.code}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{phase.process}</p>
                  <p className="text-xs text-gray-400">{riskCount} agen risiko</p>
                </div>
              </div>

              {/* Donut + Performance label */}
              <div className="flex items-center gap-4 mb-4">
                <DonutGauge score={score} color={phase.color} />
                <div className="flex flex-col gap-2">
                  <div>
                    <p className="text-xs text-gray-400">Performance</p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${statusBg[status]}`}
                    >
                      {status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Risiko Tinggi</p>
                    <p className="text-sm font-bold text-red-500">{highRisk}</p>
                  </div>
                </div>
              </div>

              {/* Per-agent risk health bars */}
              <div className="space-y-2">
                {riskCount === 0 ? (
                  <p className="text-xs text-gray-400 italic">Belum ada agen risiko</p>
                ) : (
                  metrics.map((m, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-500 truncate pr-2 leading-tight">{m.label}</span>
                        <span className="font-semibold text-gray-700 flex-shrink-0">
                          {m.value}%
                        </span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full">
                        <div
                          className="h-1 rounded-full transition-all duration-700"
                          style={{
                            width: `${m.value}%`,
                            backgroundColor: getStatusColor(m.value),
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

