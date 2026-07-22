"use client";

import { useState, useEffect, useCallback } from "react";
import { PreventiveAction } from "@/data/dummyData";
import { fetchWithAuth } from "@/lib/api";

interface Hor2Agent {
  id: number;
  code_pa: string;
  description: string;
  arp_score: number;
  rank: number;
}

interface ActionMatrixData {
  agents: Hor2Agent[];
  actions: PreventiveAction[];
  rMatrix: Record<string, number>; // "agent_id:action_id" -> r_value
}

interface UseHor2DataReturn extends ActionMatrixData {
  isLoading: boolean;
  refresh: () => void;
  setRValue: (agent_id: number, action_id: number, r_value: number) => Promise<void>;
}

export function useHor2Data(year: number = 2026): UseHor2DataReturn {
  const [data, setData] = useState<ActionMatrixData>({ agents: [], actions: [], rMatrix: {} });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`/api/action-correlations?year=${year}`);
      if (!res.ok) return;
      const { data: corrData } = await res.json();
      setData({
        agents: corrData.agents as Hor2Agent[],
        actions: corrData.actions as PreventiveAction[],
        rMatrix: corrData.rMatrix as Record<string, number>,
      });
    } catch (err) {
      console.error("[useHor2Data]", err);
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setRValue = useCallback(async (agent_id: number, action_id: number, r_value: number) => {
    try {
      const res = await fetchWithAuth("/api/action-correlations", {
        method: "PUT",
        body: JSON.stringify({ agent_id, action_id, r_value }),
      });
      if (res.ok) {
        await fetchData(); // Refresh after R value change (ETD recalculated server-side)
      }
    } catch (err) {
      console.error("[useHor2Data setRValue]", err);
    }
  }, [fetchData]);

  return { ...data, isLoading, refresh: fetchData, setRValue };
}
