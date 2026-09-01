"use client";

import React, { useState } from "react";
import {
  FileText,
  Camera,
  FileCheck2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Zap,
  CheckCircle,
  FileSearch,
  Download,
  GitBranch,
  LayoutDashboard,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { DemoPresets, PRESETS } from "@/components/DemoPresets";
import { Dropzone } from "@/components/Dropzone";
import { ReadinessGauge } from "@/components/ReadinessGauge";
import { AuthenticityShield } from "@/components/AuthenticityShield";
import { DiscrepancyInspector } from "@/components/DiscrepancyInspector";
import { ExtractedEntitiesCard } from "@/components/ExtractedEntitiesCard";
import { PhotoMetadataCard } from "@/components/PhotoMetadataCard";
import { VerificationChecklist } from "@/components/VerificationChecklist";
import { IssuesFeed } from "@/components/IssuesFeed";
import { ActionPlan } from "@/components/ActionPlan";
import { EvidenceGraph } from "@/components/EvidenceGraph";
import { CarrierExportModal } from "@/components/CarrierExportModal";
import { VisualScanBanner } from "@/components/VisualScanBanner";

import { ReadinessResponse, DemoPreset } from "@/types";
import { analyzeClaimEvidence } from "@/services/api";

export default function ClaimAIDashboard() {
  // Form State
  const [incidentDescription, setIncidentDescription] = useState("");
  const [invoiceFiles, setInvoiceFiles] = useState<File[]>([]);
  const [warrantyFiles, setWarrantyFiles] = useState<File[]>([]);
  const [damagePhotoFiles, setDamagePhotoFiles] = useState<File[]>([]);

  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ReadinessResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Phase 3 UI State
  const [activeTab, setActiveTab] = useState<"overview" | "graph">("overview");
  const [showExportModal, setShowExportModal] = useState(false);

  // Load a demo scenario
  const handleSelectPreset = (preset: DemoPreset) => {
    setActivePresetId(preset.id);
    setIncidentDescription(preset.incidentDescription);

    if (preset.invoiceSampleText) {
      const invoiceBlob = new Blob([preset.invoiceSampleText], { type: "text/plain" });
      const invoiceFile = new File([invoiceBlob], "purchase_invoice.txt", { type: "text/plain" });
      setInvoiceFiles([invoiceFile]);
    } else {
      setInvoiceFiles([]);
    }

    if (preset.warrantySampleText) {
      const warrantyBlob = new Blob([preset.warrantySampleText], { type: "text/plain" });
      const warrantyFile = new File([warrantyBlob], "warranty_policy.txt", { type: "text/plain" });
      setWarrantyFiles([warrantyFile]);
    } else {
      setWarrantyFiles([]);
    }

    const photoBlob = new Blob(["SYNTHETIC_IMAGE_BYTES_WITH_OCR_TAGS"], { type: "image/jpeg" });
    const photoFile = new File([photoBlob], preset.photoSampleName, { type: "image/jpeg" });
    setDamagePhotoFiles([photoFile]);

    setErrorMessage(null);
  };

  // Reset entire workspace
  const handleReset = () => {
    setIncidentDescription("");
    setInvoiceFiles([]);
    setWarrantyFiles([]);
    setDamagePhotoFiles([]);
    setActivePresetId(null);
    setResult(null);
    setErrorMessage(null);
  };

  // Trigger claim analysis
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!incidentDescription.trim() && invoiceFiles.length === 0 && damagePhotoFiles.length === 0) {
      setErrorMessage("Please enter an incident narrative or upload evidence to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await analyzeClaimEvidence({
        incidentDescription,
        invoiceFile: invoiceFiles[0] || null,
        warrantyFile: warrantyFiles[0] || null,
        damagePhotoFiles,
      });

      setResult(response);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during evidence analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Navbar onReset={handleReset} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Hero Section / Tagline */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950/80 border border-slate-800/80 p-6 lg:p-8 backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5" />
              Pre-Submission Evidence Validation & Forensics Engine
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Before you submit a claim, know whether your evidence is{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
                actually ready.
              </span>
            </h1>

            <p className="text-sm text-slate-400 mt-2.5 leading-relaxed max-w-2xl">
              ClaimAI cross-references invoices, warranty contracts, photo OCR serial tags, and incident statements. Detect model conflicts, verify coverage timelines, and export carrier-ready packages.
            </p>
          </div>
        </section>

        {/* Demo Presets Quick Bar */}
        <DemoPresets
          onSelectPreset={handleSelectPreset}
          activePresetId={activePresetId}
        />

        {/* Main 2-Column Evidence Studio & Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Evidence Ingestion Studio (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 lg:p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-slate-200">
                    Evidence Ingestion Studio
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400">
                  Multimodal Ingestion
                </span>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-4">
                {/* Incident Narrative Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                    <span>Incident Narrative & Statement</span>
                    <span className="text-[10px] text-slate-400 font-normal">What happened & when?</span>
                  </label>
                  <textarea
                    rows={4}
                    value={incidentDescription}
                    onChange={(e) => setIncidentDescription(e.target.value)}
                    placeholder="Describe how damage occurred, incident date (e.g. 2024-07-18), location, and any relevant details..."
                    className="w-full text-xs p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 transition-all leading-relaxed"
                  />
                </div>

                {/* Proof of Purchase / Invoice */}
                <Dropzone
                  label="Purchase Receipt or Invoice"
                  sublabel="PDF, Image, or Text"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                  icon="pdf"
                  files={invoiceFiles}
                  onFilesChange={setInvoiceFiles}
                  required
                />

                {/* Warranty Policy Document */}
                <Dropzone
                  label="Warranty / Policy Document"
                  sublabel="PDF, Image, or Text"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                  icon="pdf"
                  files={warrantyFiles}
                  onFilesChange={setWarrantyFiles}
                />

                {/* Damage & Serial Tag Photos */}
                <Dropzone
                  label="Damage & Serial Number Photos"
                  sublabel="Multiple Angles / Tags"
                  accept=".png,.jpg,.jpeg,.webp"
                  icon="image"
                  multiple
                  files={damagePhotoFiles}
                  onFilesChange={setDamagePhotoFiles}
                  required
                />

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit / Analyze Action Button */}
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs tracking-wide uppercase transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isAnalyzing
                      ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white shadow-cyan-500/20 active:scale-[0.99]"
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                      <span>Synthesizing Evidence Graph...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-cyan-200" />
                      <span>Validate Evidence Readiness</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Intelligence & Readiness Dashboard (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {isAnalyzing ? (
              <VisualScanBanner />
            ) : result ? (
              <div className="space-y-5 animate-in fade-in duration-500">
                {/* View Switcher Tabs & Carrier Export Button */}
                <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveTab("overview")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === "overview"
                          ? "bg-slate-800 text-cyan-400 shadow"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Readiness Overview
                    </button>

                    <button
                      onClick={() => setActiveTab("graph")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeTab === "graph"
                          ? "bg-slate-800 text-cyan-400 shadow"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      Evidence Graph
                    </button>
                  </div>

                  <button
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all active:scale-[0.99]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Carrier Package
                  </button>
                </div>

                {activeTab === "graph" ? (
                  <EvidenceGraph result={result} />
                ) : (
                  <>
                    {/* Readiness Score Gauge */}
                    <ReadinessGauge score={result.readiness_score} />

                    {/* Authenticity & Integrity Shield */}
                    <AuthenticityShield forensics={result.forensics} />

                    {/* Side-by-Side Discrepancy Conflict Inspector */}
                    <DiscrepancyInspector discrepancies={result.discrepancies} />

                    {/* Parsed Entities Card */}
                    <ExtractedEntitiesCard entities={result.extracted_entities} />

                    {/* Photo EXIF & Camera Integrity Card */}
                    <PhotoMetadataCard metadataList={result.photo_metadata} />

                    {/* Verification Checklist */}
                    <VerificationChecklist checks={result.verification_checks} />

                    {/* Detected Issues */}
                    <IssuesFeed issues={result.issues_detected} />

                    {/* Actionable Remediation Plan */}
                    <ActionPlan actions={result.recommended_actions} />
                  </>
                )}
              </div>
            ) : (
              /* Welcome / Empty State Before First Analysis */
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 lg:p-12 text-center backdrop-blur-md flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                  <FileCheck2 className="w-8 h-8" />
                </div>

                <div className="max-w-md">
                  <h3 className="text-base font-bold text-slate-100">
                    Awaiting Claim Evidence
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Upload documents on the left studio or click one of the{" "}
                    <span className="text-cyan-300 font-semibold">Demo Scenarios</span> above to initiate automated cross-evidence intelligence.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full max-w-sm pt-2 text-left">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <p className="text-[11px] font-bold text-slate-200">🔍 OCR & Forgery Forensics</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Extracts serials, dates & checks visual tampering</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <p className="text-[11px] font-bold text-slate-200">📊 Interactive Graph</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Maps cross-document entity topology & contradictions</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Carrier Export Modal */}
      {showExportModal && result && (
        <CarrierExportModal
          result={result}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        <p>ClaimAI — CodeBuild 1.0 Hackathon • Team Tribit • Built with Next.js, FastAPI & LangChain GPT-4o</p>
      </footer>
    </div>
  );
}
