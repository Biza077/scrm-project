import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/lib/api";
import toast from "react-hot-toast";

export interface MetricData {
  id: number;
  month: string;
  short_month: string;
  year: number;
  rainfall_mm: number;
  raw_tea_ton: number;
  dry_tea_ton: number;
}

export function useMetrics(year: number = 2026) {
  const [data, setData] = useState<MetricData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchWithAuth(`/api/metrics?year=${year}`);
      if (!res.ok) {
        if (res.status === 401) {
          setError(null);
          return;
        }
        throw new Error("Gagal mengambil data metrik");
      }
      const json = await res.json();
      setData(json.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [year]);

  const updateMetric = useCallback(
    async (id: number, payload: Partial<Omit<MetricData, "id" | "month" | "short_month" | "year">>) => {
      try {
        const res = await fetchWithAuth(`/api/metrics/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          toast.success("Metrik produksi berhasil diperbarui!");
          fetchMetrics();
        } else {
          const err = await res.json();
          toast.error(`Gagal memperbarui: ${err.error || "Server error"}`);
        }
      } catch (err: any) {
        toast.error(`Error koneksi: ${err.message}`);
      }
    },
    [fetchMetrics]
  );

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { data, isLoading, error, refetch: fetchMetrics, updateMetric };
}
