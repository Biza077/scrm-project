"use client";

import { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { ScorPhase } from "@/data/dummyData";

const SCOR_PHASES: ScorPhase[] = ["Plan", "Source", "Make", "Deliver", "Return"];
const DIFFICULTY_OPTIONS = [
  { value: 3, label: "3 — Rendah (Mudah diimplementasikan)" },
  { value: 4, label: "4 — Sedang (Butuh sumber daya signifikan)" },
  { value: 5, label: "5 — Tinggi (Sangat sulit / investasi besar)" },
];

type FormData = {
  code_action: string;
  description: string;
  difficulty: string;
  scor_phase: string;
  year: string;
};

const INITIAL_FORM: FormData = {
  code_action: "",
  description: "",
  difficulty: "3",
  scor_phase: "Plan",
  year: "2026",
};

interface PAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  editData?: {
    id: number; code_action: string; description: string;
    difficulty: number; scor_phase: string | null; year: number;
  } | null;
}

export default function PreventiveActionModal({ isOpen, onClose, onSubmit, editData }: PAModalProps) {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const isEdit = !!editData;

  useEffect(() => {
    if (editData) {
      setForm({
        code_action: editData.code_action,
        description: editData.description,
        difficulty: String(editData.difficulty),
        scor_phase: editData.scor_phase || "Plan",
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
    if (!form.code_action.trim()) e.code_action = "Kode PA wajib diisi";
    if (!form.description.trim()) e.description = "Deskripsi wajib diisi";
    const d = Number(form.difficulty);
    if (!form.difficulty || isNaN(d) || d < 3 || d > 5) e.difficulty = "Nilai D antara 3–5";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) onSubmit(form);
  };

  const difficultyValue = Number(form.difficulty);
  const diffColor =
    difficultyValue === 3 ? "text-green-700 bg-green-50 border-green-200" :
    difficultyValue === 4 ? "text-amber-700 bg-amber-50 border-amber-200" :
    "text-red-700 bg-red-50 border-red-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              {isEdit ? "Edit Tindakan Pencegahan" : "Tambah Tindakan Pencegahan Baru"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Preventive Action (PA) dalam analisis HOR Fase 2</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Kode + Tahun */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Kode Aksi (PA)</label>
              <input
                value={form.code_action}
                onChange={set("code_action")}
                disabled={isEdit}
                placeholder="PA1, PA2, ..."
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-50 ${errors.code_action ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.code_action && <p className="text-xs text-red-500 mt-1">{errors.code_action}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tahun Analisis</label>
              <input
                type="number"
                value={form.year}
                onChange={set("year")}
                min={2000}
                max={2100}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi Tindakan Pencegahan</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={3}
              placeholder="Jelaskan tindakan pencegahan secara spesifik..."
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none ${errors.description ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Difficulty + SCOR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Degree of Difficulty (D)
              </label>
              <input
                type="number"
                step="any"
                min={3}
                max={5}
                value={form.difficulty}
                onChange={set("difficulty")}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 ${errors.difficulty ? "border-red-400" : "border-gray-200"}`}
                placeholder="Skala 3-5 (Bisa desimal)"
              />
              {errors.difficulty && <p className="text-xs text-red-500 mt-1"><AlertCircle size={12} className="inline mr-1" />{errors.difficulty}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori SCOR</label>
              <select
                value={form.scor_phase}
                onChange={set("scor_phase")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {SCOR_PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Difficulty indicator */}
          <div className={`border rounded-lg px-4 py-2.5 text-xs font-medium ${diffColor}`}>
            Tingkat Kesulitan: D = {form.difficulty} &mdash;{" "}
            {difficultyValue === 3 ? "Rendah: Mudah diterapkan, biaya & waktu minimal." :
             difficultyValue === 4 ? "Sedang: Butuh koordinasi, anggaran, dan waktu signifikan." :
             "Tinggi: Kompleks, memerlukan investasi besar atau perubahan sistem."}
          </div>

          {/* Info */}
          <div className="bg-rose-50 border border-rose-100 rounded-lg px-4 py-3 text-xs text-rose-700">
            <strong>Catatan HOR 2:</strong> Nilai ETD = TE / D akan dihitung otomatis. Matriks korelasi (nilai R) diisi di tab <strong>Matriks Mitigasi</strong>.
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium">
              Batal
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <Save size={15} />
              {isEdit ? "Simpan Perubahan" : "Tambah Aksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
