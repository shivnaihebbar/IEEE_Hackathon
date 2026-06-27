from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
import joblib
import shap
import io
import os

app = FastAPI(title="CyberGuard API", version="1.0.0")

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load model artifacts ───────────────────────────────────────────────────────
# These files are created by Person 1's train.py
# Until they arrive, endpoints return dummy responses (DUMMY_MODE = True)
DUMMY_MODE = not os.path.exists("model.joblib")

model = None
label_encoder = None
feature_list = None
explainer = None
scaler = None

if not DUMMY_MODE:
    import json
    model = joblib.load("model.joblib")
    label_encoder = joblib.load("label_encoder.joblib")
    # Load scaler if Person 1 used one
    scaler = joblib.load("scaler.joblib") if os.path.exists("scaler.joblib") else None
    with open("feature_list.json") as f:
        raw = json.load(f)
        # Strip quotes from feature names e.g. "'Flow Duration'" → "Flow Duration"
        feature_list = [f.replace("'", '').replace('"', '').strip() for f in raw]
    # SHAP TreeExplainer — fast for XGBoost
    explainer = shap.TreeExplainer(model, feature_perturbation="tree_path_dependent")
    print("✅ Model loaded successfully")
    print(f"   Scaler: {'loaded' if scaler else 'not found'}")
    print(f"   Features: {len(feature_list)}")
else:
    print("⚠️  Running in DUMMY MODE — drop model.joblib to activate real inference")

# ── Label set ─────────────────────────────────────────────────────────────────
ATTACK_LABELS = ["Brute_Force", "Normal", "Port_Scan", "HTTP_DDoS", "ICMP_Flood", "Web_Crwling"]

# ── Schemas ───────────────────────────────────────────────────────────────────
class FlowRecord(BaseModel):
    """Single network flow — all 66 features"""
    Flow_Duration: Optional[float] = 0
    Tot_Fwd_Pkts: Optional[float] = 0
    Tot_Bwd_Pkts: Optional[float] = 0
    TotLen_Fwd_Pkts: Optional[float] = 0
    TotLen_Bwd_Pkts: Optional[float] = 0
    Fwd_Pkt_Len_Max: Optional[float] = 0
    Fwd_Pkt_Len_Min: Optional[float] = 0
    Fwd_Pkt_Len_Mean: Optional[float] = 0
    Fwd_Pkt_Len_Std: Optional[float] = 0
    Bwd_Pkt_Len_Max: Optional[float] = 0
    Bwd_Pkt_Len_Min: Optional[float] = 0
    Bwd_Pkt_Len_Mean: Optional[float] = 0
    Bwd_Pkt_Len_Std: Optional[float] = 0
    Flow_Byts_s: Optional[float] = 0
    Flow_Pkts_s: Optional[float] = 0
    Flow_IAT_Mean: Optional[float] = 0
    Flow_IAT_Std: Optional[float] = 0
    Flow_IAT_Max: Optional[float] = 0
    Flow_IAT_Min: Optional[float] = 0
    Fwd_IAT_Tot: Optional[float] = 0
    Fwd_IAT_Mean: Optional[float] = 0
    Fwd_IAT_Std: Optional[float] = 0
    Fwd_IAT_Max: Optional[float] = 0
    Fwd_IAT_Min: Optional[float] = 0
    Bwd_IAT_Tot: Optional[float] = 0
    Bwd_IAT_Mean: Optional[float] = 0
    Bwd_IAT_Std: Optional[float] = 0
    Bwd_IAT_Max: Optional[float] = 0
    Bwd_IAT_Min: Optional[float] = 0
    Bwd_PSH_Flags: Optional[float] = 0
    Bwd_URG_Flags: Optional[float] = 0
    Fwd_Header_Len: Optional[float] = 0
    Bwd_Header_Len: Optional[float] = 0
    Fwd_Pkts_s: Optional[float] = 0
    Bwd_Pkts_s: Optional[float] = 0
    Pkt_Len_Min: Optional[float] = 0
    Pkt_Len_Max: Optional[float] = 0
    Pkt_Len_Mean: Optional[float] = 0
    Pkt_Len_Std: Optional[float] = 0
    Pkt_Len_Var: Optional[float] = 0
    FIN_Flag_Cnt: Optional[float] = 0
    SYN_Flag_Cnt: Optional[float] = 0
    RST_Flag_Cnt: Optional[float] = 0
    PSH_Flag_Cnt: Optional[float] = 0
    ACK_Flag_Cnt: Optional[float] = 0
    URG_Flag_Cnt: Optional[float] = 0
    CWE_Flag_Count: Optional[float] = 0
    ECE_Flag_Cnt: Optional[float] = 0
    Down_Up_Ratio: Optional[float] = 0
    Pkt_Size_Avg: Optional[float] = 0
    Fwd_Seg_Size_Avg: Optional[float] = 0
    Bwd_Seg_Size_Avg: Optional[float] = 0
    Subflow_Fwd_Pkts: Optional[float] = 0
    Subflow_Fwd_Byts: Optional[float] = 0
    Subflow_Bwd_Pkts: Optional[float] = 0
    Subflow_Bwd_Byts: Optional[float] = 0
    Init_Bwd_Win_Byts: Optional[float] = 0
    Fwd_Act_Data_Pkts: Optional[float] = 0
    Active_Mean: Optional[float] = 0
    Active_Std: Optional[float] = 0
    Active_Max: Optional[float] = 0
    Active_Min: Optional[float] = 0
    Idle_Mean: Optional[float] = 0
    Idle_Std: Optional[float] = 0
    Idle_Max: Optional[float] = 0
    Idle_Min: Optional[float] = 0

