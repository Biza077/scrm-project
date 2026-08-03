"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  GitBranch,
  Database,
  History,
  LogOut,
  Leaf,
  Settings,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import SettingsModal from "@/components/profile/SettingsModal";

const navItems = [
  { id: "dashboard", label: "Dashboard Utama", icon: LayoutDashboard, href: "/" },
  { id: "performa-risiko", label: "Performa Risiko", icon: ShieldAlert, href: "/performa-risiko" },
  { id: "proses-scor", label: "Proses SCOR", icon: GitBranch, href: "/proses-scor" },
  { id: "input-data", label: "Input Data Aktual", icon: Database, href: "/input-data" },
  { id: "riwayat", label: "Riwayat & Aksi", icon: History, href: "/riwayat" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <aside className="fixed top-0 left-0 h-screen w-60 bg-[#1a2332] flex flex-col z-50 shadow-2xl">
        {/* Logo & Brand */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <Leaf size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">PT. XYZ</p>
              <p className="text-teal-400 font-semibold text-xs leading-tight">SCRM Dashboard</p>
            </div>
          </div>

          {/* Division badge */}
          <div className="mt-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-medium">
              {user?.division ?? "Divisi Produksi"}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`}
              >
                <Icon
                  size={17}
                  className={`flex-shrink-0 transition-colors ${isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer — User info + actions */}
        <div className="px-3 py-4 border-t border-white/10">
          {/* User info card */}
          <div className="flex items-center gap-2 px-3 py-2.5 mb-1 rounded-lg bg-white/5">
            <div className="w-7 h-7 rounded-full bg-teal-500/30 flex items-center justify-center flex-shrink-0">
              <UserCircle size={16} className="text-teal-300" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-200 text-xs font-semibold truncate">
                {/* {user?.name ?? "Loading..."} */}
              </p>
              <p className="text-slate-500 text-xs truncate">{user?.division ?? ""}</p>
            </div>
          </div>

          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all duration-200 group"
          >
            <Settings
              size={17}
              className="flex-shrink-0 text-slate-500 group-hover:text-slate-300 transition-colors"
            />
            Pengaturan
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
          >
            <LogOut
              size={17}
              className="flex-shrink-0 group-hover:text-red-400 transition-colors"
            />
            Keluar
          </button>
        </div>
      </aside>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
