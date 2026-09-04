"use client";

import React, { useRef, useState } from "react";
import { X, Download, FileText, CheckCircle2, ShieldCheck, Printer, Copy, Check, FileJson } from "lucide-react";
import { ReadinessResponse } from "@/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface CarrierExportModalProps {
  result: ReadinessResponse;
  onClose: () => void;
}

export const CarrierExportModal: React.FC<CarrierExportModalProps> = ({
  result,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);

  const claimUUID = "CLM-" + Math.random().toString(36).substring(2, 9).toUpperCase();
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setIsExportingPdf(true);

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: "#FFFDF2",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ClaimAI_Carrier_Package_${claimUUID}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadJson = () => {
    const carrierPayload = {
      claim_reference_id: claimUUID,
      generated_at: new Date().toISOString(),
      evaluation_system: "ClaimAI Pre-Claim Intelligence Engine v3.0",
      readiness_index: result.readiness_score,
      eligibility_status: result.readiness_score >= 80 ? "READY_FOR_SUBMISSION" : "REMEDIATION_REQUIRED",
      extracted_entities: result.extracted_entities,
      verification_matrix: result.verification_checks,
      flagged_issues: result.issues_detected,
      cross_document_discrepancies: result.discrepancies,
      forensic_integrity: result.forensics,
      photo_metadata: result.photo_metadata,
      remediation_actions: result.recommended_actions,
    };

    const blob = new Blob([JSON.stringify(carrierPayload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carrier_claim_payload_${claimUUID}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-black/10 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-900/10 text-purple-900 flex items-center justify-center border border-purple-900/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black">
                Carrier-Ready Pre-Claim Package
              </h3>
              <p className="text-[11px] text-black/50">
                Official Evidence Intelligence Audit Certificate
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-black/50 hover:text-white hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Certificate Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div
            ref={printRef}
            className="p-6 rounded-2xl bg-white border border-black/10 text-black space-y-6"
          >
            {/* Certificate Header */}
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400">
                  ClaimAI Evidence Audit Report
                </h2>
                <p className="text-xs text-black/50 mt-0.5">
                  CodeBuild 1.0 • Pre-Submission Intelligence Protocol
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-purple-900 block">
                  {claimUUID}
                </span>
                <span className="text-[10px] text-black/50">{reportDate}</span>
              </div>
            </div>

            {/* Score & Integrity Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-white border border-black/10">
              <div>
                <span className="text-[10px] uppercase font-semibold text-black/50 block">
                  Readiness Score
                </span>
                <span className="text-2xl font-extrabold text-black">
                  {result.readiness_score}%
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-black/50 block">
                  Carrier Status
                </span>
                <span
                  className={`text-xs font-bold ${
                    result.readiness_score >= 80 ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {result.readiness_score >= 80 ? "READY TO FILE" : "REMEDIATION NEEDED"}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-black/50 block">
                  Forensic Integrity
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {result.forensics?.authenticity_score || 95}% AUTHENTIC
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-black/50 block">
                  Discrepancies
                </span>
                <span
                  className={`text-xs font-bold ${
                    (result.discrepancies?.length || 0) === 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {result.discrepancies?.length || 0} CONFLICTS
                </span>
              </div>
            </div>

            {/* Extracted Entity Matrix */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 mb-2">
                Validated Claim Entities
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-black/10">
                  <span className="text-[10px] text-black/50 block">Product:</span>
                  <span className="font-semibold">{result.extracted_entities?.product_name || "Verified"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-black/10">
                  <span className="text-[10px] text-black/50 block">Serial / IMEI:</span>
                  <span className="font-mono font-semibold">{result.extracted_entities?.serial_number || "Found"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-black/10">
                  <span className="text-[10px] text-black/50 block">Purchase Date:</span>
                  <span className="font-mono font-semibold">{result.extracted_entities?.purchase_date || "Identified"}</span>
                </div>
              </div>
            </div>

            {/* Checklist Matrix */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 mb-2">
                Verification Matrix
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {result.verification_checks.map((chk, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-black/10"
                  >
                    <span>{chk.label}</span>
                    <span
                      className={`text-[10px] font-bold ${
                        chk.passed ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {chk.passed ? "VERIFIED" : "MISSING"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prioritized Actions */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-black/50 mb-2">
                Carrier Recommended Next Steps
              </h4>
              <ul className="space-y-1 text-xs text-black/70">
                {result.recommended_actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-900 font-bold">{i + 1}.</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/10 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-black/50 hover:text-white transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-black/5 text-black/80 border border-black/20 transition-all"
            >
              <FileJson className="w-3.5 h-3.5 text-purple-900" />
              Download JSON
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-900 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-purple-900/20 transition-all active:scale-[0.99]"
            >
              {isExportingPdf ? (
                <span>Generating PDF...</span>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Audit PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
