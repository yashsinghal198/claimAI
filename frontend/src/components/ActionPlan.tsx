"use client";

import React, { useState } from "react";
import { ListChecks, CheckCircle2, ArrowRight, Copy, Check } from "lucide-react";

interface ActionPlanProps {
  actions: string[];
}

export const ActionPlan: React.FC<ActionPlanProps> = ({ actions }) => {
  const [completedIndexes, setCompletedIndexes] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  const toggleIndex = (index: number) => {
    const next = new Set(completedIndexes);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setCompletedIndexes(next);
  };

  const handleCopy = () => {
    const text = actions
      .map((action, i) => `${i + 1}. ${action}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progress = actions.length > 0
    ? Math.round((completedIndexes.size / actions.length) * 100)
    : 100;

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Remediation Action Plan
          </h3>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy Steps</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
          <span>Remediation Progress</span>
          <span className="font-semibold text-slate-300">
            {completedIndexes.size} / {actions.length} Completed ({progress}%)
          </span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {actions.map((action, idx) => {
          const isDone = completedIndexes.has(idx);

          return (
            <div
              key={`${action}-${idx}`}
              onClick={() => toggleIndex(idx)}
              className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                isDone
                  ? "bg-slate-950/40 border-slate-800 opacity-60 line-through text-slate-400"
                  : "bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200 hover:bg-slate-900/60"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                  isDone
                    ? "bg-emerald-500 border-emerald-400 text-slate-950"
                    : "border-slate-700 hover:border-cyan-400 bg-slate-900"
                }`}
              >
                {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>

              <div className="flex-1">
                <span className="text-xs leading-relaxed font-medium">
                  {idx + 1}. {action}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
