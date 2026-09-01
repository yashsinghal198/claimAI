"use client";

import React, { useState } from "react";
import { GitCompare, AlertTriangle, ArrowRight, ShieldAlert, FileText, CheckCircle2, Zap, Sparkles } from "lucide-react";
import { CrossDocumentDiscrepancy } from "@/types";

interface DiscrepancyInspectorProps {
  discrepancies?: CrossDocumentDiscrepancy[];
  onAutoResolve?: (discrepancy: CrossDocumentDiscrepancy) => void;
}

export const DiscrepancyInspector: React.FC<DiscrepancyInspectorProps> = ({
  discrepancies = [],
  onAutoResolve,
}) => {
  const [resolvedFields, setResolvedFields] = useState<string[]>([]);

  if (!discrepancies || discrepancies.length === 0) {
    return null;
  }

  const activeDiscrepancies = discrepancies.filter(
    (d) => !resolvedFields.includes(d.field)
  );

  const handleResolve = (item: CrossDocumentDiscrepancy) => {
    setResolvedFields((prev) => [...prev, item.field]);
    if (onAutoResolve) {
      onAutoResolve(item);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-rose-500/40 rounded-2xl p-5 lg:p-6 backdrop-blur-md relative overflow-hidden shadow-2xl shadow-rose-950/20">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            Cross-Document Conflict Inspector
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
              {activeDiscrepancies.length} Active Conflicts
            </span>
          </h3>
        </div>
        <span className="text-[11px] text-rose-300 font-semibold">
          High Rejection Risk
        </span>
      </div>

      <div className="space-y-4">
        {discrepancies.map((item, idx) => {
          const isResolved = resolvedFields.includes(item.field);

          if (isResolved) {
            return (
              <div
                key={`${item.field}-${idx}`}
                className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between animate-in fade-in duration-300"
              >
                <div className="flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">{item.field} Auto-Normalized & Resolved:</span>
                  <span className="font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    "{item.value_a}" (Matched)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                  +25 PTS RECOVERED
                </span>
              </div>
            );
          }

          return (
            <div
              key={`${item.field}-${idx}`}
              className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-3 transition-all hover:border-rose-500/60"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {item.field}
                </span>

                {/* Instant Fix Button */}
                <button
                  onClick={() => handleResolve(item)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 hover:text-white border border-indigo-500/40 text-[11px] font-bold transition-all shadow-sm active:scale-95"
                  title="Auto-map model numbers and normalize product identity"
                >
                  <Zap className="w-3 h-3 text-cyan-300" />
                  <span>Instant Auto-Fix</span>
                </button>
              </div>

              {/* Side-by-Side Comparison Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                {/* Source A */}
                <div className="space-y-1 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-cyan-400" />
                    {item.source_a}
                  </span>
                  <p className="text-xs font-mono font-bold text-rose-300 bg-rose-950/40 p-1.5 rounded border border-rose-900/50">
                    "{item.value_a}"
                  </p>
                </div>

                {/* Source B */}
                <div className="space-y-1 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-indigo-400" />
                    {item.source_b}
                  </span>
                  <p className="text-xs font-mono font-bold text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-900/50">
                    "{item.value_b}"
                  </p>
                </div>
              </div>

              {/* Explanation Note */}
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{item.explanation}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
