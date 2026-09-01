# ClaimAI — Memory & Context Log

## Project Summary
- **Project:** ClaimAI — Pre-Claim Evidence Intelligence (CodeBuild 1.0 hackathon by Team Tribit)
- **Objective:** Pre-submission evidence validation layer generating explainable readiness scores (0-100), flagging contradictions/discrepancies, detecting visual forgery, visualizing evidence graphs, and exporting carrier-ready packages.

---

## Architecture & Codebase Components

### Backend Modules (Root Directory)
- `requirements.txt`: Backend dependencies (`fastapi`, `uvicorn`, `langchain-openai`, `pdfplumber`, `rapidocr-onnxruntime`, `pillow`, `pydantic`).
- `models.py`: Pydantic schemas for `VerificationCheck`, `DetectedIssue`, `ExtractedEntities`, `PhotoMetadata`, `CrossDocumentDiscrepancy`, `ForensicAnalysis`, and `ReadinessResponse`.
- `extractor.py`: Multi-format parsing for PDF (`pdfplumber`), images (`rapidocr-onnxruntime`), text (`extract_text_from_txt`), EXIF metadata (`extract_image_exif_metadata`), and forgery forensics (`analyze_image_forensics`).
- `reasoning.py`: Multimodal cross-document graph reasoner with model mismatch detection, EXIF timeline validation, forensics integration, and structured discrepancy generation.
- `main.py`: FastAPI server with CORS, multipart form ingestion at `POST /api/v1/analyze`, EXIF extraction, Forensics inspection, and health routes.
- `.env.example`: Configuration template for environment variables (`OPENAI_API_KEY`, etc.).
- `test_claimai.py`: Automated smoke test suite.

### Frontend Application (`frontend/`)
- `src/app/page.tsx`: Interactive 2-column evidence studio & intelligence dashboard with tabbed views.
- `src/app/layout.tsx`: Root layout with dark mode tokens and metadata.
- `src/types/index.ts`: TypeScript contracts with `ExtractedEntities`, `PhotoMetadata`, `CrossDocumentDiscrepancy`, and `ForensicAnalysis`.
- `src/services/api.ts`: API service with live backend connection and resilient client fallback.
- `src/components/`:
  - `Navbar.tsx`: Header with live backend connection pulse checker and reset.
  - `DemoPresets.tsx`: Quick-test presets (*Model Mismatch (Dell XPS 15 vs 13)*, *Complete Valid Claim*, *Timeline Anomaly*).
  - `Dropzone.tsx`: Drag-and-drop uploaders with previews for PDF, text, and images.
  - `ReadinessGauge.tsx`: Animated circular score dial with celebration confetti.
  - `AuthenticityShield.tsx`: Anti-forgery integrity score badge and forensic checkpoint drawer.
  - `DiscrepancyInspector.tsx`: Side-by-side visual conflict inspector.
  - `ExtractedEntitiesCard.tsx`: Structured parsed entity badges.
  - `PhotoMetadataCard.tsx`: Photo EXIF camera & timestamp integrity viewer.
  - `VerificationChecklist.tsx`: Pass/fail validation checkpoint cards.
  - `IssuesFeed.tsx`: Severity-badged contradiction feed.
  - `ActionPlan.tsx`: Interactive remediation checklist with progress tracking.
  - `EvidenceGraph.tsx`: Interactive multimodal topological node-edge graph visualizer with live entity inspector.
  - `CarrierExportModal.tsx`: Downloadable PDF carrier audit certificate + JSON claim payload exporter (`jspdf` & `html2canvas`).
  - `VisualScanBanner.tsx`: Multimodal scan animation with progress steps.

---

## Session History & Milestones

### Milestone: Phase 1 — Structured Entity Extraction & Baseline Rules Engine (COMPLETE)
### Milestone: Phase 2 — Evidence Graph Reasoning & Visual Verification (COMPLETE)
### Milestone: Phase 3 — Hackathon Winning Features (COMPLETE)
1. **Generative Forgery & Manipulation Detection Engine**: Detects Photoshop, GIMP, Canva, and AI generative markers (Midjourney, DALL-E, Stable Diffusion) with the **Authenticity & Integrity Shield**.
2. **Interactive Evidence Graph Visualizer**: Topological graph mapping Invoices, Warranties, Damage Photos, and Incident Statements with semantic linked edges and node inspector.
3. **Carrier-Ready Export Package**: One-click generation of high-resolution PDF audit certificates and structured insurance JSON payloads.
4. **Build & Test Verification**:
   - `test_claimai.py` passed with 100% success across all 4 suites.
   - Frontend Next.js production bundle compiled cleanly in 2.9s with 0 errors.
   - All changes committed to Git.
