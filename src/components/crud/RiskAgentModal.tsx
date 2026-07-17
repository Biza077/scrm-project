"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { RiskAgent } from "@/data/dummyData";

type FormData = {
  kodeRA: string;
  deskripsi: string;
  severity: string;
  occurrence: string;
  detection: string;
  kategoriSCOR: RiskAgent["kategoriSCOR"];
  preventiveAction: string;
  kodePR: string;
};

const INITIAL_FORM: FormData = {
  kodeRA: "",
  deskripsi: "",
  severity: "",
  occurrence: "",
  detection: "",
  kategoriSCOR: "Plan",
  preventiveAction: "",
  kodePR: "",
};

interface RiskAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  editData?: RiskAgent | null;
}

export default function RiskAgentModal({
  isOpen,
  onClose,
  onSubmit,
  editData,
}: RiskAgentModalProps) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const isEdit = !!editData;

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setForm({
        kodeRA: editData.kodeRA,
        deskripsi: editData.deskripsi,
        severity: String(editData.severity),
        occurrence: String(editData.occurrence),
        detection: String(editData.detection),
        kategoriSCOR: editData.kategoriSCOR,
        preventiveAction: editData.preventiveAction,
        kodePR: editData.kodePR,
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setErrors({});
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.kodeRA.trim()) e.kodeRA = "Kode RA wajib diisi";
    if (!form.deskripsi.trim()) e.deskripsi = "Deskripsi wajib diisi";
    const s = Number(form.severity), o = Number(form.occurrence), d = Number(form.detection);
    if (!form.severity || isNaN(s) || s < 1 || s > 10) e.severity = "Nilai 1–10";
    if (!form.occurrence || isNaN(o) || o < 1 || o > 10) e.occurrence = "Nilai 1–10";
    if (!form.detection || isNaN(d) || d < 1 || d > 10) e.detection = "Nilai 1–10";
    if (!form.preventiveAction.trim()) e.preventiveAction = "Wajib diisi";
    if (!form.kodePR.trim()) e.kodePR = "Wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  // Preview ARP
  const s = Number(form.severity), o = Number(form.occurrence), d = Number(form.detection);
  const arpPreview = s > 0 && o > 0 && d > 0 ? s * o * d : null;

  const inputCls = (field: keyof FormData) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200"
    }`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 flex-shrink-0">
          <div>
            <h2 className="text-sm font-bold text-gray-800">
              {isEdit ? "Edit Agen Risiko" : "Tambah Agen Risiko Baru"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? `Kode: ${editData?.kodeRA}` : "Isi semua kolom yang diperlukan"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body — scrollable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-4">
            {/* Kode RA */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Kode RA <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.kodeRA}
                  onChange={set("kodeRA")}
                  className={inputCls("kodeRA")}
                  placeholder="Contoh: A3"
                  disabled={isEdit}
                />
                {errors.kodeRA && <p className="text-xs text-red-500 mt-1">{errors.kodeRA}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Kode PR <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.kodePR}
                  onChange={set("kodePR")}
                  className={inputCls("kodePR")}
                  placeholder="Contoh: PA3"
                />
                {errors.kodePR && <p className="text-xs text-red-500 mt-1">{errors.kodePR}</p>}
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Nama / Deskripsi Agen Risiko <span className="text-red-400">*</span>
              </label>
              <input
                value={form.deskripsi}
                onChange={set("deskripsi")}
                className={inputCls("deskripsi")}
                placeholder="Contoh: Tidak akurat dalam perencanaan material"
              />
              {errors.deskripsi && <p className="text-xs text-red-500 mt-1">{errors.deskripsi}</p>}
            </div>

            {/* Kategori SCOR */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Kategori SCOR <span className="text-red-400">*</span>
              </label>
              <select
                value={form.kategoriSCOR}
                onChange={set("kategoriSCOR")}
                className={inputCls("kategoriSCOR")}
              >
                <option value="Plan">Plan</option>
                <option value="Source">Source</option>
                <option value="Make">Make</option>
                <option value="Deliver">Deliver</option>
              </select>
            </div>

            {/* S, O, D inputs */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-600">
                  Nilai S · O · D <span className="text-red-400">*</span>
                  <span className="font-normal text-gray-400 ml-1">(masing-masing 1–10)</span>
                </label>
                {arpPreview !== null && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">ARP Preview:</span>
                    <span
                      className={`text-sm font-bold ${
                        arpPreview >= 200
                          ? "text-red-600"
                          : arpPreview >= 100
                          ? "text-amber-600"
                          : "text-green-600"
                      }`}
                    >
                      {arpPreview}
                    </span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Severity (S)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.severity}
                    onChange={set("severity")}
                    className={inputCls("severity")}
                    placeholder="1–10"
                  />
                  {errors.severity && <p className="text-xs text-red-500 mt-1">{errors.severity}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Occurrence (O)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.occurrence}
                    onChange={set("occurrence")}
                    className={inputCls("occurrence")}
                    placeholder="1–10"
                  />
                  {errors.occurrence && <p className="text-xs text-red-500 mt-1">{errors.occurrence}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Detection (D)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.detection}
                    onChange={set("detection")}
                    className={inputCls("detection")}
                    placeholder="1–10"
                  />
                  {errors.detection && <p className="text-xs text-red-500 mt-1">{errors.detection}</p>}
                </div>
              </div>
            </div>

            {/* Preventive Action */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Preventive Action <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.preventiveAction}
                onChange={set("preventiveAction")}
                rows={3}
                className={`${inputCls("preventiveAction")} resize-none`}
                placeholder="Deskripsikan tindakan pencegahan..."
              />
              {errors.preventiveAction && (
                <p className="text-xs text-red-500 mt-1">{errors.preventiveAction}</p>
              )}
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
              <AlertCircle size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-600">
                ARP (Aggregate Risk Potential) = S × O × D. Dihitung otomatis saat disimpan. Ranking akan diperbarui secara otomatis.
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm"
          >
            <Save size={14} />
            {isEdit ? "Simpan Perubahan" : "Tambah Agen Risiko"}
          </button>
        </div>
      </div>
    </div>
  );
}
