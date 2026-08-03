"use client";

import { Shield, AlertTriangle, CheckCircle, BarChart2 } from "lucide-react";
import { useRiskData } from "@/contexts/RiskDataContext";
import { computePareto } from "@/lib/paretoUtils";

const iconMap = {
  shield: Shield,
  "alert-triangle": AlertTriangle,
  "check-circle": CheckCircle,
  "bar-chart": BarChart2,
};

export default function SummaryCards() {
  const { agents } = useRiskData();

  const paretoAgents = computePareto(agents);
  const total = agents.length;
  const priority = paretoAgents.filter((a) => a.is_priority).length;
  const nonPriority = total - priority;
  const totalArp = agents.reduce((s, a) => s + a.arp_score, 0);

  const dynamicCards = [
    {
      id: "total",
      label: "Total Risk Agent",
      value: total,
      description: "Keseluruhan agen risiko teridentifikasi",
      color: "#0ea5e9",
      bgColor: "#e0f2fe",
      icon: "shield",
    },
    {
      id: "priority",
      label: "Agen Risiko Prioritas",
      value: priority,
      description: "Sumber risiko dalam 80% ARP kumulatif",
      color: "#ef4444",
      bgColor: "#fee2e2",
      icon: "alert-triangle",
    },
    {
      id: "nonpriority",
      label: "Agen Non-Prioritas",
      value: nonPriority,
      description: "ARP kumulatif > 80% — pemantauan rutin",
      color: "#22c55e",
      bgColor: "#dcfce7",
      icon: "check-circle",
    },
    {
      id: "totalarp",
      label: "Total Skor ARP",
      value: Number.isInteger(totalArp) ? totalArp : Number(totalArp.toFixed(1)),
      description: "Jumlah seluruh nilai ARP semua agen",
      color: "#8b5cf6",
      bgColor: "#ede9fe",
      icon: "bar-chart",
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
                  width: card.id === "totalarp"
                    ? "100%"
                    : total > 0
                    ? `${((card.value as number) / total) * 100}%`
                    : "0%",
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

