# API Contract — CyberGuard

Base URL (dev):  http://localhost:8000
Base URL (prod): https://<your-railway-url>.up.railway.app

---

## GET /health
No body.
Response:
```json
{ "status": "ok", "mode": "live" | "dummy" }
```

---

## POST /predict
Single flow JSON prediction.

Request body:
```json
{
  "SYN_Flag_Cnt": 1,
  "Flow_Pkts_s": 3293.8,
  "Flow_Duration": 1518,
  "Flow_Byts_s": 320816.8
  // ... all 66 features (all optional, default 0)
}
```

Response:
```json
{
  "attack_class": "Brute_Force",
  "confidence": 0.9821,
  "all_probabilities": {
    "Brute_Force": 0.9821,
    "Normal": 0.0091,
    "Port_Scan": 0.0042,
    "HTTP_DDoS": 0.0031,
    "ICMP_Flood": 0.0010,
    "Web_Crwling": 0.0005
  },
  "is_attack": true
}
```

---

## POST /predict-csv
Upload a CSV file (multipart/form-data).

Field name: `file`
File type: `.csv`

Response:
```json
{
  "total_rows": 128799,
  "predictions": [
    {
      "attack_class": "Brute_Force",
      "confidence": 0.9821,
      "all_probabilities": { ... },
      "is_attack": true
    }
    // first 20 rows only for table display
  ],
  "attack_summary": {
    "Brute_Force": 12,
    "Normal": 5,
    "Port_Scan": 2,
    "HTTP_DDoS": 1,
    "ICMP_Flood": 0,
    "Web_Crwling": 0
  }
}
```

---

## POST /explain
SHAP explanation for a single flow.

Request body: same as /predict

Response:
```json
{
  "attack_class": "Brute_Force",
  "confidence": 0.9821,
  "shap_features": [
    { "feature": "SYN Flag Cnt", "shap_value": 0.42, "direction": "increases_risk" },
    { "feature": "Flow Pkts/s",  "shap_value": 0.31, "direction": "increases_risk" },
    { "feature": "Flow Duration","shap_value": -0.18,"direction": "decreases_risk" },
    { "feature": "Bwd Pkt Len Max","shap_value": 0.14,"direction": "increases_risk" },
    { "feature": "ACK Flag Cnt", "shap_value": -0.09,"direction": "decreases_risk" }
  ]
}
```

---

## GET /stats
Live session attack counts.

Response:
```json
{
  "total_analyzed": 1042,
  "attack_counts": {
    "Brute_Force": 721,
    "Normal": 201,
    "Port_Scan": 88,
    "HTTP_DDoS": 22,
    "ICMP_Flood": 8,
    "Web_Crwling": 2
  },
  "mode": "live"
}
```

---

## Attack label colors (use consistently across frontend)
| Label        | Color (Tailwind)     | Hex     |
|--------------|----------------------|---------|
| Brute_Force  | bg-red-500           | #EF4444 |
| Port_Scan    | bg-orange-500        | #F97316 |
| HTTP_DDoS    | bg-yellow-500        | #EAB308 |
| ICMP_Flood   | bg-purple-500        | #A855F7 |
| Web_Crwling  | bg-blue-500          | #3B82F6 |
| Normal       | bg-green-500         | #22C55E |