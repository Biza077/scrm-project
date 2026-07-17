"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { riskAgents as initialData, RiskAgent } from "@/data/dummyData";
import { fetchWithAuth } from "@/lib/api";
import toast from "react-hot-toast";

interface RiskDataContextType {
  agents: RiskAgent[];
  addAgent: (agent: Omit<RiskAgent, "rank" | "arp">) => void;
  updateAgent: (kodeRA: string, data: Partial<Omit<RiskAgent, "rank" | "arp">>) => void;
  deleteAgent: (kodeRA: string) => void;
}

const RiskDataContext = createContext<RiskDataContextType | undefined>(undefined);

const STORAGE_KEY = "scrm_risk_agents";

function computeArp(s: number, o: number, d: number) {
  return s * o * d;
}

function rerank(agents: RiskAgent[]): RiskAgent[] {
  return [...agents]
    .sort((a, b) => b.arp - a.arp)
    .map((agent, i) => ({ ...agent, rank: i + 1 }));
}

export function RiskDataProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<RiskAgent[]>([]);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/api/risks");
      if (!res.ok) {
        if (res.status !== 401) console.error("Failed to fetch risk agents:", res.statusText);
        return;
      }
      const { data } = await res.json();
      
      const mapped: RiskAgent[] = data.map((d: any) => ({
        rank: d.rank,
        kodeRA: d.code_ra,
        deskripsi: d.description,
        severity: d.s_score,
        occurrence: d.o_score,
        detection: d.d_score,
        arp: d.arp_score,
        kategoriSCOR: d.scor_phase,
        preventiveAction: d.preventive_action,
        kodePR: d.code_pr,
      }));
      setAgents(mapped);
    } catch (err) {
      // Ignored to prevent Next.js dev overlay
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const addAgent = useCallback(async (agent: Omit<RiskAgent, "rank" | "arp">) => {
    try {
      const res = await fetchWithAuth("/api/risks", {
        method: "POST",
        body: JSON.stringify(agent),
      });
      if (res.ok) {
        toast.success("Berhasil menambahkan agen risiko baru!");
        fetchAgents();
      } else {
        const err = await res.json();
        toast.error(`Gagal menyimpan: ${err.error || 'Server error'}`);
      }
    } catch (err: any) {
      toast.error(`Error koneksi: ${err.message}`);
    }
  }, [fetchAgents]);

  const updateAgent = useCallback(
    async (kodeRA: string, data: Partial<Omit<RiskAgent, "rank" | "arp">>) => {
      try {
        const res = await fetchWithAuth(`/api/risks/${kodeRA}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        if (res.ok) {
          toast.success("Data berhasil diperbarui!");
          fetchAgents();
        } else {
          const err = await res.json();
          toast.error(`Gagal memperbarui: ${err.error || 'Server error'}`);
        }
      } catch (err: any) {
        toast.error(`Error koneksi: ${err.message}`);
      }
    },
    [fetchAgents]
  );

  const deleteAgent = useCallback(async (kodeRA: string) => {
    try {
      const res = await fetchWithAuth(`/api/risks/${kodeRA}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Agen risiko berhasil dihapus.");
        fetchAgents();
      } else {
        const err = await res.json();
        toast.error(`Gagal menghapus: ${err.error || 'Server error'}`);
      }
    } catch (err: any) {
      toast.error(`Error koneksi: ${err.message}`);
    }
  }, [fetchAgents]);

  return (
    <RiskDataContext.Provider value={{ agents, addAgent, updateAgent, deleteAgent }}>
      {children}
    </RiskDataContext.Provider>
  );
}

export function useRiskData(): RiskDataContextType {
  const ctx = useContext(RiskDataContext);
  if (!ctx) throw new Error("useRiskData must be used inside <RiskDataProvider>");
  return ctx;
}
