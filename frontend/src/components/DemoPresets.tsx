"use client";

import React from "react";
import { Sparkles, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { DemoPreset } from "@/types";

export const PRESETS: DemoPreset[] = [
  {
    id: "preset-valid",
    name: "Complete & Valid Claim",
    description: "MacBook Pro M3 screen crack with matching invoice, warranty & 2 damage photos.",
    tag: "High Score (90+%)",
    incidentDescription:
      "On August 14, 2024, my laptop fell off the desk onto a hardwood floor. The screen cracked across the display panel and lines are flickering. Serial tag and purchase receipt attached.",
    invoiceSampleText: "Invoice #INV-2024-8891\nDate: 2024-02-10\nItem: MacBook Pro M3 16-inch\nSerial: MBP-M3-90812\nTotal: $2,499.00\nCustomer: Yash P.",
    warrantySampleText: "AppleCare+ Extended Warranty Policy\nCoverage Period: Feb 2024 - Feb 2027\nCovered Hardware: MacBook Pro M3 (MBP-M3-90812)\nAccidental Damage: Covered with deductible.",
    photoSampleName: "laptop_crack_angle1.jpg",
  },
  {
    id: "preset-serial-mismatch",
    name: "Serial Number Mismatch",
    description: "Warranty policy lists standard model while invoice lists Ultra model.",
    tag: "Discrepancy (55%)",
    incidentDescription:
      "Smartphone camera lens cracked while hiking in June 2024. Need repair coverage before trip.",
    invoiceSampleText: "Invoice #TECH-9912\nDate: 2024-01-20\nProduct: Galaxy S24 Ultra 512GB Titanium\nSerial: SN-ULTRA-7788",
    warrantySampleText: "Device Care Plan\nProduct: Galaxy S24 Standard 128GB\nSerial: SN-BASE-1122\nStatus: Active",
    photoSampleName: "phone_camera_crack.jpg",
  },
  {
    id: "preset-missing-invoice",
    name: "Incomplete Evidence",
    description: "Missing proof of purchase and no serial number label photo.",
    tag: "Low Score (35%)",
    incidentDescription: "TV stopped working after lightning surge yesterday.",
    invoiceSampleText: "",
    warrantySampleText: "Standard Limited 1-Year Manufacturer Warranty",
    photoSampleName: "tv_black_screen.jpg",
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
          Click any preset to auto-load sample evidence
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          const isHigh = preset.id === "preset-valid";
          const isMedium = preset.id === "preset-serial-mismatch";

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
                        : isMedium
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                        : "bg-rose-500/10 text-rose-300 border-rose-500/30"
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
                  ) : isMedium ? (
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-rose-400" />
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
