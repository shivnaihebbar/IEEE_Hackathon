"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { predictCsv } from "../lib/api";

export default function UploadPage() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are accepted.");
      return;
    }
    setFileName(file.name);
    setError(null);
    setLoading(true);
    try {
      const result = await predictCsv(file);
      // Store result in sessionStorage so dashboard can read it
      sessionStorage.setItem("cyberguard_result", JSON.stringify(result));
      router.push("/dashboard");
    } catch (e) {
      setError("Failed to analyze file. Make sure the backend is running.");
      setLoading(false);
    }
  }, [router]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-3xl">🛡️</span>
          <h1 className="text-3xl font-bold tracking-tight">CyberGuard</h1>
        </div>
        <p className="text-gray-400 text-sm max-w-md">
          AI-powered cyberattack detection for networked systems.
          Upload a network flow CSV to classify threats in real time.
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs font-medium">Model Active</span>
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-12 flex flex-col items-center gap-4 transition-all cursor-pointer
          ${dragging
            ? "border-blue-400 bg-blue-950/30"
            : "border-gray-700 bg-gray-900 hover:border-gray-500 hover:bg-gray-900/80"
          }`}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <input
          id="fileInput"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onInputChange}
        />

        {loading ? (
          <>
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-blue-400 font-medium">Analyzing {fileName}...</p>
            <p className="text-gray-500 text-sm">Running XGBoost + SHAP inference</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-2xl">
              📂
            </div>
            <div className="text-center">
              <p className="font-semibold text-white">
                {dragging ? "Drop it here" : "Drag & drop your CSV file"}
              </p>
              <p className="text-gray-500 text-sm mt-1">or click to browse</p>
            </div>
            <div className="text-xs text-gray-600 text-center">
              Supports MSCAD format · 66 network flow features
            </div>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg max-w-lg w-full">
          ⚠️ {error}
        </div>
      )}

      {/* Attack types legend */}
      <div className="mt-10 flex flex-wrap gap-2 justify-center max-w-lg">
        {[
          { label: "Brute Force", color: "bg-red-500" },
          { label: "Port Scan", color: "bg-orange-500" },
          { label: "HTTP DDoS", color: "bg-yellow-500" },
          { label: "ICMP Flood", color: "bg-purple-500" },
          { label: "Web Crawling", color: "bg-blue-500" },
          { label: "Normal", color: "bg-green-500" },
        ].map((a) => (
          <span key={a.label} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className={`w-2 h-2 rounded-full ${a.color}`} />
            {a.label}
          </span>
        ))}
      </div>

      <p className="mt-8 text-xs text-gray-700">
        IEEE DataPort Hackathon 2026 · IEEE CS Bangalore Chapter
      </p>
    </main>
  );
}