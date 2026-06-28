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
      setError("Only .csv files are accepted.");
      return;
    }
    setFileName(file.name);
    setError(null);
    setLoading(true);
    try {
      const result = await predictCsv(file);
      sessionStorage.setItem("cyberguard_result", JSON.stringify(result));
      router.push("/dashboard");
    } catch (e) {
      setError("Analysis failed. Confirm the inference backend is reachable.");
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

  const scrollToUpload = () => {
    document.getElementById("upload-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main style={{ background: "var(--paper)", color: "var(--ink)" }} className="min-h-screen font-sans">

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Nav */}
        <nav className="relative z-10 flex justify-between items-center px-6 md:px-14 py-8">
          
          <div className="flex gap-2.5 ml-auto md:ml-0">
            <button
              onClick={scrollToUpload}
              style={{ borderColor: "var(--signal-slate)", color: "var(--signal-slate)", fontFamily: "var(--font-mono)" }}
              className="border-[1.5px] rounded-full px-4 py-2 text-xs font-medium"
            >
              UPLOAD CSV
            </button>
            <span
              style={{ background: "var(--signal-red)", fontFamily: "var(--font-mono)" }}
              className="border-[1.5px] border-transparent rounded-full px-4 py-2 text-xs font-medium text-white flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          </div>
        </nav>

        {/* Subhead, top right */}
        <div className="absolute z-10 top-12 right-6 md:right-14 text-right hidden sm:block">
          <div
            style={{ fontFamily: "var(--font-mono)", color: "var(--signal-red)" }}
            className="text-xs font-semibold tracking-wide mb-1.5"
          >
            <br>
            </br>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
            Multi-stage<br />
            <span style={{ color: "var(--signal-slate)" }}>attack detection</span>
          </h2>
        </div>

        {/* Wordmark */}
        <div className="relative z-10 px-6 md:px-14 pt-2">
          <h1 className="text-[64px] sm:text-[90px] md:text-[130px] font-extrabold tracking-tighter leading-[0.9]">
            Cyber<span style={{ color: "var(--signal-red)" }}>Guard</span>
            <sup style={{ fontSize: "0.22em", color: "var(--ink-soft)", fontWeight: 500 }}>®</sup>
          </h1>
        </div>

        {/* Network graphic */}
        <div className="relative h-[260px] md:h-[420px] mt-4">
          <svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full">
            <line x1="180" y1="320" x2="420" y2="180" stroke="#B8B8B0" strokeWidth="1.5" />
            <line x1="420" y1="180" x2="650" y2="240" stroke="#B8B8B0" strokeWidth="1.5" />
            <line x1="650" y1="240" x2="880" y2="150" stroke="#C4341F" strokeWidth="2.5" />
            <line x1="880" y1="150" x2="1060" y2="220" stroke="#B8B8B0" strokeWidth="1.5" />
            <line x1="420" y1="180" x2="300" y2="100" stroke="#B8B8B0" strokeWidth="1.5" />
            <line x1="650" y1="240" x2="700" y2="360" stroke="#B8B8B0" strokeWidth="1.5" />
            <line x1="880" y1="150" x2="950" y2="60" stroke="#B8B8B0" strokeWidth="1.5" />

            <circle cx="180" cy="320" r="9" fill="#3B5A6B" />
            <circle cx="420" cy="180" r="9" fill="#3B5A6B" />
            <circle cx="300" cy="100" r="6" fill="#3B5A6B" opacity="0.5" />
            <circle cx="650" cy="240" r="9" fill="#3B5A6B" />
            <circle cx="700" cy="360" r="6" fill="#A6720A" />
            <circle cx="1060" cy="220" r="6" fill="#3B5A6B" opacity="0.5" />
            <circle cx="950" cy="60" r="6" fill="#3B5A6B" opacity="0.5" />

            <circle cx="880" cy="150" r="16" fill="none" stroke="#C4341F" strokeWidth="2" />
            <circle cx="880" cy="150" r="16" fill="#F5E4E0" opacity="0.6">
              <animate attributeName="r" values="16;30;16" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="880" cy="150" r="9" fill="#C4341F" />

            <text x="895" y="135" fontFamily="IBM Plex Mono" fontSize="11" fill="#C4341F" fontWeight="600">BRUTE_FORCE</text>
            <text x="895" y="148" fontFamily="IBM Plex Mono" fontSize="10" fill="#C4341F">conf 0.98</text>
          </svg>
        </div>

        {/* Bottom row: tagline + CTAs */}
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 px-6 md:px-14 pb-14 -mt-6">
          <p className="text-base font-semibold max-w-[280px]">
            Real-time classification with explainable attribution. No black box.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a
              href="https://github.com/shivnaihebbar/IEEE_Hackathon"
              style={{ borderColor: "var(--ink)" }}
              className="border-[1.5px] rounded-full px-6 py-3.5 text-sm font-semibold"
            >
              View on GitHub
            </a>
            <button
              onClick={scrollToUpload}
              style={{ background: "var(--signal-red)" }}
              className="rounded-full px-6 py-3.5 text-sm font-semibold text-white"
            >
              Try live demo →
            </button>
          </div>
        </div>
      </section>

      {/* ===== UPLOAD SECTION (below the fold) ===== */}
      <section
        id="upload-section"
        style={{ borderColor: "var(--line)" }}
        className="border-t-[1.5px] flex flex-col items-center justify-center px-4 py-20"
      >
        <div className="mb-10 text-center max-w-lg">
          <h3 className="text-xl font-semibold tracking-tight mb-2">Run a detection</h3>
          <p style={{ color: "var(--ink-soft)" }} className="text-sm leading-relaxed">
            Upload a flow-level CSV in the MSCAD schema for inference against
            the trained detection model.
          </p>
          <div
            style={{ fontFamily: "var(--font-mono)", color: "var(--signal-slate)" }}
            className="mt-4 inline-flex items-center gap-2 text-xs tracking-wide"
          >
            <span style={{ background: "var(--signal-slate)" }} className="w-1.5 h-1.5 rounded-full" />
            MODEL_STATUS: ACTIVE
          </div>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById("fileInput")?.click()}
          style={{
            background: "var(--paper-raised)",
            borderColor: dragging ? "var(--signal-slate)" : "var(--line)",
          }}
          className="w-full max-w-lg border-[1.5px] p-12 flex flex-col items-center gap-4 cursor-pointer transition-colors"
        >
          <input id="fileInput" type="file" accept=".csv" className="hidden" onChange={onInputChange} />

          {loading ? (
            <>
              <div
                style={{ borderColor: "var(--signal-slate)", borderTopColor: "transparent" }}
                className="w-8 h-8 border-2 rounded-full animate-spin"
              />
              <p style={{ fontFamily: "var(--font-mono)" }} className="text-sm font-medium">
                ANALYZING — {fileName}
              </p>
              <p style={{ color: "var(--ink-soft)" }} className="text-xs">
                Running XGBoost inference + SHAP attribution
              </p>
            </>
          ) : (
            <>
              <div style={{ borderColor: "var(--line-strong)" }} className="w-12 h-12 border-[1.5px] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink-soft)" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">{dragging ? "Release to upload" : "Drop a CSV file here"}</p>
                <p style={{ color: "var(--ink-soft)" }} className="text-xs mt-1">or click to browse</p>
              </div>
              <div
                style={{ fontFamily: "var(--font-mono)", color: "var(--ink-soft)", borderColor: "var(--line)" }}
                className="text-[11px] text-center pt-2 border-t w-full mt-2"
              >
                MSCAD_SCHEMA · 66_FEATURES
              </div>
            </>
          )}
        </div>

        {error && (
          <div
            style={{ background: "var(--signal-red-soft)", borderColor: "var(--signal-red)", color: "var(--signal-red)" }}
            className="mt-4 border-[1.5px] text-sm px-4 py-3 max-w-lg w-full font-medium"
          >
            {error}
          </div>
        )}

        {/* Attack types legend */}
        <div className="mt-12 flex flex-wrap gap-x-5 gap-y-2 justify-center max-w-lg">
          {[
            { label: "BRUTE_FORCE", color: "var(--signal-red)" },
            { label: "PORT_SCAN", color: "var(--signal-amber)" },
            { label: "HTTP_DDOS", color: "var(--signal-red)" },
            { label: "ICMP_FLOOD", color: "var(--signal-amber)" },
            { label: "WEB_CRAWLING", color: "var(--signal-slate)" },
            { label: "NORMAL", color: "var(--signal-slate)" },
          ].map((a) => (
            <span key={a.label} style={{ fontFamily: "var(--font-mono)", color: "var(--ink-soft)" }} className="flex items-center gap-1.5 text-[11px]">
              <span style={{ background: a.color }} className="w-1.5 h-1.5" />
              {a.label}
            </span>
          ))}
        </div>

        <p style={{ fontFamily: "var(--font-mono)", color: "var(--line-strong)" }} className="mt-10 text-[10px] tracking-wide">
          IEEE DATAPORT HACKATHON 2026 · IEEE CS BANGALORE CHAPTER
        </p>
      </section>
    </main>
  );
}