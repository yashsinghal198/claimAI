"use client";

import React from "react";
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, GitCompare } from "lucide-react";
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
  return (
    <div id="demo-presets" className="claim-panel claim-panel-hover rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Top Header */}
      <div className="flex items-center gap-2 border-b border-black/10 pb-3.5">
        <Sparkles className="w-4 h-4 text-purple-900" />
        <h2 className="text-sm font-bold text-black">
          Preset Demo Scenarios
        </h2>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/10 text-purple-800 border border-purple-900/20">
          Judge Quick-Select
        </span>
      </div>

      {/* Preset Cards Grid */}
      <div className="claim-stagger grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESETS.map((preset) => {
          const isActive = activePresetId === preset.id;
          const isHigh = preset.id === "preset-clean-complete";
          const isMedium = preset.id === "preset-model-mismatch";

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`group text-left p-3.5 rounded-xl border relative overflow-hidden flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
                isActive
                  ? "bg-cyan-300/[0.08] border-cyan-300 ring-1 ring-cyan-300/50 shadow-lg shadow-purple-900/20"
                  : "bg-white border-black/10 hover:border-black/20 hover:bg-white"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-black group-hover:text-purple-800 transition-colors">
                    {preset.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isHigh
                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                        : isMedium
                        ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
                        : "bg-rose-500/10 text-rose-700 border-rose-500/30"
                    }`}
                  >
                    {preset.tag}
                  </span>
                </div>
                <p className="text-[11px] text-black/50 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between text-[11px] text-black/50">
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
                <span className="text-purple-900 font-bold group-hover:translate-x-0.5 transition-transform">
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
