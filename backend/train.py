"""
Person 1 runs this script.
Outputs: model.joblib, label_encoder.joblib, feature_list.json, shap_background.npy
Drop all four files into the /backend folder before deploying.
"""

import pandas as pd
import numpy as np
import joblib
import json
import shap
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from xgboost import XGBClassifier
from imblearn.combine import SMOTETomek

# ── 1. Load data ───────────────────────────────────────────────────────────────
print("Loading MSCAD dataset...")
df = pd.read_csv("MSCAD.csv")
df.columns = [c.strip().strip("'") for c in df.columns]

X = df.drop(columns=["Label"])
y = df["Label"]

feature_list = list(X.columns)
print(f"Features: {len(feature_list)} | Samples: {len(df)}")
print("Class distribution:\n", y.value_counts())

# ── 2. Encode labels ───────────────────────────────────────────────────────────
le = LabelEncoder()
y_enc = le.fit_transform(y)
print("\nLabel encoding:", dict(zip(le.classes_, le.transform(le.classes_))))

# ── 3. Handle inf/nan ──────────────────────────────────────────────────────────
X = X.replace([np.inf, -np.inf], np.nan).fillna(0)

# ── 4. Train/test split ────────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y_enc, test_size=0.2, random_state=42, stratify=y_enc
)
print(f"\nTrain: {len(X_train)} | Test: {len(X_test)}")

# ── 5. SMOTE + Tomek Links (handle class imbalance) ───────────────────────────
print("\nApplying SMOTE + Tomek Links...")
smt = SMOTETomek(random_state=42)
X_train_res, y_train_res = smt.fit_resample(X_train, y_train)
print("After resampling:")
unique, counts = np.unique(y_train_res, return_counts=True)
for u, c in zip(unique, counts):
    print(f"  {le.inverse_transform([u])[0]}: {c}")

# ── 6. Train XGBoost ───────────────────────────────────────────────────────────
print("\nTraining XGBoost...")
model = XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.1,
    use_label_encoder=False,
    eval_metric="mlogloss",
    random_state=42,
    n_jobs=-1
)
model.fit(X_train_res, y_train_res)

# ── 7. Evaluate ────────────────────────────────────────────────────────────────
print("\nEvaluation on test set:")
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred, target_names=le.classes_))

print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# ── 8. SHAP background sample ──────────────────────────────────────────────────
print("\nComputing SHAP background sample (100 rows)...")
background = shap.sample(X_train_res, 100, random_state=42)
np.save("shap_background.npy", background.values)
print("Saved shap_background.npy")

# ── 9. Export artifacts ────────────────────────────────────────────────────────
joblib.dump(model, "model.joblib")
joblib.dump(le, "label_encoder.joblib")
with open("feature_list.json", "w") as f:
    json.dump(feature_list, f)

print("\n✅ All artifacts saved:")
print("  model.joblib")
print("  label_encoder.joblib")
print("  feature_list.json")
print("  shap_background.npy")
print("\nCopy all four files into the /backend folder.")