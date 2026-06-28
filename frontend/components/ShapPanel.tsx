"use client";

import { useEffect, useState } from "react";
import { ExplainResponse, ATTACK_COLORS, AttackLabel } from "../lib/api";

const SAMPLE_FLOW = {
  Flow_Duration: 1518, Tot_Fwd_Pkts: 2, Tot_Bwd_Pkts: 5,
  SYN_Flag_Cnt: 1, ACK_Flag_Cnt: 0, Flow_Pkts_s: 4611.33,
  Flow_Byts_s: 320816.86, Pkt_Len_Max: 377, Pkt_Len_Min: 0,
};

// Fallback SHAP data if backend explain endpoint fails
const FALLBACK_SHAP: ExplainResponse = {
  attack_class: "Brute_Force" as AttackLabel,
  confidence: 0.945,
  shap_features: [
    { feature: "SYN Flag Cnt",   shap_value: 0.42, direction: "increases_risk" },
    { feature: "Flow Pkts/s",    shap_value: 0.31, direction: "increases_risk" },
    { feature: "Flow Duration",  shap_value: -0.18, direction: "decreases_risk" },
    { feature: "Bwd Pkt Len Max",shap_value: 0.14, direction: "increases_risk" },
    { feature: "ACK Flag Cnt",   shap_value: -0.09, direction: "decreases_risk" },
  ],
};

export default function ShapPanel() {
  const [data, setData] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(SAMPLE_FLOW),
    })
      .then((r) => r.json())
      .then((d) => {
        // Check if response has valid shap_features
        if (d && Array.isArray(d.shap_features) && d.shap_features.length > 0) {
          setData(d);
        } else {
          setData(FALLBACK_SHAP);
          setUsingFallback(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setData(FALLBACK_SHAP);
        setUsingFallback(true);
        setLoading(false);
      });
  }, []);

  const maxAbs = data
    ? Math.max(...data.shap_features.map((f) => Math.abs(f.shap_value)))
    : 1;

  return (
    <div className="bg-black border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          SHAP Explainability
        </h2>
        <span className="text-xs text-gray-600">Why did the model flag this flow?</span>
      </div>

      {data && (
        <div className="mb-4 flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: ATTACK_COLORS[data.attack_class as AttackLabel] ?? "#6b7280" }}
          >
            {data.attack_class.replace("_", " ")}
          </span>
          <span className="text-xs text-gray-500">
            {(data.confidence * 100).toFixed(1)}% confidence
          </span>
          {usingFallback && (
            <span className="text-xs text-yellow-600">· sample values</span>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 py-6 text-gray-500 text-sm">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading SHAP values...
        </div>
      )}

      {data && (
        <div className="space-y-3 mt-2">
          {data.shap_features.map((feat, i) => {
            const pct = (Math.abs(feat.shap_value) / maxAbs) * 100;
            const isRisk = feat.direction === "increases_risk";
            return (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300 font-medium">{feat.feature}</span>
                  <span className={isRisk ? "text-red-400" : "text-green-400"}>
                    {isRisk ? "▲ increases risk" : "▼ decreases risk"}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isRisk ? "#EF4444" : "#22C55E",
                    }}
                  />
                </div>
                <div className="text-right text-xs text-gray-600 mt-0.5">
                  SHAP: {feat.shap_value > 0 ? "+" : ""}{feat.shap_value.toFixed(4)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-700 mt-4">
        Based on sample flow · Real model uses actual uploaded records
      </p>
    </div>
  );
}