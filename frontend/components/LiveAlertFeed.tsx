"use client";

import { useEffect, useRef, useState } from "react";
import { ATTACK_COLORS, AttackLabel } from "../lib/api";

interface Alert {
  id: number;
  attack_class: AttackLabel;
  confidence: number;
  is_attack: boolean;
  timestamp: string;
}

// Simulated flow sequences that look realistic for a live demo
const DEMO_SEQUENCE: Array<{ attack_class: AttackLabel; confidence: number; is_attack: boolean }> = [
  { attack_class: "Normal",      confidence: 0.97, is_attack: false },
  { attack_class: "Normal",      confidence: 0.95, is_attack: false },
  { attack_class: "Brute_Force", confidence: 0.98, is_attack: true  },
  { attack_class: "Brute_Force", confidence: 0.96, is_attack: true  },
  { attack_class: "Normal",      confidence: 0.93, is_attack: false },
  { attack_class: "Port_Scan",   confidence: 0.91, is_attack: true  },
  { attack_class: "Port_Scan",   confidence: 0.88, is_attack: true  },
  { attack_class: "Normal",      confidence: 0.96, is_attack: false },
  { attack_class: "HTTP_DDoS",   confidence: 0.84, is_attack: true  },
  { attack_class: "Brute_Force", confidence: 0.99, is_attack: true  },
  { attack_class: "Normal",      confidence: 0.94, is_attack: false },
  { attack_class: "ICMP_Flood",  confidence: 0.79, is_attack: true  },
  { attack_class: "Normal",      confidence: 0.98, is_attack: false },
  { attack_class: "Web_Crwling", confidence: 0.76, is_attack: true  },
  { attack_class: "Normal",      confidence: 0.92, is_attack: false },
];

export default function LiveAlertFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [count, setCount] = useState(0);
  const seqRef = useRef(0);
  const idRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const item = DEMO_SEQUENCE[seqRef.current % DEMO_SEQUENCE.length];
      seqRef.current++;
      idRef.current++;

      const alert: Alert = {
        id: idRef.current,
        ...item,
        timestamp: new Date().toLocaleTimeString(),
      };

      setAlerts((prev) => [alert, ...prev].slice(0, 20)); // keep last 20
      setCount((c) => c + 1);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const attackCount = alerts.filter((a) => a.is_attack).length;

  return (
    <div className="bg-black border border-gray-800 rounded-xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Live Detection Feed
        </h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Live</span>
        </div>
      </div>

      {/* Mini stats */}
      <div className="flex gap-4 mb-4 text-xs">
        <span className="text-gray-500">
          Analyzed: <span className="text-white font-medium">{count}</span>
        </span>
        <span className="text-gray-500">
          Threats: <span className="text-red-400 font-medium">{attackCount}</span>
        </span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-72 pr-1">
        {alerts.length === 0 && (
          <div className="flex items-center gap-2 text-gray-600 text-sm py-4">
            <div className="w-4 h-4 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
            Waiting for traffic...
          </div>
        )}
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all
              ${alert.is_attack ? "bg-red-950/40 border border-red-900/50" : "bg-gray-800/40 border border-gray-800"}`}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: ATTACK_COLORS[alert.attack_class] }}
            />
            <span className={`font-medium flex-1 ${alert.is_attack ? "text-red-300" : "text-gray-300"}`}>
              {alert.is_attack ? "⚠ " : "✓ "}
              {alert.attack_class.replace("_", " ")}
            </span>
            <span className="text-gray-600">
              {(alert.confidence * 100).toFixed(0)}%
            </span>
            <span className="text-gray-700">{alert.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}