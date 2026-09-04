"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Binary } from "lucide-react";
import { ForensicAnalysis } from "@/types";

interface AuthenticityShieldProps {
  forensics?: ForensicAnalysis | null;
}

export const AuthenticityShield: React.FC<AuthenticityShieldProps> = ({
  forensics,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!forensics) return null;

  const isAuthentic = forensics.authenticity_score >= 80 && !forensics.is_tampered;
  const isSuspicious = forensics.is_tampered || forensics.ai_generated_risk === "HIGH";

  return (
    <div
      className={`rounded-2xl border p-4 backdrop-blur-xl transition-all ${
        isAuthentic
          ? "bg-emerald-50 border-emerald-500/40 shadow-lg shadow-emerald-500/20"
          : isSuspicious
          ? "bg-rose-50 border-rose-500/40 shadow-lg shadow-rose-500/20"
          : "bg-amber-50 border-amber-500/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isAuthentic
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : "bg-rose-500/20 text-rose-400 border-rose-500/40"
            }`}
          >
            {isAuthentic ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <ShieldAlert className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-black flex items-center gap-1.5">
                Authenticity & Integrity Shield
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/5 text-black/70">
                  Forensic V3
                </span>
              </h4>
            </div>
            <p className="text-[11px] text-black/50 mt-0.5">
              {isAuthentic
                ? "Zero pixel tampering or generative AI artifacts detected."
                : forensics.editing_software_detected
                ? `Artifacts detected: ${forensics.editing_software_detected}`
                : "Suspicious metadata anomalies detected in uploaded proofs."}
            </p>
          </div>
        </div>

        {/* Score & Toggle */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span
              className={`text-lg font-extrabold font-mono ${
                isAuthentic ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {forensics.authenticity_score}%
            </span>
            <span className="block text-[9px] uppercase font-semibold text-black/50">
              Integrity
            </span>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg bg-white border border-black/10 text-black/50 hover:text-white transition-colors"
            title="Toggle Forensic Check Details"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Forensics Details */}
      {expanded && (
        <div className="mt-3.5 pt-3 border-t border-black/10 space-y-2 text-xs animate-in fade-in duration-200">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-white border border-black/10">
              <span className="text-black/50 block text-[10px]">AI Generative Risk:</span>
              <span
                className={`font-semibold uppercase ${
                  forensics.ai_generated_risk === "LOW"
                    ? "text-emerald-400"
                    : forensics.ai_generated_risk === "MEDIUM"
                    ? "text-amber-400"
                    : "text-rose-400"
                }`}
              >
                {forensics.ai_generated_risk}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-black/10">
              <span className="text-black/50 block text-[10px]">Software Signatures:</span>
              <span className="font-semibold text-black/80 truncate block">
                {forensics.editing_software_detected || "None (Original Camera Sensor)"}
              </span>
            </div>
          </div>

          {/* Checkpoints */}
          <div className="space-y-1.5 pt-1">
            {forensics.forensic_checks.map((check, idx) => (
              <div
                key={`${check.label}-${idx}`}
                className="flex items-center justify-between p-1.5 rounded bg-white text-[11px]"
              >
                <span className="text-black/70">{check.label}</span>
                <span
                  className={`font-bold ${
                    check.passed ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {check.passed ? "PASS" : "FLAGGED"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
