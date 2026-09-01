"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Search, FileCheck, CheckCircle2 } from "lucide-react";

const SCAN_STEPS = [
  "Reading multipart uploads & extracting document streams...",
  "Running OCR across serial number tags & damage photos...",
  "Extracting tables, line-items & purchase dates via pdfplumber...",
  "Cross-referencing model identifiers & warranty coverage windows...",
  "Synthesizing explainable readiness score & generating recommendations...",
];

export const VisualScanBanner: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-cyan-950/60 border border-cyan-500/40 rounded-2xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden animate-pulse">
      {/* Laser scan line effect */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce" />

      <div className="flex items-center gap-3.5 mb-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            AI Pre-Claim Evidence Engine Scanning
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              GPT-4o Multimodal Graph
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Validating cross-document consistency, timeline logic, and evidence completeness...
          </p>
        </div>
      </div>

      {/* Progress step indicators */}
      <div className="space-y-2">
        {SCAN_STEPS.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={step}
              className={`flex items-center gap-2.5 text-xs transition-colors duration-300 ${
                isDone
                  ? "text-emerald-400 font-medium"
                  : isCurrent
                  ? "text-cyan-300 font-bold"
                  : "text-slate-500 opacity-60"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center flex-shrink-0" />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
