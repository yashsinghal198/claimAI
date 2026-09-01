"use client";

import React from "react";
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, GitCompare, ChevronDown } from "lucide-react";
import { DemoPreset } from "@/types";

export const PRESETS: DemoPreset[] = [
  {
    id: "preset-clean-complete",
    name: "Clean & Complete Claim",
    description: "Dell Inspiron laptop with matching receipt, warranty, clear damage photo, and serial tag.",
    tag: "95% Ready",
    incidentDescription:
      "On August 14, 2024, my Dell Inspiron laptop slipped from my desk onto a hardwood floor. The screen cracked across the display panel. Purchase receipt, warranty certificate, and serial tag photo attached.",
    invoiceSampleText:
      "Dell Official Store Invoice #INV-2024-8891\nDate: 2024-02-10\nItem: Dell Inspiron 15 (Model 5510)\nSerial: SN-DELL-INSP-90812\nTotal: $1,299.00\nCustomer: Yash P.",
    warrantySampleText:
      "Dell Premium Care Extended Warranty\nCovered System: Dell Inspiron 15 (Model 5510)\nSerial: SN-DELL-INSP-90812\nCoverage Period: Feb 2024 - Feb 2027\nAccidental Damage: Covered.",
    photoSampleName: "dell_inspiron_damage_serial_tag.jpg",
  },
  {
    id: "preset-model-mismatch",
    name: "Model Mismatch & Missing Serial Tag",
    description: "Invoice says Dell Inspiron 15, but warranty says Dell XPS 13, missing serial tag photo.",
    tag: "76% Ready",
    incidentDescription:
      "On July 18, 2024, my laptop fell off the office desk causing power port damage and screen crack. Requesting warranty repair.",
    invoiceSampleText:
      "Dell Store Receipt #INV-DELL-99881\nDate: 2024-01-10\nProduct: Dell Inspiron 15 (Model 5510)\nSerial: SN-DELL-INSP-7722\nPrice: $1,199.00",
    warrantySampleText:
      "Dell Support Plan Certificate\nRegistered System: Dell XPS 13 (Model 9315)\nSerial: SN-DELL-XPS13-1100\nCoverage Status: Active",
    photoSampleName: "laptop_damage_no_serial_tag.jpg",
  },
  {
    id: "preset-suspected-duplicate",
    name: "Suspected Duplicate / Low Readiness",
    description: "Missing receipt, duplicate image warning triggered, missing incident date.",
    tag: "35% Ready",
    incidentDescription:
      "Device damaged recently. Screen cracked and casing dented. Need urgent repair.",
    invoiceSampleText: "", // Missing Receipt
    warrantySampleText: "1-Year Basic Hardware Policy\nCoverage: Limited",
    photoSampleName: "recycled_stock_damage_photo.jpg",
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
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const preset = PRESETS.find((p) => p.id === selectedId);
    if (preset) {
      onSelectPreset(preset);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md space-y-4">
      {/* Top Header & Quick-Select Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-slate-100">
            Preset Demo Scenarios
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            Judge Quick-Select
          </span>
        </div>

        {/* Dropdown Menu */}
        <div className="relative min-w-[260px]">
          <select
            value={activePresetId || ""}
            onChange={handleDropdownChange}
            className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer appearance-none pr-8"
          >
            <option value="" disabled>
              Select Preset Scenario...
            </option>
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.tag})
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          const isHigh = preset.id === "preset-clean-complete";
          const isMedium = preset.id === "preset-model-mismatch";

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`group text-left p-3.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? "bg-indigo-950/60 border-cyan-400 ring-1 ring-cyan-400/50 shadow-lg shadow-cyan-500/10"
                  : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {preset.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
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
                    <GitCompare className="w-3 h-3 text-amber-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-rose-400" />
                  )}
                  {isActive ? "Preset Loaded" : "Load Preset"}
                </span>
                <span className="text-cyan-400 font-bold group-hover:translate-x-0.5 transition-transform">
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
