# ClaimAI — Memory & Context Log

## Project Summary
- **Project:** ClaimAI — Pre-Claim Evidence Intelligence (CodeBuild 1.0 hackathon by Team Tribit)
- **Objective:** Pre-submission evidence validation layer generating explainable readiness scores (0-100), flagging contradictions/discrepancies, and recommending corrective actions before formal claim submission.

---

## Architecture & Codebase Components

### Backend Modules (Root Directory)
- `requirements.txt`: Backend dependencies (`fastapi`, `uvicorn`, `langchain-openai`, `pdfplumber`, `rapidocr-onnxruntime`, `pillow`, `pydantic`).
- `models.py`: Pydantic schemas for `VerificationCheck`, `DetectedIssue`, `ExtractedEntities`, `PhotoMetadata`, `CrossDocumentDiscrepancy`, and `ReadinessResponse`.
- `extractor.py`: Multi-format parsing for PDF (`pdfplumber`), images (`rapidocr-onnxruntime`), text (`extract_text_from_txt`), and EXIF metadata (`extract_image_exif_metadata`).
- `reasoning.py`: Multimodal cross-document graph reasoner with model mismatch detection, EXIF timeline validation, and structured discrepancy generation.
- `main.py`: FastAPI server with CORS, multipart form ingestion at `POST /api/v1/analyze`, EXIF extraction, and health routes.
- `.env.example`: Configuration template for environment variables (`OPENAI_API_KEY`, etc.).
- `test_claimai.py`: Comprehensive smoke test suite.

### Frontend Application (`frontend/`)
- `src/app/page.tsx`: Interactive 2-column evidence studio & intelligence dashboard.
- `src/app/layout.tsx`: Root layout with dark mode tokens and metadata.
- `src/types/index.ts`: TypeScript contracts with `ExtractedEntities`, `PhotoMetadata`, and `CrossDocumentDiscrepancy`.
- `src/services/api.ts`: API service with live backend connection and resilient client fallback.
- `src/components/`:
  - `Navbar.tsx`: Header with live backend connection pulse checker and reset.
  - `DemoPresets.tsx`: 3 quick-test presets (*Model Mismatch (Dell XPS 15 vs 13)*, *Complete Valid Claim*, *Timeline Anomaly*).
  - `Dropzone.tsx`: Drag-and-drop uploaders with previews for PDF, text, and images.
  - `ReadinessGauge.tsx`: Animated circular score dial with celebration confetti.
  - `DiscrepancyInspector.tsx`: Side-by-side visual conflict inspector.
  - `ExtractedEntitiesCard.tsx`: Structured parsed entity badges.
  - `PhotoMetadataCard.tsx`: Photo EXIF camera & timestamp integrity viewer.
  - `VerificationChecklist.tsx`: Pass/fail validation checkpoint cards.
  - `IssuesFeed.tsx`: Severity-badged contradiction feed.
  - `ActionPlan.tsx`: Interactive remediation checklist with progress tracking.
  - `VisualScanBanner.tsx`: Multimodal scan animation with progress steps.

---

## Session History & Milestones

### Milestone: Phase 1 — Structured Entity Extraction & Baseline Rules Engine (COMPLETE)
1. Multimodal file support (PDF, JPEG, PNG, WEBP, Plain text).
2. Entity extraction (`product_name`, `model_number`, `serial_number`, `purchase_date`, `incident_date`, `damage_type`).
3. Document presence & timeline cross-checks.

### Milestone: Phase 2 — Evidence Graph Reasoning & Visual Verification (COMPLETE)
1. **EXIF & Metadata Extraction**: Added camera model, capture timestamp, and GPS extraction.
2. **Cross-Document Graph Engine**: Detects model discrepancies (e.g. Dell XPS 15 vs Dell XPS 13) and photo capture timestamp anomalies vs incident date.
3. **Side-by-Side Discrepancy Inspector**: Visual comparison card highlighting conflicts in red/amber with source document badges.
4. **Photo Integrity Card**: Displays EXIF hardware badges.
5. **Testing & Verification**:
   - `test_claimai.py` (Phase 2) passed with 100% success.
   - Frontend `npm run build` compiled in 819ms with 0 errors.
   - All changes committed to Git.
