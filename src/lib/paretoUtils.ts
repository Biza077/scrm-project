/**
 * paretoUtils.ts
 * Utility untuk menghitung analisis kumulatif Pareto 80% berdasarkan ARP.
 */

export interface AgentWithPareto {
  id: number;
  code_pa: string;
  description: string;
  occurrence: number;
  arp_score: number;
  scor_phase: string;
  code_pa_ref: string;
  rank: number;
  pct_arp: number;
  pct_cumulative: number;
  is_priority: boolean;
  [key: string]: unknown;
}

/**
 * Hitung ARP kumulatif Pareto 80% untuk semua agen.
 * Mengurutkan dari ARP terbesar, menghitung % ARP dan % kumulatif.
 * is_priority = true jika akumulatif <= 80% (Sumber Risiko Prioritas)
 */
export function computePareto(agents: {
  id: number;
  code_pa: string;
  description: string;
  occurrence: number;
  arp_score: number;
  scor_phase: string;
  code_pa_ref: string;
  rank: number;
  [key: string]: unknown;
}[]): AgentWithPareto[] {
  if (!agents || agents.length === 0) return [];

  const sorted = [...agents].sort((a, b) => b.arp_score - a.arp_score);
  const totalArp = sorted.reduce((sum, ag) => sum + ag.arp_score, 0);

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
    const pct_arp = (ag.arp_score / totalArp) * 100;
    cumulative += pct_arp;
    return {
      ...ag,
      rank: i + 1,
      pct_arp,
      pct_cumulative: cumulative,
      is_priority: cumulative <= 80.001,
    };
  });
}

/** Format angka ke maksimal N desimal */
export function fmtNum(n: number, dec = 2): string {
  return Number(n.toFixed(dec)).toString();
}
