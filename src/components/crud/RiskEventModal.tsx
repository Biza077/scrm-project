"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { ScorPhase } from "@/data/dummyData";

const SCOR_PHASES: ScorPhase[] = ["Plan", "Source", "Make", "Deliver", "Return"];

type FormData = {
  code_e: string;
  description: string;
  severity: string;
  scor_phase: ScorPhase;
  year: string;
};

const INITIAL_FORM: FormData = {
  code_e: "",
  description: "",
  severity: "",
  scor_phase: "Plan",
  year: "2026",
};

interface RiskEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  editData?: { id: number; code_e: string; description: string; severity: number; scor_phase: ScorPhase; year: number } | null;
}

export default function RiskEventModal({ isOpen, onClose, onSubmit, editData }: RiskEventModalProps) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const isEdit = !!editData;

  useEffect(() => {
    if (editData) {
      setForm({
        code_e: editData.code_e,
        description: editData.description,
        severity: String(editData.severity),
        scor_phase: editData.scor_phase,
        year: String(editData.year),
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setErrors({});
  }, [editData, isOpen]);

  if (!isOpen) return null;

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((er) => ({ ...er, [field]: undefined }));
    };

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.code_e.trim()) e.code_e = "Kode E wajib diisi";
    if (!form.description.trim()) e.description = "Deskripsi wajib diisi";
    const s = Number(form.severity);
    if (!form.severity || isNaN(s) || s < 1 || s > 10) e.severity = "Nilai Severity 1–10";
    const y = Number(form.year);
    if (!form.year || isNaN(y) || y < 2000 || y > 2100) e.year = "Tahun tidak valid";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              {isEdit ? "Edit Risk Event" : "Tambah Risk Event Baru"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Kejadian risiko (E) dalam analisis HOR Fase 1</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Kode E + Tahun */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Kode Event</label>
              <input
                value={form.code_e}
                onChange={set("code_e")}
                disabled={isEdit}
                placeholder="E1, E2, ..."
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 ${errors.code_e ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.code_e && <p className="text-xs text-red-500 mt-1">{errors.code_e}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tahun Analisis</label>
              <input
                type="number"
                value={form.year}
                onChange={set("year")}
                min={2000}
                max={2100}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.year ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year}</p>}
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi Kejadian Risiko</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={3}
              placeholder="Jelaskan kejadian risiko yang mungkin terjadi..."
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Severity + SCOR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Severity (S) <span className="text-gray-400 font-normal">skala 1–10</span>
              </label>
              <input
                type="number"
                step="any"
                value={form.severity}
                onChange={set("severity")}
                min={1}
                max={10}
                placeholder="1–10"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.severity ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.severity && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.severity}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori SCOR</label>
              <select
                value={form.scor_phase}
                onChange={set("scor_phase")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SCOR_PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700">
            <strong>Catatan HOR:</strong> Severity (S) mengukur dampak jika kejadian ini terjadi. Nilai R (korelasi dengan agen penyebab) diatur di tab Matriks Korelasi.
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium">
              Batal
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <Save size={15} />
              {isEdit ? "Simpan Perubahan" : "Tambah Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
