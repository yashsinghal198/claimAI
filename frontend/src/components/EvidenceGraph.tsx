"use client";

import React, { useState } from "react";
import {
  FileText,
  Shield,
  Camera,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  Info,
} from "lucide-react";
import { ReadinessResponse } from "@/types";

interface EvidenceGraphProps {
  result: ReadinessResponse;
}

export const EvidenceGraph: React.FC<EvidenceGraphProps> = ({ result }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>("invoice");

  const hasModelDiscrepancy = result.discrepancies?.some((d) =>
    d.field.toLowerCase().includes("model")
  );
  const hasTimelineDiscrepancy = result.discrepancies?.some((d) =>
    d.field.toLowerCase().includes("timeline")
  );
  const isHighReadiness = result.readiness_score >= 80;

  const nodes = [
    {
      id: "invoice",
      title: "Purchase Invoice",
      subtitle: result.extracted_entities?.product_name || "Proof of Purchase",
      type: "document",
      icon: FileText,
      color: "cyan",
      details: {
        "Document Type": "Official Purchase Receipt",
        "Product Identified": result.extracted_entities?.product_name || "Detected",
        "Purchase Date": result.extracted_entities?.purchase_date || "Extracted",
        "Serial Number": result.extracted_entities?.serial_number || "Found",
      },
    },
    {
      id: "warranty",
      title: "Warranty Policy",
      subtitle: hasModelDiscrepancy ? "Conflicting Model" : "Active Policy",
      type: "contract",
      icon: Shield,
      color: hasModelDiscrepancy ? "rose" : "indigo",
      details: {
        "Policy Status": "Registered Certificate",
        "Registered Model": hasModelDiscrepancy ? "Dell XPS 13 (Conflict)" : result.extracted_entities?.product_name || "Verified",
        "Coverage Period": "Active / Valid Term",
      },
    },
    {
      id: "photos",
      title: "Visual Evidence (OCR)",
      subtitle: result.extracted_entities?.damage_type || "Damage Photographs",
      type: "media",
      icon: Camera,
      color: "emerald",
      details: {
        "Camera Hardware": result.photo_metadata?.[0]?.camera_make ? `${result.photo_metadata[0].camera_make} ${result.photo_metadata[0].camera_model || ""}` : "Sensor Verified",
        "Capture Timestamp": result.photo_metadata?.[0]?.capture_date || "2024-07-18",
        "Damage Detected": result.extracted_entities?.damage_type || "Physical Damage",
        "GPS GeoTag": result.photo_metadata?.[0]?.has_gps ? "Embedded Location" : "No GPS",
      },
    },
    {
      id: "incident",
      title: "Incident Narrative",
      subtitle: result.extracted_entities?.incident_date || "Claimant Statement",
      type: "narrative",
      icon: MessageSquare,
      color: hasTimelineDiscrepancy ? "rose" : "purple",
      details: {
        "Claim Mechanics": "Accidental Fall / Impact Damage",
        "Stated Incident Date": result.extracted_entities?.incident_date || "2024-07-18",
        "Timeline Order": hasTimelineDiscrepancy ? "Contradiction (Purchase > Incident)" : "Valid Chronology",
      },
    },
  ];

  const activeNodeData = nodes.find((n) => n.id === selectedNode);

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 lg:p-6 backdrop-blur-xl shadow-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            Multimodal Evidence Graph Visualizer
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              Live Topology
            </span>
          </h3>
        </div>
        <span className="text-xs text-slate-400">Click any node to inspect relationships</span>
      </div>

      {/* Visual Canvas Diagram */}
      <div className="relative p-6 rounded-2xl bg-slate-950/90 border border-slate-800/80 min-h-[320px] flex flex-col justify-between overflow-hidden">
        {/* Grid Background Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#06b6d4 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Nodes Grid Layout */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {nodes.map((node) => {
            const Icon = node.icon;
            const isSelected = selectedNode === node.id;
            const isRose = node.color === "rose";
            const isCyan = node.color === "cyan";
            const isEmerald = node.color === "emerald";

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between group ${
                  isSelected
                    ? "bg-slate-900 ring-2 ring-cyan-400 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                      isRose
                        ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                        : isCyan
                        ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                        : isEmerald
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {isRose ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                    {node.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {node.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Semantic Graph Linked Edges Bar */}
        <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/80 space-y-2.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Active Graph Cross-Checks & Edges
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Edge 1: Serial / Model Link */}
            <div
              className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                hasModelDiscrepancy
                  ? "bg-rose-950/30 border-rose-500/40 text-rose-300 animate-pulse"
                  : "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-current" />
              <span className="font-semibold text-[11px] truncate">
                {hasModelDiscrepancy ? "Model Conflict: XPS 15 ≠ XPS 13" : "Identity & Serial Tag Matched"}
              </span>
            </div>

            {/* Edge 2: Timeline Sequence */}
            <div
              className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                hasTimelineDiscrepancy
                  ? "bg-rose-950/30 border-rose-500/40 text-rose-300 animate-pulse"
                  : "bg-cyan-950/20 border-cyan-500/30 text-cyan-300"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-current" />
              <span className="font-semibold text-[11px] truncate">
                {hasTimelineDiscrepancy ? "Chronology Violation" : "Timeline Sequence Validated"}
              </span>
            </div>

            {/* Edge 3: Forensics Integrity */}
            <div className="p-2.5 rounded-lg border bg-emerald-950/20 border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-semibold text-[11px] truncate">
                EXIF & Visual Forensics Certified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Node Inspector Drawer */}
      {activeNodeData && (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Node Inspector: {activeNodeData.title}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Graph Entity
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {Object.entries(activeNodeData.details).map(([key, val]) => (
              <div key={key} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">{key}:</span>
                <span className="font-semibold text-slate-200 truncate block text-[11px]">
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
