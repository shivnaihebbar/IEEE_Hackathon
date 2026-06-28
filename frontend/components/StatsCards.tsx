"use client";

interface StatsCardsProps {
  totalRows: number;
  attackCount: number;
  normalCount: number;
  topAttack: string;
}

export default function StatsCards({ totalRows, attackCount, normalCount, topAttack }: StatsCardsProps) {
  const attackRate = totalRows > 0 ? ((attackCount / totalRows) * 100).toFixed(1) : "0";

  const cards = [
    {
      label: "Total Flows Analyzed",
      value: totalRows.toLocaleString(),
      icon: "📊",
      sub: "network flow records",
      color: "border-blue-800",
    },
    {
      label: "Attacks Detected",
      value: attackCount.toLocaleString(),
      icon: "🚨",
      sub: `${attackRate}% of total traffic`,
      color: "border-red-800",
    },
    {
      label: "Normal Traffic",
      value: normalCount.toLocaleString(),
      icon: "✅",
      sub: `${(100 - parseFloat(attackRate)).toFixed(1)}% of total traffic`,
      color: "border-green-800",
    },
    {
      label: "Most Common Attack",
      value: topAttack.replace("_", " "),
      icon: "⚠️",
      sub: "highest frequency threat",
      color: "border-orange-800",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-black border ${card.color} rounded-xl p-4 flex flex-col gap-2`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{card.icon}</span>
            <span className="text-xs text-gray-500 uppercase tracking-wide">{card.label}</span>
          </div>
          <p className="text-2xl font-bold text-white truncate">{card.value}</p>
          <p className="text-xs text-gray-600">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}