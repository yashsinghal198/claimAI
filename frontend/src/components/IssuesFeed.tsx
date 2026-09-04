"use client";

import React from "react";
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { DetectedIssue } from "@/types";

interface IssuesFeedProps {
  issues: DetectedIssue[];
}

export const IssuesFeed: React.FC<IssuesFeedProps> = ({ issues }) => {
  return (
    <div className="claim-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-black/80">
            Detected Issues & Contradictions
          </h3>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
            issues.length === 0
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          }`}
        >
          {issues.length} {issues.length === 1 ? "Issue" : "Issues"} Flagged
        </span>
      </div>

      {issues.length === 0 ? (
        <div className="p-4 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/30 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
              <p className="text-xs font-semibold text-emerald-900">
              Zero Contradictions Detected
            </p>
              <p className="text-[11px] text-emerald-800/80 mt-0.5">
              All dates, model serial tags, and narratives align seamlessly.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {issues.map((issue, idx) => {
            const isHigh = issue.severity === "HIGH";
            const isMedium = issue.severity === "MEDIUM";

            return (
              <div
                key={`${issue.description}-${idx}`}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  isHigh
                    ? "bg-rose-500/[0.06] border-rose-500/30"
                    : isMedium
                    ? "bg-amber-500/[0.08] border-amber-500/30"
                    : "bg-black/[0.035] border-black/15"
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isHigh ? (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  ) : isMedium ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isHigh
                          ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                          : isMedium
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          : "bg-black/[0.06] text-black/70 border-black/15"
                      }`}
                    >
                      {issue.severity} SEVERITY
                    </span>
                  </div>
                  <p className="text-xs text-black/80 leading-relaxed">
                    {issue.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
