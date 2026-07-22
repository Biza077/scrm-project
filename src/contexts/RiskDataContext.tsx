"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { RiskAgent, RiskEvent } from "@/data/dummyData";
import { fetchWithAuth } from "@/lib/api";
import toast from "react-hot-toast";

interface RiskDataContextType {
  agents: RiskAgent[];
  events: RiskEvent[];
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  refreshAgents: () => void;
  refreshEvents: () => void;
  // Legacy helpers for ScorProcessCards compatibility
  addAgent: (data: Omit<RiskAgent, "id" | "rank" | "arp_score">) => Promise<void>;
  updateAgent: (id: number, data: Partial<Omit<RiskAgent, "id" | "rank" | "arp_score">>) => Promise<void>;
  deleteAgent: (id: number) => Promise<void>;
  addEvent: (data: Omit<RiskEvent, "id">) => Promise<void>;
  updateEvent: (id: number, data: Partial<Omit<RiskEvent, "id">>) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
}

const RiskDataContext = createContext<RiskDataContextType | undefined>(undefined);

export function RiskDataProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<RiskAgent[]>([]);
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`/api/agents?year=${selectedYear}`);
      if (!res.ok) {
        if (res.status !== 401) console.error("Failed to fetch agents:", res.statusText);
        return;
      }
      const { data } = await res.json();
      setAgents(data as RiskAgent[]);
    } catch {
      // Suppressed to avoid Next.js dev overlay noise
    }
  }, [selectedYear]);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`/api/events?year=${selectedYear}`);
      if (!res.ok) {
        if (res.status !== 401) console.error("Failed to fetch events:", res.statusText);
        return;
      }
      const { data } = await res.json();
      setEvents(data as RiskEvent[]);
    } catch {
      // Suppressed
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchAgents();
    fetchEvents();
  }, [fetchAgents, fetchEvents]);

  // ── Agent CRUD ───────────────────────────────────────────
  const addAgent = useCallback(async (data: Omit<RiskAgent, "id" | "rank" | "arp_score">) => {
    const res = await fetchWithAuth("/api/agents", {
      method: "POST",
      body: JSON.stringify({ ...data, year: selectedYear }),
    });
    if (res.ok) {
      toast.success("Risk Agent berhasil ditambahkan!");
      fetchAgents();
    } else {
      const err = await res.json();
      toast.error(`Gagal menyimpan: ${err.error || "Server error"}`);
    }
  }, [fetchAgents, selectedYear]);

  const updateAgent = useCallback(async (id: number, data: Partial<Omit<RiskAgent, "id" | "rank" | "arp_score">>) => {
    const res = await fetchWithAuth(`/api/agents/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Risk Agent berhasil diperbarui!");
      fetchAgents();
    } else {
      const err = await res.json();
      toast.error(`Gagal memperbarui: ${err.error || "Server error"}`);
    }
  }, [fetchAgents]);

  const deleteAgent = useCallback(async (id: number) => {
    const res = await fetchWithAuth(`/api/agents/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Risk Agent berhasil dihapus.");
      fetchAgents();
    } else {
      const err = await res.json();
      toast.error(`Gagal menghapus: ${err.error || "Server error"}`);
    }
  }, [fetchAgents]);

  // ── Event CRUD ───────────────────────────────────────────
  const addEvent = useCallback(async (data: Omit<RiskEvent, "id">) => {
    const res = await fetchWithAuth("/api/events", {
      method: "POST",
      body: JSON.stringify({ ...data, year: selectedYear }),
    });
    if (res.ok) {
      toast.success("Risk Event berhasil ditambahkan!");
      fetchEvents();
      fetchAgents(); // ARP may change if events are added
    } else {
      const err = await res.json();
      toast.error(`Gagal menyimpan: ${err.error || "Server error"}`);
    }
  }, [fetchEvents, fetchAgents, selectedYear]);

  const updateEvent = useCallback(async (id: number, data: Partial<Omit<RiskEvent, "id">>) => {
    const res = await fetchWithAuth(`/api/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Risk Event berhasil diperbarui!");
      fetchEvents();
      fetchAgents(); // Severity change → ARP recalculated
    } else {
      const err = await res.json();
      toast.error(`Gagal memperbarui: ${err.error || "Server error"}`);
    }
  }, [fetchEvents, fetchAgents]);

  const deleteEvent = useCallback(async (id: number) => {
    const res = await fetchWithAuth(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Risk Event berhasil dihapus.");
      fetchEvents();
      fetchAgents();
    } else {
      const err = await res.json();
      toast.error(`Gagal menghapus: ${err.error || "Server error"}`);
    }
  }, [fetchEvents, fetchAgents]);

  return (
    <RiskDataContext.Provider value={{
      agents, events, selectedYear, setSelectedYear,
      refreshAgents: fetchAgents, refreshEvents: fetchEvents,
      addAgent, updateAgent, deleteAgent,
      addEvent, updateEvent, deleteEvent,
    }}>
      {children}
    </RiskDataContext.Provider>
  );
}

export function useRiskData(): RiskDataContextType {
  const ctx = useContext(RiskDataContext);
  if (!ctx) throw new Error("useRiskData must be used inside <RiskDataProvider>");
  return ctx;
}
