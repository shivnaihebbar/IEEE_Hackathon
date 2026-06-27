# API Contract

## Backend endpoints

### GET /health
Returns service health.

### POST /predict
Body:

```json
{
  "age": 35,
  "income": 75000,
  "credit_score": 720,
  "monthly_debt": 1200,
  "loan_amount": 40000
}
```

Response:

```json
{
  "prediction": "low risk",
  "risk_score": 0.2,
  "reasons": ["profile looks stable"],
  "input_summary": {}
}
```

### POST /predict-csv
Accepts a CSV upload with columns: age, income, credit_score, monthly_debt, loan_amount.

### POST /explain
Returns a textual explanation for an input profile.

## Frontend proxy endpoints

- /api/predict
- /api/predict-csv
- /api/explain
