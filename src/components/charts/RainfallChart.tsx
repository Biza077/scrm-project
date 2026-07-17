"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Cell,
  ReferenceLine,
} from "recharts";
import { CloudRain } from "lucide-react";
import { useMetrics } from "@/hooks/useMetrics";

interface CustomTooltipProps extends TooltipProps<number, string> {}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
        <p className="text-sm font-bold text-sky-600">
          {payload[0].value} mm
        </p>
      </div>
    );
  }
  return null;
};

export default function RainfallChart() {
  const { data: metrics, isLoading } = useMetrics(2026);
  const rainfallData = metrics.map((m) => ({
    shortMonth: m.short_month,
    value: m.rainfall_mm,
  }));

  const total = rainfallData.length > 0 ? rainfallData.reduce((s, d) => s + d.value, 0) : 0;
  const avg = rainfallData.length > 0 ? Math.round(total / rainfallData.length) : 0;
  const max = rainfallData.length > 0 ? Math.max(...rainfallData.map((d) => d.value)) : 0;
  const maxMonth = rainfallData.length > 0 ? rainfallData.find((d) => d.value === max)?.shortMonth : "-";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-sky-100 rounded-lg flex items-center justify-center">
              <CloudRain size={15} className="text-sky-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">Curah Hujan Bulanan</h2>
              <p className="text-xs text-gray-400 mt-0.5">Tahun 2026 (mm)</p>
            </div>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <p className="text-xs text-gray-400">Rata-rata</p>
              <p className="text-sm font-bold text-sky-600">{avg} mm</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Tertinggi</p>
              <p className="text-sm font-bold text-indigo-600">{max} mm <span className="text-xs font-normal text-gray-400">({maxMonth})</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5 pt-6 h-[280px] w-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <span className="text-sky-600 font-medium">Loading...</span>
          </div>
        ) : null}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rainfallData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="shortMonth"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              unit=" mm"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f0f9ff" }} />
            <ReferenceLine
              y={300}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: "Batas Ekstrem (300mm)",
                fill: "#ef4444",
                fontSize: 10,
                position: "insideTopLeft",
              }}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            >
              {rainfallData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.value > 300 ? "#ef4444" : "#0ea5e9"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
