# CyberGuard — Intelligent Cyberattack Detection System

**IEEE DataPort Hackathon 2026 | IEEE Computer Society Bangalore Chapter**

CyberGuard is an AI-powered intrusion detection system that detects and classifies cyberattacks from network traffic. Built using **XGBoost**, **FastAPI**, and **Next.js**, the system analyzes network flow data, identifies attack types with high accuracy, and provides **SHAP-based Explainable AI (XAI)** to help security analysts understand every prediction.

---

## Features

- Detects and classifies six network traffic classes
- High-performance XGBoost multi-class classifier
- Interactive dashboard with attack statistics and visualizations
- CSV upload for batch traffic analysis
- Confidence score for every prediction
- SHAP-based explainability for transparent AI decisions
- Attack distribution charts
- Live alert feed for detected attacks
- REST API built with FastAPI
- Cloud deployment using Railway and Vercel

---

# Problem Statement

Develop an AI-driven system capable of detecting and classifying cyberattacks in networked environments using network traffic and intrusion detection data, enabling faster threat identification and incident response.

Traditional intrusion detection systems often identify anomalies without explaining the attack or providing interpretable insights. CyberGuard addresses this challenge by combining high-performance machine learning with Explainable AI to produce actionable and transparent cyber threat intelligence.

---

## Dataset

The model is trained using the **Multi-Step Cyber-Attack Dataset (MSCAD)**.

### Dataset Statistics

| Property | Value |
|----------|-------|
| Records | 128,799 |
| Classes | 6 |
| Features | Network Flow Features |
| Task | Multi-class Classification |

### Traffic Classes

- Normal Traffic
- Brute Force
- Port Scan
- HTTP DDoS
- ICMP Flood
- Web Crawling

---

## Data Preprocessing

The dataset underwent several preprocessing stages before training.

### Exploratory Data Analysis

- Class distribution analysis
- Missing value analysis
- Correlation heatmaps
- Feature variance analysis
- Statistical summaries
- Violin plots
- Feature distribution analysis

### Handling Class Imbalance

The dataset contained significant class imbalance.

Example:

- Minority class: **28 samples**
- Majority class: **70,000+ samples**

To address this issue, we applied **SMOTETomek**, which combines synthetic oversampling with Tomek Links undersampling.

After preprocessing, every class contained approximately **70,000 samples**, resulting in a balanced training dataset.

---

## Machine Learning Pipeline

```text
Raw Network Traffic
        │
        ▼
Feature Engineering
        │
        ▼
Data Cleaning & Encoding
        │
        ▼
SMOTETomek Resampling
        │
        ▼
XGBoost Multi-Class Classifier
        │
        ▼
Prediction + Confidence Score
        │
        ▼
SHAP Explainability
        │
        ▼
Interactive Dashboard
```

---

## Model Performance

### Multi-Class Classification

| Metric | Score |
|---------|-------|
| Accuracy | **99.87%** |
| Weighted F1 Score | **99.87%** |
| Macro F1 Score | **83.69%** |

### False Negative Rates

| Attack Type | False Negative Rate |
|--------------|--------------------|
| Brute Force | 0.02% |
| Port Scan | 0.54% |
| Others | Very Low |

### Cross-Dataset Evaluation

Generalization was evaluated using the **UNSW-NB15** dataset.

Although direct multi-class transfer was limited due to domain shift between datasets, binary attack detection achieved a **99.81% F1 score** using 13 semantically mapped features shared across both datasets.

---

## Explainable AI

CyberGuard integrates **SHAP (SHapley Additive exPlanations)** to provide transparent predictions.

Available explanations include:

- Global feature importance
- Local prediction explanations
- Waterfall plots
- Per-sample SHAP values

This enables analysts to understand:

- Why a flow was classified as malicious
- Which features contributed most to the prediction
- How each feature influenced the final decision

---

## Technology Stack

### Machine Learning

- Python
- XGBoost
- Scikit-learn
- SHAP
- Pandas
- NumPy
- Imbalanced-learn

### Backend

- FastAPI
- Uvicorn
- Joblib

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Deployment

- Railway
- Vercel

---

## Project Structure

```text
cyberguard/
│
├── backend/
│   ├── main.py
│   ├── train.py
│   ├── requirements.txt
│   ├── Procfile
│   ├── nixpacks.toml
│   ├── model.joblib
│   ├── label_encoder.joblib
│   ├── feature_list.json
│   └── shap_background.npy
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   ├── tailwind.config.ts
│   └── .env.local.example
│
├── notebooks/
│   └── eda.ipynb
│
├── API_CONTRACT.md
└── README.md
```

---

## Getting Started

### Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend will run at:

```
http://localhost:8000
```

---

### Frontend

```bash
cd frontend

npm install

cp .env.local.example .env.local

npm run dev
```

Frontend will run at:

```
http://localhost:3000
```

---

## Model Training

Copy the MSCAD dataset into the backend directory.

```text
backend/
└── MSCAD.csv
```

Run:

```bash
python train.py
```

The following files will be generated:

```
model.joblib
label_encoder.joblib
feature_list.json
shap_background.npy
```

---

## API Endpoints

### Predict a Single Record

```http
POST /predict
```

Example Response

```json
{
    "prediction": "HTTP DDoS",
    "confidence": 0.998
}
```

---

### Predict CSV

```http
POST /predict-csv
```

Returns predictions for every uploaded network flow.

---

### Explain Prediction

```http
POST /explain
```

Returns SHAP values and feature contributions for the selected prediction.

---

## Deployment

### Backend (Railway)

1. Push the `backend` directory to GitHub.
2. Create a new Railway project.
3. Deploy the repository.
4. Railway automatically detects `nixpacks.toml`.
5. Copy the generated Railway URL.

### Frontend (Vercel)

1. Push the `frontend` directory to GitHub.
2. Import the repository into Vercel.
3. Configure the environment variable:

```env
NEXT_PUBLIC_API_URL=<railway-backend-url>
```

4. Deploy.

---

## Dashboard Features

- Network attack statistics
- Prediction confidence scores
- CSV traffic upload
- SHAP explanation panel
- Attack distribution charts
- Predictions table
- Live alert feed

---

## Future Improvements

- Real-time packet capture integration
- Streaming detection using Apache Kafka
- Graph Neural Networks for attack sequence modeling
- Transformer-based intrusion detection
- Threat intelligence integration
- SIEM platform compatibility
- Docker and Kubernetes deployment
- SOC monitoring dashboard

---

## Authors

Developed for the **IEEE DataPort Hackathon 2026** under the problem statement:

**Intelligent Cyber Detection for Network Systems**

---

## License

This project is developed for educational, research, and hackathon purposes.
