"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CsvResponse, AttackLabel } from "../../lib/api";
import StatsCards from "../../components/StatsCards";
import AttackDistChart from "../../components/AttackDistChart";
import PredictionsTable from "../../components/PredictionsTable";
import ShapPanel from "../../components/ShapPanel";
import LiveAlertFeed from "../../components/LiveAlertFeed";

export default function DashboardPage() {
  const router = useRouter();
  const [result, setResult] = useState<CsvResponse | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("cyberguard_result");
    if (!stored) {
      router.push("/");
      return;
    }
    setResult(JSON.parse(stored));
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summary = result.attack_summary;
  const attackCount = Object.entries(summary)
    .filter(([k]) => k !== "Normal")
    .reduce((acc, [, v]) => acc + v, 0);
  const normalCount = summary["Normal"] ?? 0;
  const topAttack = Object.entries(summary)
    .filter(([k]) => k !== "Normal")
    .sort(([, a], [, b]) => b - a)[0]?.[0] ?? "None";

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <span className="font-bold text-white">CyberGuard</span>
          <span className="text-xs text-gray-600 ml-2">Dashboard</span>
        </div>
        <button
          onClick={() => router.push("/")}
          className="text-xs text-gray-500 hover:text-white transition-colors border border-gray-800 px-3 py-1.5 rounded-lg"
        >
          ← Upload New File
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Stats */}
        <StatsCards
          totalRows={result.total_rows}
          attackCount={attackCount}
          normalCount={normalCount}
          topAttack={topAttack}
        />

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AttackDistChart summary={summary} />
          <ShapPanel />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PredictionsTable predictions={result.predictions} />
          <LiveAlertFeed />
        </div>

      </div>

      <footer className="text-center text-xs text-gray-800 py-6">
        IEEE DataPort Hackathon 2026 · IEEE CS Bangalore Chapter · XGBoost + SHAP
      </footer>
    </main>
  );
}