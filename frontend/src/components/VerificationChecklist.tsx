"use client";

import React from "react";
import { CheckCircle2, XCircle, CheckSquare, PlusCircle } from "lucide-react";
import { VerificationCheck } from "@/types";

interface VerificationChecklistProps {
  checks: VerificationCheck[];
  onToggleCheck?: (checkLabel: string) => void;
}

export const VerificationChecklist: React.FC<VerificationChecklistProps> = ({
  checks,
  onToggleCheck,
}) => {
  const passedCount = checks.filter((c) => c.passed).length;

  return (
    <div className="claim-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-purple-900" />
          <h3 className="text-sm font-semibold text-black/80">
            Evidence Validation Checks
          </h3>
        </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/[0.06] text-black border border-black/15">
          {passedCount} / {checks.length} Passed
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {checks.map((check, index) => {
          return (
            <div
              key={`${check.label}-${index}`}
              onClick={() => !check.passed && onToggleCheck && onToggleCheck(check.label)}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                check.passed
                    ? "bg-emerald-500/[0.08] border-emerald-500/30 text-black"
                  : "bg-rose-500/[0.06] border-rose-500/35 text-black hover:border-emerald-500/60 hover:bg-emerald-500/[0.08] cursor-pointer group"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {check.passed ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 group-hover:bg-emerald-500/20 flex items-center justify-center flex-shrink-0 transition-colors">
                    <XCircle className="w-4 h-4 text-rose-400 group-hover:hidden" />
                    <PlusCircle className="w-4 h-4 text-emerald-400 hidden group-hover:block" />
                  </div>
                )}
                <span className="text-xs font-medium">{check.label}</span>
              </div>

              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded transition-colors ${
                  check.passed
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-700 group-hover:bg-emerald-500/20 group-hover:text-emerald-700"
                }`}
              >
                {check.passed ? "Verified" : "Review evidence"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
