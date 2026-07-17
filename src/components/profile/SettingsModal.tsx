"use client";

import { useState, useEffect } from "react";
import { X, User, Lock, Save, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync name when user changes
  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  if (!isOpen) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Nama tidak boleh kosong.";
    if (newPassword) {
      if (newPassword.length < 6) e.newPassword = "Password minimal 6 karakter.";
      if (newPassword !== confirmPassword) e.confirmPassword = "Password tidak cocok.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateProfile(name.trim(), newPassword || undefined);
    setSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    setErrors({});
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSaved(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Pengaturan Profil</h2>
            <p className="text-xs text-gray-400 mt-0.5">Ubah nama tampilan dan password</p>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Success state */}
          {saved && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 font-medium">Profil berhasil diperbarui!</p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors ${
                  errors.name ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
                placeholder="Nama lengkap Anda"
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
              <Lock size={11} /> Ubah Password (opsional)
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Password Baru
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors ${
                  errors.newPassword ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
                placeholder="Kosongkan jika tidak ingin diubah"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors ${
                  errors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
                placeholder="Ulangi password baru"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Save size={14} />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
