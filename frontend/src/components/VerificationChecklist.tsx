"use client";

import React from "react";
import { CheckCircle2, XCircle, CheckSquare, AlertCircle } from "lucide-react";
import { VerificationCheck } from "@/types";

interface VerificationChecklistProps {
  checks: VerificationCheck[];
}

export const VerificationChecklist: React.FC<VerificationChecklistProps> = ({
  checks,
}) => {
  const passedCount = checks.filter((c) => c.passed).length;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Evidence Validation Checks
          </h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {passedCount} / {checks.length} Passed
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {checks.map((check, index) => {
          return (
            <div
              key={`${check.label}-${index}`}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                check.passed
                  ? "bg-emerald-950/20 border-emerald-500/30 text-slate-200"
                  : "bg-slate-950/50 border-slate-800/80 text-slate-400"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {check.passed ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-4 h-4 text-rose-400" />
                  </div>
                )}
                <span className="text-xs font-medium">{check.label}</span>
              </div>

              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  check.passed
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-400"
                }`}
              >
                {check.passed ? "Verified" : "Missing"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
