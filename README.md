# CyberGuard — Intelligent Cyberattack Detection System
IEEE DataPort Hackathon 2026 | IEEE CS Bangalore Chapter

---

## File Structure

```
cyberguard/
│
├── backend/                        
│   ├── main.py                   
│   ├── train.py                    
│   ├── requirements.txt
│   ├── Procfile                    
│   ├── nixpacks.toml               
│   │
│   ├── model.joblib                
│   ├── label_encoder.joblib       
│   ├── feature_list.json           
│   └── shap_background.npy        
│
├── frontend/                      
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                
│   │   ├── dashboard/
│   │   │   └── page.tsx            
│   │   └── api/
│   │       ├── predict/
│   │       │   └── route.ts       
│   │       ├── predict-csv/
│   │       │   └── route.ts      
│   │       └── explain/
│   │           └── route.ts       
│   │
│   ├── components/        
│   │   ├── StatsCards.tsx         
│   │   ├── AttackDistChart.tsx     
│   │   ├── PredictionsTable.tsx   
│   │   ├── ShapPanel.tsx           
│   │   └── LiveAlertFeed.tsx     
│   │
│   ├── lib/
│   │   └── api.ts                
│   │
│   ├── .env.local                 
│   ├── .env.local.example         
│   ├── tailwind.config.ts
│   └── package.json
│
├── notebooks/                     
│   └── eda.ipynb
│
├── API_CONTRACT.md             
└── README.md
```

---

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate       
pip install -r requirements.txt
uvicorn main:app --reload      
```

### Frontend 
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev                 
```

### Model Training 
```bash
cd backend
# Copy MSCAD.csv into /backend first
python train.py
# Outputs: model.joblib, label_encoder.joblib, feature_list.json, shap_background.npy
```

---

## Deploy

### Backend → Railway
1. Push `/backend` to GitHub
2. railway.app → New Project → Deploy from GitHub
3. Select `/backend` as root directory
4. Railway auto-detects nixpacks.toml
5. Copy the Railway URL → paste into frontend `.env.local`

### Frontend → Vercel
1. Push `/frontend` to GitHub
2. vercel.com → New Project → Import repo
3. Set environment variable: `NEXT_PUBLIC_API_URL=<railway-url>`
4. Deploy

---
