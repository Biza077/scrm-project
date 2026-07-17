"use client";

import { useState } from "react";
import { Pencil, Droplets, Leaf, Package } from "lucide-react";
import { useMetrics } from "@/hooks/useMetrics";
import MetricModal, { MetricFormData } from "./MetricModal";

export default function MetricTab() {
  const { data: metrics, isLoading, updateMetric } = useMetrics(2026);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);

  const handleEditClick = (metric: any) => {
    setEditTarget(metric);
    setModalOpen(true);
  };

  const handleModalSubmit = (form: MetricFormData) => {
    if (editTarget) {
      updateMetric(editTarget.id, {
        rainfall_mm: Number(form.rainfall_mm),
        raw_tea_ton: Number(form.raw_tea_ton),
        dry_tea_ton: Number(form.dry_tea_ton),
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Manajemen Metrik Produksi</h2>
          <p className="text-sm text-gray-500 mt-1">
            Data aktual curah hujan dan volume produksi bulanan (Tahun 2026)
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[400px] relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <span className="text-teal-600 font-medium">Memuat data metrik...</span>
          </div>
        )}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4 whitespace-nowrap">Bulan</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Curah Hujan (mm)</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Volume Pucuk (ton)</th>
              <th className="px-6 py-4 whitespace-nowrap text-right">Volume Teh Kering (ton)</th>
              <th className="px-6 py-4 whitespace-nowrap text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {metrics.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Data metrik tidak ditemukan
                </td>
              </tr>
            ) : (
              metrics.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-800">{m.month}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-sky-600 font-medium">
                      <Droplets size={14} className="opacity-70" />
                      {m.rainfall_mm}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-teal-600 font-medium">
                      <Leaf size={14} className="opacity-70" />
                      {m.raw_tea_ton.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-violet-600 font-medium">
                      <Package size={14} className="opacity-70" />
                      {m.dry_tea_ton.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleEditClick(m)}
                      className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors inline-flex"
                      title="Edit Data Bulan Ini"
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editTarget && (
        <MetricModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
          monthName={editTarget.month}
          initialData={{
            rainfall_mm: String(editTarget.rainfall_mm),
            raw_tea_ton: String(editTarget.raw_tea_ton),
            dry_tea_ton: String(editTarget.dry_tea_ton),
          }}
        />
      )}
    </div>
  );
}
