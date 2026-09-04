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
    <div className="claim-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-black/80">
            Remediation Action Plan
          </h3>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-black/60 hover:text-black px-2.5 py-1 rounded-lg bg-black/[0.05] hover:bg-black/[0.1] border border-black/15 transition-colors"
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
        <div className="flex items-center justify-between text-[11px] text-black/50 mb-1.5">
          <span>Remediation Progress</span>
          <span className="font-semibold text-black/70">
            {completedIndexes.size} / {actions.length} Completed ({progress}%)
          </span>
        </div>
        <div className="w-full h-2 bg-black/[0.1] rounded-full overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all duration-500"
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
                  ? "bg-black/[0.035] border-black/10 opacity-60 line-through text-black/55"
                  : "bg-white/50 border-black/12 hover:border-black/35 text-black hover:bg-white"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors ${
                  isDone
                    ? "bg-emerald-500 border-emerald-400 text-black"
                    : "border-black/25 hover:border-black bg-white"
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
