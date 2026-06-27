"use client";

import { Prediction, ATTACK_COLORS, AttackLabel } from "../lib/api";

interface PredictionsTableProps {
  predictions: Prediction[];
}

export default function PredictionsTable({ predictions }: PredictionsTableProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
        Sample Predictions (first 20 flows)
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase">
              <th className="text-left py-2 pr-4">#</th>
              <th className="text-left py-2 pr-4">Attack Class</th>
              <th className="text-left py-2 pr-4">Confidence</th>
              <th className="text-left py-2">Threat</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((pred, i) => (
              <tr
                key={i}
                className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
              >
                <td className="py-2 pr-4 text-gray-600">{i + 1}</td>
                <td className="py-2 pr-4">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          ATTACK_COLORS[pred.attack_class as AttackLabel] ?? "#6b7280",
                      }}
                    />
                    <span className="text-white font-medium">
                      {pred.attack_class.replace("_", " ")}
                    </span>
                  </span>
                </td>
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(pred.confidence * 100).toFixed(0)}%`,
                          backgroundColor:
                            ATTACK_COLORS[pred.attack_class as AttackLabel] ?? "#6b7280",
                        }}
                      />
                    </div>
                    <span className="text-gray-400 text-xs">
                      {(pred.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-2">
                  {pred.is_attack ? (
                    <span className="text-red-400 text-xs font-medium">⚠ Attack</span>
                  ) : (
                    <span className="text-green-400 text-xs font-medium">✓ Normal</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}