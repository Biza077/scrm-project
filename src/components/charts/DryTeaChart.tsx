"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps,
} from "recharts";
import { Package } from "lucide-react";
import { useMetrics } from "@/hooks/useMetrics";

interface CustomTooltipProps extends TooltipProps<number, string> {}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
        <p className="text-sm font-bold text-violet-600">
          {payload[0].value?.toFixed(1)} ton
        </p>
      </div>
    );
  }
  return null;
};

export default function DryTeaChart() {
  const { data: metrics, isLoading } = useMetrics(2026);
  const dryTeaData = metrics.map((m) => ({
    shortMonth: m.short_month,
    value: m.dry_tea_ton,
  }));

  const total = dryTeaData.length > 0 ? dryTeaData.reduce((s, d) => s + d.value, 0) : 0;
  const avg = dryTeaData.length > 0 ? (total / dryTeaData.length).toFixed(1) : "0";
  const max = dryTeaData.length > 0 ? Math.max(...dryTeaData.map((d) => d.value)) : 0;
  const maxMonth = dryTeaData.length > 0 ? dryTeaData.find((d) => d.value === max)?.shortMonth : "-";
  const avgValue = parseFloat(avg);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
              <Package size={15} className="text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">Volume Teh Kering</h3>
              <p className="text-xs text-gray-400">Tahun 2026 (ton/bulan)</p>
            </div>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <p className="text-xs text-gray-400">Total Tahunan</p>
              <p className="text-sm font-bold text-violet-600">{total.toFixed(1)} ton</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Tertinggi</p>
              <p className="text-sm font-bold text-purple-600">
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
            <span className="text-violet-600 font-medium">Loading...</span>
          </div>
        ) : null}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dryTeaData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#faf5ff" }} />
            <ReferenceLine
              y={avgValue}
              stroke="#8b5cf6"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Avg: ${avg}t`,
                fill: "#8b5cf6",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
            <Bar
              dataKey="value"
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
