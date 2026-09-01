"use client";

import React from "react";
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, GitCompare } from "lucide-react";
import { DemoPreset } from "@/types";

export const PRESETS: DemoPreset[] = [
  {
    id: "preset-dell-mismatch",
    name: "Model Mismatch (Dell XPS 15 vs 13)",
    description: "Invoice lists Dell XPS 15 (9530) but Warranty certificate lists Dell XPS 13 (9315).",
    tag: "Model Conflict (50%)",
    incidentDescription:
      "On July 18, 2024, my laptop fell off the desk in my office. The screen shattered and power port was bent. Need warranty repair.",
    invoiceSampleText: "Dell Official Store Invoice #INV-DELL-99881\nDate: 2024-01-10\nProduct: Dell XPS 15 (Model 9530) OLED\nSerial: SN-DELL-XPS15-7722\nPrice: $1,899.00\nCustomer: Yash P.",
    warrantySampleText: "Dell Premium Support Plan\nRegistered System: Dell XPS 13 (Model 9315)\nSerial: SN-DELL-XPS13-1100\nCoverage Status: Active through Jan 2027",
    photoSampleName: "dell_laptop_shattered_screen.jpg",
  },
  {
    id: "preset-valid",
    name: "Complete & Valid Claim",
    description: "MacBook Pro M3 screen crack with matching invoice, warranty & damage photos.",
    tag: "High Score (95%)",
    incidentDescription:
      "On August 14, 2024, my laptop fell off the desk onto a hardwood floor. The screen cracked across the display panel and lines are flickering. Serial tag and purchase receipt attached.",
    invoiceSampleText: "Apple Store Official Invoice #INV-2024-8891\nDate: 2024-02-10\nItem: MacBook Pro M3 16-inch\nSerial: MBP-M3-90812\nTotal: $2,499.00\nCustomer: Yash P.",
    warrantySampleText: "AppleCare+ Extended Warranty Policy\nCoverage Period: Feb 2024 - Feb 2027\nCovered Hardware: MacBook Pro M3 (MBP-M3-90812)\nAccidental Damage: Covered with deductible.",
    photoSampleName: "laptop_crack_angle1.jpg",
  },
  {
    id: "preset-timeline-conflict",
    name: "Timeline Anomaly Conflict",
    description: "Purchase date recorded in invoice is AFTER stated incident occurrence.",
    tag: "Timeline Error (30%)",
    incidentDescription:
      "Liquid spilled on gaming keyboard on 2024-04-12 causing short circuit and key failure.",
    invoiceSampleText: "Invoice #INV-2024-9981\nDate: 2024-09-20\nProduct: Mechanical Gaming Keyboard Pro\nTotal: $180.00",
    warrantySampleText: "1-Year Limited Hardware Guarantee",
    photoSampleName: "keyboard_spill_damage.jpg",
  },
];

interface DemoPresetsProps {
  onSelectPreset: (preset: DemoPreset) => void;
  activePresetId: string | null;
}

export const DemoPresets: React.FC<DemoPresetsProps> = ({
  onSelectPreset,
  activePresetId,
}) => {
  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200">
            Quick-Test Demo Scenarios
          </h2>
        </div>
        <span className="text-[11px] text-slate-400">
          Click any preset to auto-load sample evidence & trigger graph analysis
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          const isHigh = preset.id === "preset-valid";
          const isDellMismatch = preset.id === "preset-dell-mismatch";

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`group text-left p-3.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? "bg-indigo-950/50 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-500/10"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {preset.name}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isHigh
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        : isDellMismatch
                        ? "bg-rose-500/10 text-rose-300 border-rose-500/30"
                        : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    {preset.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  {isHigh ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : isDellMismatch ? (
                    <GitCompare className="w-3 h-3 text-rose-400" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                  )}
                  {isActive ? "Loaded" : "Load Scenario"}
                </span>
                <span className="text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
