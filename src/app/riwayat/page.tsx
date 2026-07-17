"use client";

import { useState, useEffect } from "react";
import { History, Activity } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

interface AuditLog {
  id: number;
  userName: string;
  division: string;
  action: string;
  createdAt: string;
}

export default function RiwayatPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetchWithAuth("/api/audit");
        if (!res.ok) throw new Error("Gagal mengambil log aktivitas");
        const json = await res.json();
        setLogs(json.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const getActionStyle = (action: string) => {
    const lower = action.toLowerCase();
    if (lower.includes("menambahkan")) return { color: "text-green-700", bg: "bg-green-100", label: "Tambah" };
    if (lower.includes("mengubah")) return { color: "text-blue-700", bg: "bg-blue-100", label: "Edit" };
    if (lower.includes("menghapus")) return { color: "text-red-700", bg: "bg-red-100", label: "Hapus" };
    return { color: "text-gray-600", bg: "bg-gray-100", label: "Sistem" };
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <History size={20} className="text-slate-600" />
            Riwayat & Aksi
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Log aktivitas dan tindakan pada sistem SCRM
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm relative min-h-[300px]">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800">Audit Trail (Timeline)</h3>
        </div>
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <span className="text-teal-600 font-medium">Loading log...</span>
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-red-500">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && logs.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <Activity size={32} className="mx-auto mb-3 opacity-20" />
            <p>Belum ada riwayat aktivitas yang tercatat.</p>
          </div>
        )}

        <div className="relative p-6">
          {/* Vertical timeline line */}
          <div className="absolute left-[47px] top-6 bottom-6 w-0.5 bg-gray-100"></div>

          <div className="space-y-6 relative">
            {logs.map((log) => {
              const style = getActionStyle(log.action);
              return (
                <div key={log.id} className="flex gap-5 relative z-10">
                  <div className="flex-shrink-0 w-12 pt-1">
                    <div className="text-right text-xs text-gray-400 font-medium leading-tight">
                      {formatDate(log.createdAt).split(" ")[0]} <br />
                      <span className="text-[10px]">{formatDate(log.createdAt).split(" ")[1].replace(".", ":")}</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ring-4 ring-white shadow-sm ${style.bg.replace('100', '400')}`}></div>
                  </div>

                  <div className="flex-1 bg-gray-50/50 rounded-xl p-4 border border-gray-100/60 hover:bg-white hover:shadow-sm hover:border-gray-200 transition-all">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.color}`}>
                        {style.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        Oleh <span className="font-semibold text-gray-700">{log.userName}</span> ({log.division})
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 font-medium">{log.action}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
