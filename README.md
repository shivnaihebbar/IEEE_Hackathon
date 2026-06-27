# IEEE Hackathon Starter

This workspace includes a minimal FastAPI backend and a Next.js frontend scaffold for a loan-risk prediction demo.

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend to be running at http://127.0.0.1:8000 unless you set BACKEND_URL in the frontend environment.