class PredictionResponse(BaseModel):
    attack_class: str
    confidence: float
    all_probabilities: dict
    is_attack: bool

class ExplainResponse(BaseModel):
    attack_class: str
    confidence: float
    shap_features: List[dict]  # [{feature, shap_value, direction}]

# ── Helpers ───────────────────────────────────────────────────────────────────
def dummy_predict(n=1):
    """Returns fake predictions for testing frontend before model is ready"""
    import random
    results = []
    for _ in range(n):
        label = random.choice(ATTACK_LABELS)
        conf = round(random.uniform(0.72, 0.99), 4)
        probs = {l: round(random.uniform(0.01, 0.15), 4) for l in ATTACK_LABELS}
        probs[label] = conf
        results.append({
            "attack_class": label,
            "confidence": conf,
            "all_probabilities": probs,
            "is_attack": label != "Normal"
        })
    return results

def real_predict(df: pd.DataFrame):
    """Run actual model inference"""
    # Strip quotes from incoming column names to match cleaned feature_list
    df.columns = [c.replace("'", '').replace('"', '').strip() for c in df.columns]
    # Align columns to training feature order
    df = df.reindex(columns=feature_list, fill_value=0)
    df = df.fillna(0).replace([np.inf, -np.inf], 0)
    # Apply scaler using numpy array to bypass feature name check
    if scaler is not None:
        X = scaler.transform(df.values)
    else:
        X = df.values
    proba = model.predict_proba(X)
    preds = np.argmax(proba, axis=1)
    results = []
    for i, pred in enumerate(preds):
        label = label_encoder.inverse_transform([pred])[0]
        conf = float(proba[i][pred])
        all_probs = {label_encoder.inverse_transform([j])[0]: float(p)
                     for j, p in enumerate(proba[i])}
        results.append({
            "attack_class": label,
            "confidence": round(conf, 4),
            "all_probabilities": all_probs,
            "is_attack": label != "Normal"
        })
    return results

