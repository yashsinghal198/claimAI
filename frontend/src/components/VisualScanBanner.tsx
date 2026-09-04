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
    <div className="claim-panel relative overflow-hidden rounded-2xl border-black/20 p-6">
      {/* Laser scan line effect */}
      <div className="claim-scan-line absolute left-0 right-0 top-0 h-0.5 bg-black shadow-[0_0_12px_rgba(0,0,0,0.55)]" />

      <div className="flex items-center gap-3.5 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-900/10 border border-purple-900/20 flex items-center justify-center text-purple-900">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-black flex items-center gap-2">
            AI Pre-Claim Evidence Engine Scanning
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/10 text-purple-800 border border-purple-900/20">
              LIVE GRAPH PASS
            </span>
          </h3>
          <p className="text-xs text-black/50">
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
                  ? "text-purple-800 font-bold"
                  : "text-black/40 opacity-60"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-purple-900 animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-black/20 flex items-center justify-center flex-shrink-0" />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
