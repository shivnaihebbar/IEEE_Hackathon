// frontend/app/api/predict-csv/route.ts
// Proxies CSV file uploads to FastAPI backend

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const res = await fetch(`${API_URL}/predict-csv`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}