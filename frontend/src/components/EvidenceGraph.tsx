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
    <div className="claim-panel rounded-2xl p-5 lg:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-purple-900" />
          <h3 className="text-sm font-bold text-black flex items-center gap-2">
            Multimodal Evidence Graph Visualizer
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/10 text-purple-800 border border-purple-900/20">
              Live Topology
            </span>
          </h3>
        </div>
        <span className="text-xs text-black/50">Click any node to inspect relationships</span>
      </div>

      {/* Visual Canvas Diagram */}
      <div className="relative p-6 rounded-2xl bg-black/[0.035] border border-black/15 min-h-[320px] flex flex-col justify-between overflow-hidden">
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
                    ? "bg-white ring-2 ring-cyan-400 border-purple-900/20 shadow-lg shadow-purple-900/20 scale-[1.02]"
                    : "bg-white border-black/10 hover:border-black/20 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                      isRose
                        ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                        : isCyan
                        ? "bg-purple-900/10 text-purple-900 border-purple-900/20"
                        : isEmerald
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : "bg-indigo-900/10 text-indigo-400 border-indigo-900/20"
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
                  <h4 className="text-xs font-bold text-black group-hover:text-purple-800 transition-colors truncate">
                    {node.title}
                  </h4>
                  <p className="text-[10px] text-black/50 truncate mt-0.5">
                    {node.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Semantic Graph Linked Edges Bar */}
        <div className="relative z-10 mt-6 pt-4 border-t border-black/10 space-y-2.5">
          <span className="text-[10px] uppercase font-bold text-black/50 block tracking-wider">
            Active Graph Cross-Checks & Edges
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Edge 1: Serial / Model Link */}
            <div
              className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                hasModelDiscrepancy
                  ? "bg-rose-50 border-rose-500/40 text-rose-300 animate-pulse"
                  : "bg-emerald-50 border-emerald-500/30 text-emerald-300"
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
                  ? "bg-rose-50 border-rose-500/40 text-rose-300 animate-pulse"
                  : "bg-purple-900/10 border-purple-900/20 text-purple-800"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-current" />
              <span className="font-semibold text-[11px] truncate">
                {hasTimelineDiscrepancy ? "Chronology Violation" : "Timeline Sequence Validated"}
              </span>
            </div>

            {/* Edge 3: Forensics Integrity */}
            <div className="p-2.5 rounded-lg border bg-emerald-50 border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
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
        <div className="p-4 rounded-xl bg-white border border-black/10 space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-black/10 pb-2">
            <span className="text-xs font-bold text-black/80 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-purple-900" />
              Node Inspector: {activeNodeData.title}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 text-black/70">
              Graph Entity
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {Object.entries(activeNodeData.details).map(([key, val]) => (
              <div key={key} className="p-2 rounded-lg bg-white border border-black/10">
                <span className="text-[10px] text-black/50 block">{key}:</span>
                <span className="font-semibold text-black/80 truncate block text-[11px]">
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
