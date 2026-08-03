/**
 * paretoUtils.ts
 * Utility untuk menghitung analisis kumulatif Pareto 80% berdasarkan ARP.
 */

export interface AgentBase {
  id: number;
  code_pa: string;
  description: string;
  occurrence: number;
  arp_score: number;
  scor_phase: string;
  code_pa_ref: string;
  rank: number;
}

export interface AgentWithPareto extends AgentBase {
  pct_arp: number;
  pct_cumulative: number;
  is_priority: boolean;
  // Preserve any extra fields from the source object
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Hitung ARP kumulatif Pareto 80% untuk semua agen.
 * is_priority = true jika % kumulatif ARP <= 80% (Sumber Risiko Prioritas per Pareto)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function computePareto(agents: any[]): AgentWithPareto[] {
  if (!agents || agents.length === 0) return [];

  const sorted = [...agents].sort(
    (a, b) => (b.arp_score as number) - (a.arp_score as number)
  );
  const totalArp = sorted.reduce((sum, ag) => sum + (ag.arp_score as number), 0);

  if (totalArp === 0) {
    return sorted.map((ag, i) => ({
      ...ag,
      rank: i + 1,
      pct_arp: 0,
      pct_cumulative: 0,
      is_priority: false,
    }));
  }

  let cumulative = 0;
  return sorted.map((ag, i) => {
    const pct_arp = ((ag.arp_score as number) / totalArp) * 100;
    const cumulativeBeforeThis = cumulative;
    cumulative += pct_arp;
    return {
      ...ag,
      rank: i + 1,
      pct_arp,
      pct_cumulative: cumulative,
      // Prioritas jika kumulatif SEBELUM agen ini belum mencapai 80%
      // (agen yang "menyeberangi" batas 80% tetap masuk prioritas — standar HOR)
      is_priority: cumulativeBeforeThis < 80,
    };
  });
}

/** Format angka ke maksimal N desimal */
export function fmtNum(n: number, dec = 2): string {
  return Number(n.toFixed(dec)).toString();
}