def get_shap_explanation(df: pd.DataFrame, pred_class: str):
    """Return top 5 SHAP features for a single prediction"""
    df.columns = [c.replace("'", '').replace('"', '').strip() for c in df.columns]
    df = df.reindex(columns=feature_list, fill_value=0)
    df = df.fillna(0).replace([np.inf, -np.inf], 0)
    if scaler is not None:
        X = scaler.transform(df.values)
    else:
        X = df.values
    shap_values = explainer.shap_values(X)
    # For multiclass, shap_values is a list — pick the predicted class index
    class_idx = list(label_encoder.classes_).index(pred_class)
    if isinstance(shap_values, list):
        sv = shap_values[class_idx][0]
    else:
        sv = shap_values[0]
    shap_pairs = sorted(zip(feature_list, sv.tolist()), key=lambda x: abs(x[1]), reverse=True)[:5]
    return [
        {
            "feature": f.strip("'"),
            "shap_value": round(float(v), 6),
            "direction": "increases_risk" if v > 0 else "decreases_risk"
        }
        for f, v in shap_pairs
    ]

def csv_to_df(content: bytes) -> pd.DataFrame:
    """Parse uploaded CSV bytes into DataFrame"""
    df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    # Strip quotes from column names if present (MSCAD has them)
    df.columns = [c.replace("'", '').replace('"', '').strip() for c in df.columns]
    # Drop label column if present
    df = df.drop(columns=["Label"], errors="ignore")
    return df

# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "mode": "live" if not DUMMY_MODE else "dummy"}

@app.post("/predict", response_model=PredictionResponse)
def predict_single(flow: FlowRecord):
    """Predict attack class for a single flow record (JSON input)"""
    if DUMMY_MODE:
        return dummy_predict(1)[0]
    df = pd.DataFrame([flow.dict()])
    # Map field names back to original column names
    df.columns = [c.replace("_", " ") for c in df.columns]
    result = real_predict(df)
    return result[0]

@app.post("/predict-csv")
def predict_csv(file: UploadFile = File(...)):
    """Predict attack classes for a full CSV upload"""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files accepted")
    content = file.file.read()
    if DUMMY_MODE:
        # Return dummy results for first 20 rows
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
        n = min(len(df), 20)
        results = dummy_predict(n)
        return {
            "total_rows": len(df),
            "predictions": results,
            "attack_summary": {l: sum(1 for r in results if r["attack_class"] == l)
                               for l in ATTACK_LABELS}
        }
    df = csv_to_df(content)
    results = real_predict(df)
    return {
        "total_rows": len(df),
        "predictions": results[:20],   # first 20 for table display
        "attack_summary": {l: sum(1 for r in results if r["attack_class"] == l)
                           for l in ATTACK_LABELS}
    }

@app.post("/explain")
def explain_single(flow: FlowRecord):
    """Return SHAP explanation for a single flow prediction"""
    if DUMMY_MODE:
        pred = dummy_predict(1)[0]
        # Dummy SHAP features
        dummy_shap = [
            {"feature": "SYN Flag Cnt", "shap_value": 0.42, "direction": "increases_risk"},
            {"feature": "Flow Pkts/s", "shap_value": 0.31, "direction": "increases_risk"},
            {"feature": "Flow Duration", "shap_value": -0.18, "direction": "decreases_risk"},
            {"feature": "Bwd Pkt Len Max", "shap_value": 0.14, "direction": "increases_risk"},
            {"feature": "ACK Flag Cnt", "shap_value": -0.09, "direction": "decreases_risk"},
        ]
        return {"attack_class": pred["attack_class"],
                "confidence": pred["confidence"],
                "shap_features": dummy_shap}
    df = pd.DataFrame([flow.dict()])
    df.columns = [c.replace("_", " ") for c in df.columns]
    result = real_predict(df)
    try:
     shap_feats = get_shap_explanation(df, result[0]["attack_class"])
    except Exception as e:
     print(f"SHAP failed: {e}")
    shap_feats = []
    return {"attack_class": result[0]["attack_class"],
        "confidence": result[0]["confidence"],
        "shap_features": shap_feats}

@app.get("/stats")
def get_stats():
    """Live attack count stats — driven by in-memory session counter"""
    # Frontend polls this; extend with a real counter if needed
    return {
        "total_analyzed": 0,
        "attack_counts": {l: 0 for l in ATTACK_LABELS},
        "mode": "live" if not DUMMY_MODE else "dummy"
    }