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
} from "recharts";
import { Sprout } from "lucide-react";
import { useMetrics } from "@/hooks/useMetrics";

interface CustomTooltipProps extends TooltipProps<number, string> {}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
        <p className="text-sm font-bold text-teal-600">
          {payload[0].value?.toFixed(1)} ton
        </p>
      </div>
    );
  }
  return null;
};

export default function LeafVolumeChart() {
  const { data: metrics, isLoading } = useMetrics(2026);
  const leafVolumeData = metrics.map((m) => ({
    shortMonth: m.short_month,
    value: m.raw_tea_ton,
  }));

  const total = leafVolumeData.length > 0 ? leafVolumeData.reduce((s, d) => s + d.value, 0) : 0;
  const avg = leafVolumeData.length > 0 ? (total / leafVolumeData.length).toFixed(1) : "0";
  const max = leafVolumeData.length > 0 ? Math.max(...leafVolumeData.map((d) => d.value)) : 0;
  const maxMonth = leafVolumeData.length > 0 ? leafVolumeData.find((d) => d.value === max)?.shortMonth : "-";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
              <Sprout size={15} className="text-teal-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Volume Pucuk Dipetik</h3>
              <p className="text-xs text-gray-400">Tahun 2026 (ton/bulan)</p>
            </div>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <p className="text-xs text-gray-400">Rata-rata</p>
              <p className="text-sm font-bold text-teal-600">{avg} ton</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Tertinggi</p>
              <p className="text-sm font-bold text-emerald-600">
                {max.toFixed(1)} ton{" "}
                <span className="text-xs font-normal text-gray-400">({maxMonth})</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5 pt-6 h-[280px] w-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <span className="text-teal-600 font-medium">Loading...</span>
          </div>
        ) : null}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={leafVolumeData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
              unit=" t"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f0fdfa" }} />
            <Bar
              dataKey="value"
              fill="#14b8a6"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
