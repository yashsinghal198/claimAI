"use client";

import React, { useState, useEffect, useRef } from "react";
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
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
import { InterviewerAgent } from "@/components/InterviewerAgent";
import { SmartCameraModal } from "@/components/SmartCameraModal";
import { AIAssistantWidget } from "@/components/AIAssistantWidget";
import { VisualScanBanner } from "@/components/VisualScanBanner";

import { CubeMatrix } from "@/components/ui/voxel-matrix";
import SplitText from "@/components/react-bits/SplitText";
import GradientText from "@/components/react-bits/GradientText";
import SpecularButton from "@/components/react-bits/SpecularButton";

import { ReadinessResponse, DemoPreset, CrossDocumentDiscrepancy } from "@/types";
import { analyzeClaimEvidence } from "@/services/api";

gsap.registerPlugin(ScrollTrigger);

const TRUST_ITEMS = [
  "OCR Verified",
  "EXIF Validated",
  "Forensics Certified",
  "Timeline Checked",
  "Cross-Document Graph",
  "pHash Anti-Fraud",
  "Carrier-Ready Export",
  "GPT-4o Reasoning",
  "Serial Tag Extracted",
  "Model Matched",
];

export default function ClaimAIDashboard() {
  const [incidentDescription, setIncidentDescription] = useState("");
  const [invoiceFiles, setInvoiceFiles] = useState<File[]>([]);
  const [warrantyFiles, setWarrantyFiles] = useState<File[]>([]);
  const [damagePhotoFiles, setDamagePhotoFiles] = useState<File[]>([]);

  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ReadinessResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"overview" | "graph">("overview");
  const [showExportModal, setShowExportModal] = useState(false);
  const [showInterviewer, setShowInterviewer] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);
  const [showAssistant, setShowAssistant] = useState(false);

  // Lazy-load AI assistant after scrolling past hero
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.7) {
        setShowAssistant(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        // Main hero visual entrance
        gsap.fromTo(
          heroRef.current.querySelector(".hero-visual"),
          { opacity: 0, x: 80, scale: 0.9 },
          { opacity: 1, x: 0, scale: 1, duration: 1.4, ease: "power3.out", delay: 0.8 }
        );

        // Staggered card animations
        const cards = heroRef.current.querySelectorAll(".hero-card");
        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: 1.2 + i * 0.2 }
          );
        });
      }

      if (sectionsRef.current) {
        const panels = sectionsRef.current.querySelectorAll(".reveal-panel");
        panels.forEach((panel) => {
          gsap.fromTo(
            panel,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: panel,
                start: "top 88%",
                end: "top 50%",
                toggleActions: "play none none none",
              },
            }
          );
        });
      }
    });

    return () => ctx.revert();
  }, [result]);

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

  const handleReset = () => {
    setIncidentDescription("");
    setInvoiceFiles([]);
    setWarrantyFiles([]);
    setDamagePhotoFiles([]);
    setActivePresetId(null);
    setResult(null);
    setErrorMessage(null);
  };

  const handleAutoResolveDiscrepancy = (discrepancy: CrossDocumentDiscrepancy) => {
    const studioElement = document.getElementById("evidence-studio");
    if (studioElement) {
      studioElement.scrollIntoView({ behavior: "smooth", block: "start" });
      studioElement.classList.add("ring-2", "ring-black", "ring-offset-2", "ring-offset-[#FFFDF2]", "transition-all", "duration-500");
      setTimeout(() => {
        studioElement.classList.remove("ring-2", "ring-black", "ring-offset-2", "ring-offset-[#FFFDF2]");
      }, 1500);
    }
  };

  const handleToggleCheck = (checkLabel: string) => {
    const studioElement = document.getElementById("evidence-studio");
    if (studioElement) {
      studioElement.scrollIntoView({ behavior: "smooth", block: "start" });
      studioElement.classList.add("ring-2", "ring-black", "ring-offset-2", "ring-offset-[#FFFDF2]", "transition-all", "duration-500");
      setTimeout(() => {
        studioElement.classList.remove("ring-2", "ring-black", "ring-offset-2", "ring-offset-[#FFFDF2]");
      }, 1500);
    }
  };

  const handleSmartCameraCapture = (file: File) => {
    setDamagePhotoFiles((prev) => [...prev, file]);
  };

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

  const handleInvoiceFilesChange = (files: File[]) => {
    setInvoiceFiles(files);
    setActivePresetId(null);
    setResult(null);
  };

  const handleWarrantyFilesChange = (files: File[]) => {
    setWarrantyFiles(files);
    setActivePresetId(null);
    setResult(null);
  };

  const handleDamagePhotosChange = (files: File[]) => {
    setDamagePhotoFiles(files);
    setActivePresetId(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF2] text-black flex flex-col selection:bg-purple-900/20 selection:text-black">
      <Navbar onReset={handleReset} />

      <main className="flex-1 w-full">
        {/* Hero Section - Artistic Asymmetry */}
        <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden pt-36">
          <CubeMatrix />
          
          <div className="absolute top-1/4 right-0 w-[700px] h-[700px] bg-purple-900/[0.03] rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/[0.03] rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Hero Text */}
            <div className="hero-text space-y-4">
              <div style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
                <SplitText
                  tag="h1"
                  text="Before you submit a claim, know whether your evidence"
                  className="font-extrabold tracking-tight text-black leading-[1.08]"
                  splitType="words"
                  delay={80}
                  duration={1}
                  ease="power3.out"
                  textAlign="left"
                />
              </div>

              <div style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
                <GradientText
                  className="font-extrabold tracking-tight"
                  colors={["#6d28d9", "#4f46e5", "#7c3aed"]}
                  animationSpeed={6}
                  pauseOnHover
                >
                  is actually ready.
                </GradientText>
              </div>

              <p className="text-lg text-black/55 mt-4 leading-relaxed max-w-xl">
                ClaimAI cross-references invoices, warranty contracts, photo OCR serial tags, and incident statements. Detect model conflicts, verify coverage timelines, and export carrier-ready packages.
              </p>

              <div className="flex items-center gap-4 mt-6">
                <SpecularButton
                  onClick={() => {
                    document.getElementById("evidence-studio")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  Start Analysis
                  <ArrowRight className="w-4 h-4" />
                </SpecularButton>

                <button
                  onClick={() => handleSelectPreset(PRESETS[0])}
                  className="px-7 py-3.5 rounded-xl border border-black/15 text-black/60 font-semibold text-sm hover:bg-black/[0.04] hover:text-black hover:border-black/25 transition-all"
                >
                  View Demo
                </button>
              </div>
            </div>

            {/* Right: Artistic Visual Element */}
            <div className="hero-visual hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Main floating card */}
                <div className="absolute inset-0 rounded-3xl bg-white/80 backdrop-blur-md border border-black/[0.06] p-8 transform rotate-[3deg] shadow-xl">
                  <div className="w-full h-full rounded-2xl border border-black/5 overflow-hidden">
                    <img src="/hero-evidence.png" alt="Evidence Intelligence Graph" className="w-full h-full object-cover object-center scale-105" />
                  </div>
                </div>

                {/* Overlapping score card */}
                <div className="hero-card absolute -bottom-6 -right-6 w-3/5 rounded-2xl bg-white/90 backdrop-blur-md border border-black/[0.06] p-5 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-black/50 uppercase tracking-wider">Readiness Score</p>
                      <p className="text-2xl font-extrabold text-emerald-600">95%</p>
                    </div>
                  </div>
                </div>

                {/* Overlapping forensics card */}
                <div className="hero-card absolute -top-4 -left-4 w-2/5 rounded-2xl bg-white/90 backdrop-blur-md border border-black/[0.06] p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-900/10 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-purple-900" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-black/50 uppercase tracking-wider">Forensics</p>
                      <p className="text-sm font-bold text-purple-900">Verified</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Marquee */}
        <div id="trust-marquee" className="py-5 overflow-hidden border-y border-black/[0.06]">
          <div className="flex gap-10 animate-marquee whitespace-nowrap">
            {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, idx) => (
              <span key={idx} className="text-xs font-semibold text-black/40 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-900/30" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Demo Presets */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-24 pb-8">
          <DemoPresets onSelectPreset={handleSelectPreset} activePresetId={activePresetId} />
        </section>

        {/* Main Content Grid */}
        <div ref={sectionsRef} className="max-w-7xl mx-auto px-4 lg:px-8 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Evidence Ingestion Studio */}
            <div className="lg:col-span-5 space-y-5 reveal-panel">
              <div id="evidence-studio" className="claim-panel rounded-2xl p-5 lg:p-6 backdrop-blur-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-black" />
                    <h2 className="text-sm font-bold text-black">
                      Evidence Ingestion Studio
                    </h2>
                  </div>
                </div>

                <form onSubmit={handleAnalyze} className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-black">
                      <span>Incident Narrative & Statement</span>
                      <button
                        type="button"
                        onClick={() => setShowInterviewer(true)}
                        className="text-[11px] text-purple-900 hover:text-purple-800 flex items-center gap-1 font-semibold bg-purple-900/10 hover:bg-purple-900/15 px-2 py-0.5 rounded-lg border border-purple-900/20 transition-all"
                      >
                        <MessageSquareText className="w-3 h-3" />
                        <span>AI Interview</span>
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={incidentDescription}
                      onChange={(e) => {
                        setIncidentDescription(e.target.value);
                        setActivePresetId(null);
                      }}
                      placeholder="Describe how damage occurred, incident date, location, and relevant details..."
                      className="w-full min-h-[140px] text-xs p-3 rounded-xl bg-white border border-black/10 text-black placeholder-black/30 focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black/10 transition-all leading-relaxed"
                    />
                  </div>

                  <Dropzone
                    label="Purchase Receipt or Invoice"
                    sublabel="PDF, Image, or Text"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                    icon="pdf"
                    files={invoiceFiles}
                    onFilesChange={handleInvoiceFilesChange}
                    required
                  />

                  <Dropzone
                    label="Warranty / Policy Document"
                    sublabel="PDF, Image, or Text"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                    icon="pdf"
                    files={warrantyFiles}
                    onFilesChange={handleWarrantyFilesChange}
                  />

                  <Dropzone
                    label="Damage & Serial Number Photos"
                    sublabel="Multiple Angles / Tags"
                    accept=".png,.jpg,.jpeg,.webp"
                    icon="image"
                    multiple
                    files={damagePhotoFiles}
                    onFilesChange={handleDamagePhotosChange}
                    onOpenSmartCamera={() => setShowCameraModal(true)}
                    required
                  />

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <SpecularButton
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs tracking-wide uppercase"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Synthesizing Evidence Graph...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Validate Evidence Readiness</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </SpecularButton>
                </form>
              </div>
            </div>

            {/* Right: Results Dashboard */}
            <div className="lg:col-span-7 space-y-5">
              {isAnalyzing ? (
                <VisualScanBanner />
              ) : result ? (
                <div className="space-y-5 animate-in fade-in duration-500">
                  {/* View Switcher Tabs & Export Button */}
                  <div className="flex items-center justify-between p-2 rounded-2xl bg-white/80 border border-black/10 backdrop-blur-md reveal-panel">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActiveTab("overview")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          activeTab === "overview"
                            ? "bg-black text-[#FFFDF2] shadow"
                            : "text-black/50 hover:text-black"
                        }`}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        Readiness Overview
                      </button>

                      <button
                        onClick={() => setActiveTab("graph")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          activeTab === "graph"
                            ? "bg-black text-[#FFFDF2] shadow"
                            : "text-black/50 hover:text-black"
                        }`}
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        Evidence Graph
                      </button>
                    </div>

                    <button
                      onClick={() => setShowExportModal(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-black text-[#FFFDF2] hover:bg-black/90 shadow-md transition-all active:scale-[0.99]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Package
                    </button>
                  </div>

                  {activeTab === "graph" ? (
                    <EvidenceGraph result={result} />
                  ) : (
                    <>
                      <div className="reveal-panel"><ReadinessGauge score={result.readiness_score} /></div>
                      <div className="reveal-panel"><AuthenticityShield forensics={result.forensics} /></div>
                      <div className="reveal-panel">
                        <DiscrepancyInspector
                          discrepancies={result.discrepancies}
                          onAutoResolve={handleAutoResolveDiscrepancy}
                        />
                      </div>
                      <div className="reveal-panel"><ExtractedEntitiesCard entities={result.extracted_entities} /></div>
                      <div className="reveal-panel"><PhotoMetadataCard metadataList={result.photo_metadata} /></div>
                      <div className="reveal-panel">
                        <VerificationChecklist
                          checks={result.verification_checks}
                          onToggleCheck={handleToggleCheck}
                        />
                      </div>
                      <div className="reveal-panel"><IssuesFeed issues={result.issues_detected} /></div>
                      <div className="reveal-panel"><ActionPlan actions={result.recommended_actions} /></div>
                    </>
                  )}
                </div>
              ) : (
                /* Empty State */
                <div className="claim-panel rounded-2xl p-12 lg:p-16 text-center backdrop-blur-md flex flex-col items-center justify-center space-y-8 reveal-panel min-h-[400px]">
                  {/* Skeleton Preview — sets visual expectations */}
                  <div className="w-full max-w-xs space-y-5 opacity-60">
                    {/* Skeleton gauge */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-full border-[3px] border-black/[0.06] animate-pulse" />
                      <div className="h-3 w-16 rounded-full bg-black/[0.05] animate-pulse" />
                    </div>
                    {/* Skeleton timeline bars */}
                    <div className="space-y-2.5 pt-2">
                      <div className="h-2.5 w-full rounded-full bg-black/[0.05] animate-pulse" />
                      <div className="h-2.5 w-[85%] rounded-full bg-black/[0.04] animate-pulse" style={{ animationDelay: "150ms" }} />
                      <div className="h-2.5 w-[70%] rounded-full bg-black/[0.04] animate-pulse" style={{ animationDelay: "300ms" }} />
                      <div className="h-2.5 w-[60%] rounded-full bg-black/[0.03] animate-pulse" style={{ animationDelay: "450ms" }} />
                    </div>
                  </div>

                  <div className="max-w-md">
                    <h3 className="text-lg font-bold text-black/80">
                      Awaiting Claim Evidence
                    </h3>
                    <p className="text-sm text-black/45 mt-2 leading-relaxed">
                      Upload documents in the studio, use the{" "}
                      <span className="text-purple-800 font-medium">AI Interview Assistant</span>, or select a{" "}
                      <span className="text-purple-800 font-medium">Demo Scenario</span> above.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Premium Footer */}
        <footer className="border-t border-black/[0.06] bg-[#FFFDF2]">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-white border border-black/[0.06] shadow-sm p-1 flex items-center justify-center">
                    <img src="/logo-icon.png" alt="ClaimAI Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-bold text-lg text-black">ClaimAI</span>
                </div>
                <p className="text-sm text-black/50 leading-relaxed max-w-xs">
                  Pre-claim evidence intelligence. Know whether your evidence is actually ready before submitting.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-black/60 uppercase tracking-wider mb-4">Built For</h4>
                <ul className="space-y-2.5 text-sm text-black/45">
                  <li>CodeBuild 1.0 Hackathon</li>
                  <li>Team Tribit</li>
                  <li>MIT License</li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-black/60 uppercase tracking-wider mb-4">Technology</h4>
                <ul className="space-y-2.5 text-sm text-black/45">
                  <li>Next.js + FastAPI</li>
                  <li>GPT-4o Reasoning</li>
                  <li>RapidOCR + pdfplumber</li>
                </ul>
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-black/50">
                © 2026 ClaimAI by Team Tribit. All rights reserved.
              </p>
              <p className="text-xs text-black/40">
                Built with Next.js, FastAPI, and GPT-4o
              </p>
            </div>
          </div>
        </footer>
      </main>

      {showAssistant && (
        <AIAssistantWidget
          currentStatement={incidentDescription}
          onUpdateStatement={(updated) => setIncidentDescription(updated)}
          isAnalyzing={isAnalyzing}
        />
      )}

      {showInterviewer && (
        <InterviewerAgent
          initialStatement={incidentDescription}
          onApplyStatement={(refined) => setIncidentDescription(refined)}
          onClose={() => setShowInterviewer(false)}
        />
      )}

      {showCameraModal && (
        <SmartCameraModal
          onCapture={handleSmartCameraCapture}
          onClose={() => setShowCameraModal(false)}
        />
      )}

      {showExportModal && result && (
        <CarrierExportModal
          result={result}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
