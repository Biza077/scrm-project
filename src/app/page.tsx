import SummaryCards from "@/components/cards/SummaryCards";
import ScorProcessCards from "@/components/cards/ScorProcessCards";
import RainfallChart from "@/components/charts/RainfallChart";
import LeafVolumeChart from "@/components/charts/LeafVolumeChart";
import DryTeaChart from "@/components/charts/DryTeaChart";
import RiskAgentTable from "@/components/tables/RiskAgentTable";
import { BarChart2, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Page intro */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <BarChart2 size={20} className="text-teal-600" />
            Overview Risiko Rantai Pasok
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Data terintegrasi untuk seluruh proses SCOR — PT. XYZ
          </p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
          <RefreshCw size={13} />
          Perbarui Data
        </button>
      </div>

      {/* Section 1: Summary Cards */}
      <section aria-label="Ringkasan Risiko">
        <SummaryCards />
      </section>

      {/* Section 2: SCOR Process Cards */}
      <section aria-label="Risiko per Proses SCOR">
        <ScorProcessCards />
      </section>

      {/* Section 3: Charts Row — Curah Hujan + Pucuk Dipetik */}
      <section aria-label="Grafik Produksi & Cuaca" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RainfallChart />
        <LeafVolumeChart />
      </section>

      {/* Section 4: Dry Tea Chart (full width) */}
      <section aria-label="Volume Teh Kering">
        <DryTeaChart />
      </section>

      {/* Section 5: Risk Agent Ranking Table */}
      <section aria-label="Ranking Agen Risiko">
        <RiskAgentTable />
      </section>

      {/* Footer note */}
      <div className="pb-4 text-center text-xs text-gray-400">
        Data merupakan simulasi untuk keperluan monitoring internal PT. XYZ.
      </div>
    </div>
  );
}
