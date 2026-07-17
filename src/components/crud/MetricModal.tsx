import { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";

export interface MetricFormData {
  rainfall_mm: string;
  raw_tea_ton: string;
  dry_tea_ton: string;
}

interface MetricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MetricFormData) => void;
  initialData: MetricFormData;
  monthName: string;
}

export default function MetricModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  monthName,
}: MetricModalProps) {
  const [formData, setFormData] = useState<MetricFormData>(initialData);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Edit Metrik Produksi</h3>
            <p className="text-xs text-gray-500">Bulan: {monthName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Curah Hujan (mm)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.rainfall_mm}
              onChange={(e) => setFormData({ ...formData, rainfall_mm: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              placeholder="0.0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Volume Pucuk Dipetik (ton)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.raw_tea_ton}
              onChange={(e) => setFormData({ ...formData, raw_tea_ton: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              placeholder="0.0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Volume Teh Kering (ton)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.dry_tea_ton}
              onChange={(e) => setFormData({ ...formData, dry_tea_ton: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              placeholder="0.0"
              required
            />
          </div>
          
          <div className="flex items-start gap-2 bg-blue-50 text-blue-700 p-3 rounded-lg mt-2">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <p className="text-xs leading-relaxed">
              Perubahan angka metrik produksi di sini akan langsung berdampak pada 
              grafik di Dashboard Utama secara real-time.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => {
              onSubmit(formData);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm shadow-teal-500/20 transition-all active:scale-[0.98]"
          >
            <Save size={16} />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
