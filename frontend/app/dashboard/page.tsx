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

  // Unified loading state matching the upload section
  if (!result) {
    return (
      <div style={{ background: "var(--paper)", color: "var(--ink)" }} className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div
          style={{ borderColor: "var(--signal-slate)", borderTopColor: "transparent" }}
          className="w-8 h-8 border-2 rounded-full animate-spin"
        />
        <p style={{ fontFamily: "var(--font-mono)" }} className="text-sm font-medium">
          LOADING_WORKSPACE...
        </p>
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
    <main style={{ background: "var(--paper)", color: "var(--ink)" }} className="min-h-screen font-sans">
      
      {/* Brutalist Nav */}
      <nav style={{ borderColor: "var(--line)" }} className="border-b-[1.5px] px-6 md:px-14 py-6 flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <span className="text-2xl font-extrabold tracking-tighter">
            Cyber<span style={{ color: "var(--signal-red)" }}>Guard</span>
          </span>
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-soft)" }} className="text-[10px] uppercase tracking-wider hidden sm:block">
            / Dashboard
          </span>
        </div>
        <button
          onClick={() => router.push("/")}
          style={{ borderColor: "var(--line)", fontFamily: "var(--font-mono)" }}
          className="border-[1.5px] rounded-full px-4 py-2 text-[11px] font-medium hover:bg-[var(--paper-raised)] transition-colors"
        >
          ← NEW_UPLOAD
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-14 py-10 space-y-8">

        {/* Stats */}
        <StatsCards
          totalRows={result.total_rows}
          attackCount={attackCount}
          normalCount={normalCount}
          topAttack={topAttack}
        />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttackDistChart summary={summary} />
          <ShapPanel />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PredictionsTable predictions={result.predictions} />
          <LiveAlertFeed />
        </div>

      </div>

      {/* Footer matching the front page */}
      <footer style={{ fontFamily: "var(--font-mono)", color: "var(--line-strong)" }} className="text-center text-[10px] tracking-wide py-12">
        IEEE DATAPORT HACKATHON 2026 · IEEE CS BANGALORE CHAPTER · XGBOOST + SHAP
      </footer>
    </main>
  );
}