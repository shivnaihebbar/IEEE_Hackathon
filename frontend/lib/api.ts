// lib/api.ts
// All API calls go through here — import this in your components

const API = "/api"; // proxies to FastAPI via Next.js route handlers

export type AttackLabel =
  | "Brute_Force"
  | "Normal"
  | "Port_Scan"
  | "HTTP_DDoS"
  | "ICMP_Flood"
  | "Web_Crwling";

export interface Prediction {
  attack_class: AttackLabel;
  confidence: number;
  all_probabilities: Record<AttackLabel, number>;
  is_attack: boolean;
}

export interface ShapFeature {
  feature: string;
  shap_value: number;
  direction: "increases_risk" | "decreases_risk";
}

export interface ExplainResponse {
  attack_class: AttackLabel;
  confidence: number;
  shap_features: ShapFeature[];
}

export interface CsvResponse {
  total_rows: number;
  predictions: Prediction[];
  attack_summary: Record<AttackLabel, number>;
}

export const ATTACK_COLORS: Record<AttackLabel, string> = {
  Brute_Force: "#EF4444",
  Port_Scan:   "#F97316",
  HTTP_DDoS:   "#EAB308",
  ICMP_Flood:  "#A855F7",
  Web_Crwling: "#3B82F6",
  Normal:      "#22C55E",
};

export const ATTACK_BG: Record<AttackLabel, string> = {
  Brute_Force: "bg-red-500",
  Port_Scan:   "bg-orange-500",
  HTTP_DDoS:   "bg-yellow-500",
  ICMP_Flood:  "bg-purple-500",
  Web_Crwling: "bg-blue-500",
  Normal:      "bg-green-500",
};

// Upload a CSV file and get predictions back
export async function predictCsv(file: File): Promise<CsvResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API}/predict-csv`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Prediction failed");
  return res.json();
}

// Get SHAP explanation for a single dummy flow (for live alert feed)
export async function explainFlow(flow: Record<string, number>): Promise<ExplainResponse> {
  const res = await fetch(`${API}/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(flow),
  });
  if (!res.ok) throw new Error("Explain failed");
  return res.json();
}

// Health check
export async function checkHealth(): Promise<{ status: string; mode: string }> {
  const res = await fetch(`${API.replace("/api", "")}/api/health`);
  return res.json();
}