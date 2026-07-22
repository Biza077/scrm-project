"use client";

import { Shield, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { useRiskData } from "@/contexts/RiskDataContext";

const iconMap = {
  shield: Shield,
  "alert-triangle": AlertTriangle,
  "alert-circle": AlertCircle,
  "check-circle": CheckCircle,
};

export default function SummaryCards() {
  const { agents } = useRiskData();
  
  const total = agents.length;
  const high = agents.filter(a => a.arp_score >= 200).length;
  const medium = agents.filter(a => a.arp_score >= 100 && a.arp_score < 200).length;
  const low = agents.filter(a => a.arp_score < 100).length;

  const dynamicCards = [
    {
      id: "total",
      label: "Total Risiko",
      value: total,
      description: "Keseluruhan agen risiko teridentifikasi",
      color: "#0ea5e9",
      bgColor: "#e0f2fe",
      icon: "shield",
    },
    {
      id: "high",
      label: "Risiko Tinggi",
      value: high,
      description: "ARP ≥ 200 — Perlu tindakan segera",
      color: "#ef4444",
      bgColor: "#fee2e2",
      icon: "alert-triangle",
    },
    {
      id: "medium",
      label: "Risiko Sedang",
      value: medium,
      description: "ARP 100–199 — Perlu pemantauan rutin",
      color: "#f59e0b",
      bgColor: "#fef3c7",
      icon: "alert-circle",
    },
    {
      id: "low",
      label: "Risiko Rendah",
      value: low,
      description: "ARP < 100 — Dalam batas toleransi",
      color: "#22c55e",
      bgColor: "#dcfce7",
      icon: "check-circle",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {dynamicCards.map((card) => {
        const Icon = iconMap[card.icon as keyof typeof iconMap];
        return (
          <div
            key={card.id}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  {card.label}
                </p>
                <p
                  className="text-3xl font-bold mb-1"
                  style={{ color: card.color }}
                >
                  {card.value}
                </p>
                <p className="text-xs text-gray-400 leading-tight">{card.description}</p>
              </div>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: card.bgColor }}
              >
                <Icon size={20} style={{ color: card.color }} />
              </div>
            </div>

            {/* Bottom accent bar */}
            <div className="mt-4 h-1 rounded-full" style={{ backgroundColor: card.bgColor }}>
              <div
                className="h-1 rounded-full transition-all duration-700"
                style={{
                  width: total > 0 ? `${(card.value / total) * 100}%` : "0%",
                  backgroundColor: card.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
