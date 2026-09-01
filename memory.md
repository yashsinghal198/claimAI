# ClaimAI — Memory & Context Log

## Project Summary
- **Project:** ClaimAI — Pre-Claim Evidence Intelligence (CodeBuild 1.0 hackathon by Team Tribit)
- **Objective:** Pre-submission evidence validation layer generating explainable readiness scores (0-100), flagging contradictions/discrepancies, and recommending corrective actions before formal claim submission.

---

## Architecture & Codebase Components

### Backend Modules (Root Directory)
- `requirements.txt`: Backend dependencies (`fastapi`, `uvicorn`, `langchain-openai`, `pdfplumber`, `rapidocr-onnxruntime`, `pillow`, `pydantic`).
- `models.py`: Pydantic schemas for `VerificationCheck`, `DetectedIssue`, `ExtractedEntities`, and `ReadinessResponse`.
- `extractor.py`: Multi-format async parsing for PDF documents (`pdfplumber`), text files (`extract_text_from_txt`), and OCR text extraction (`rapidocr-onnxruntime` + `Pillow`).
- `reasoning.py`: LangChain OpenAI `gpt-4o` cross-evidence graph reasoner & enhanced heuristic rules engine (with timeline logic, cross-checks, and entity parsing).
- `main.py`: FastAPI server with CORS, multipart form ingestion at `POST /api/v1/analyze`, and health routes.
- `.env.example`: Configuration template for environment variables (`OPENAI_API_KEY`, etc.).
- `test_claimai.py`: Automated smoke test suite.

### Frontend Application (`frontend/`)
- `src/app/page.tsx`: Interactive 2-column evidence studio and intelligence dashboard.
- `src/app/layout.tsx`: Root layout with dark mode tokens and metadata.
- `src/types/index.ts`: TypeScript contracts with `ExtractedEntities`.
- `src/services/api.ts`: API service with live backend connection and resilient client fallback.
- `src/components/`:
  - `Navbar.tsx`: Header with live backend connection pulse checker and reset.
  - `DemoPresets.tsx`: 3 quick-test claim presets (*Valid Claim*, *Serial Mismatch*, *Incomplete Proof*).
  - `Dropzone.tsx`: Drag-and-drop file uploaders with previews for PDF, text, and images.
  - `ReadinessGauge.tsx`: Animated circular score dial with celebration confetti.
  - `ExtractedEntitiesCard.tsx`: Structured parsed entity badges (Product, Model, Serial, Purchase Date, Incident Date, Damage Classification).
  - `VerificationChecklist.tsx`: Pass/fail validation checkpoint cards.
  - `IssuesFeed.tsx`: Severity-badged contradiction feed.
  - `ActionPlan.tsx`: Interactive remediation checklist with progress tracking.
  - `VisualScanBanner.tsx`: Multimodal scan animation with progress steps.

---

## Session History & Milestones

### Milestone: Phase 1 — Structured Entity Extraction & Baseline Rules Engine (COMPLETE)
1. **Multimodal File Support**: Added support for PDF, JPEG, PNG, WEBP, and plain text files across backend and frontend dropzones.
2. **Structured Entity Extraction**: Backend extracts `product_name`, `model_number`, `serial_number`, `purchase_date`, `incident_date`, and `damage_type`.
3. **Baseline Rules Engine**:
   - Evaluates mandatory evidence presence (Invoice, Warranty, Photos, Narrative Statement).
   - Enforces timeline cross-check rules (flags high severity error if Purchase Date > Incident Date).
   - Cross-checks serial numbers and product models.
4. **UI Dashboard**: Built and rendered [ExtractedEntitiesCard.tsx](file:///c:/Users/Yash/OneDrive/Desktop/claimAI/frontend/src/components/ExtractedEntitiesCard.tsx) in the main dashboard.
5. **Testing & Verification**:
   - Backend smoke test suite in `test_claimai.py` passed with 100% success.
   - Frontend Next.js production build compiled cleanly in 1.2s.
