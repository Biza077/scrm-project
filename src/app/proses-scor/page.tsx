import { GitBranch } from "lucide-react";
import RainfallChart from "@/components/charts/RainfallChart";
import LeafVolumeChart from "@/components/charts/LeafVolumeChart";
import DryTeaChart from "@/components/charts/DryTeaChart";

const scortPhases = [
  {
    code: "P",
    name: "Plan",
    color: "#0ea5e9",
    desc: "Perencanaan kebutuhan sumber daya, penjadwalan panen, dan sinkronisasi pasokan dengan permintaan.",
  },
  {
    code: "S",
    name: "Source",
    color: "#8b5cf6",
    desc: "Pengadaan bahan baku (pucuk teh segar) dari kebun dan pemasok pupuk/pestisida.",
  },
  {
    code: "M",
    name: "Make",
    color: "#f59e0b",
    desc: "Proses pengolahan pucuk teh menjadi teh kering siap jual di pabrik.",
  },
  {
    code: "D",
    name: "Deliver",
    color: "#22c55e",
    desc: "Pengiriman produk teh kering ke distributor, eksportir, dan pelanggan akhir.",
  },
  {
    code: "R",
    name: "Return",
    color: "#f43f5e",
    desc: "Penanganan retur produk dari pelanggan, klaim garansi, dan resolusi ketidaksesuaian kualitas.",
  },
];

export default function ProsesSCorPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <div>
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <GitBranch size={20} className="text-amber-600" />
          Proses SCOR
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Alur Supply Chain Operations Reference (Plan, Source, Make, Deliver, Return) — Konteks Perkebunan Teh
        </p>
      </div>

      {/* SCOR flow cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {scortPhases.map((phase, i) => (
          <div key={phase.code} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                style={{ backgroundColor: phase.color }}
              >
                {phase.code}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{phase.name}</p>
                <p className="text-xs text-gray-400">Fase {i + 1}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">{phase.desc}</p>

          </div>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RainfallChart />
        <LeafVolumeChart />
      </div>
      <DryTeaChart />
    </div>
  );
}
