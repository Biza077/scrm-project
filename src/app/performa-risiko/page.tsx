import { ShieldAlert, Construction } from "lucide-react";
import { scorProcesses, getStatusColor } from "@/data/dummyData";
import ScorProcessCards from "@/components/cards/ScorProcessCards";

export default function PerformaRisikoPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ShieldAlert size={20} className="text-violet-600" />
            Performa Risiko
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Visualisasi proporsi tingkat bahaya risiko per kategori SCOR
          </p>
        </div>
      </div>

      {/* Reuse SCOR cards from main dashboard */}
      <ScorProcessCards />

      {/* Risk overview table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Construction size={16} className="text-amber-500" />
          <h3 className="text-sm font-bold text-gray-700">Detail Performa — Dalam Pengembangan</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {scorProcesses.map((proc) => (
            <div key={proc.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: proc.color }}
                >
                  {proc.code}
                </div>
                <span className="text-sm font-semibold text-gray-700">{proc.process}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Skor Kinerja</span>
                  <span className="font-bold" style={{ color: getStatusColor(proc.score) }}>
                    {proc.score}% — {proc.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Total Agen Risiko</span>
                  <span className="font-semibold text-gray-700">{proc.riskCount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Risiko Tinggi</span>
                  <span className="font-semibold text-red-500">{proc.highRisk}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
