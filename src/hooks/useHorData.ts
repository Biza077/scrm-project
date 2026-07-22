"use client";

import { useState, useEffect, useCallback } from "react";
import { HorAgent, RiskEvent } from "@/data/dummyData";
import { fetchWithAuth } from "@/lib/api";

interface HorData {
  agents: HorAgent[];
  events: RiskEvent[];
  rMatrix: Record<string, number>;   // "event_id:agent_id" → r_value
}

interface UseHorDataReturn extends HorData {
  isLoading: boolean;
  refresh: () => void;
  setRValue: (event_id: number, agent_id: number, r_value: number) => Promise<void>;
}

export function useHorData(year: number = 2026): UseHorDataReturn {
  const [data, setData] = useState<HorData>({ agents: [], events: [], rMatrix: {} });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [horRes, corrRes] = await Promise.all([
        fetchWithAuth(`/api/hor?year=${year}`),
        fetchWithAuth(`/api/correlations?year=${year}`),
      ]);

      if (!horRes.ok || !corrRes.ok) return;

      const { data: agents } = await horRes.json();
      const { data: corrData } = await corrRes.json();

      setData({
        agents: agents as HorAgent[],
        events: corrData.events as RiskEvent[],
        rMatrix: corrData.rMatrix as Record<string, number>,
      });
    } catch (err) {
      console.error("[useHorData]", err);
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setRValue = useCallback(async (event_id: number, agent_id: number, r_value: number) => {
    try {
      const res = await fetchWithAuth("/api/correlations", {
        method: "PUT",
        body: JSON.stringify({ event_id, agent_id, r_value }),
      });
      if (res.ok) {
        await fetchData(); // Refresh after R value change (ARP recalculated server-side)
      }
    } catch (err) {
      console.error("[useHorData setRValue]", err);
    }
  }, [fetchData]);

  return {
    ...data,
    isLoading,
    refresh: fetchData,
    setRValue,
  };
}
