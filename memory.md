# ClaimAI — Memory & Context Log

## Project Summary
- **Project:** ClaimAI — Pre-Claim Evidence Intelligence (CodeBuild 1.0 hackathon by Team Tribit)
- **Objective:** Pre-submission evidence validation layer generating explainable readiness scores (0-100), flagging contradictions/discrepancies, and recommending corrective actions before formal claim submission.

---

## Architecture & Codebase Components

### Backend Modules (Root Directory)
- `requirements.txt`: Backend dependencies (`fastapi`, `uvicorn`, `langchain-openai`, `pdfplumber`, `rapidocr-onnxruntime`, `pillow`, `pydantic`).
- `models.py`: Pydantic schemas for `VerificationCheck`, `DetectedIssue`, and `ReadinessResponse`.
- `extractor.py`: Multi-format async parsing for PDF documents (`pdfplumber`) and OCR text extraction (`rapidocr-onnxruntime` + `Pillow`).
- `reasoning.py`: LangChain OpenAI `gpt-4o` cross-evidence graph reasoner with structured output and heuristic fallback.
- `main.py`: FastAPI server with CORS, multipart form ingestion at `POST /api/v1/analyze`, and health routes.
- `.env.example`: Configuration template for environment variables (`OPENAI_API_KEY`, etc.).
- `test_claimai.py`: Automated smoke test suite.

### Frontend Application (`frontend/`)
- `src/app/page.tsx`: Interactive 2-column evidence studio and intelligence dashboard.
- `src/app/layout.tsx`: Root layout with dark mode tokens and metadata.
- `src/types/index.ts`: TypeScript contracts for claims, verification checks, issues, and presets.
- `src/services/api.ts`: API service with live backend connection and resilient client fallback.
- `src/components/`:
  - `Navbar.tsx`: Header with live backend connection pulse checker and reset.
  - `DemoPresets.tsx`: 3 quick-test claim presets (*Valid Claim*, *Serial Mismatch*, *Incomplete Proof*).
  - `Dropzone.tsx`: Drag-and-drop file uploaders with previews for PDF and images.
  - `ReadinessGauge.tsx`: Animated circular score dial with celebration confetti.
  - `VerificationChecklist.tsx`: Pass/fail validation checkpoint cards.
  - `IssuesFeed.tsx`: Severity-badged contradiction feed.
  - `ActionPlan.tsx`: Interactive remediation checklist with progress tracking.
  - `VisualScanBanner.tsx`: Multimodal scan animation with progress steps.

---

## Session History & Milestones

### Session 1: Full-Stack Implementation & Verification
1. **Backend Engine**: Built and verified `requirements.txt`, `models.py`, `extractor.py`, `reasoning.py`, and `main.py`.
2. **Environment**: Created virtual environment `.venv`, resolved all linting/import paths, and verified all unit tests with `test_claimai.py`.
3. **Frontend Application**: Initialized Next.js project with Tailwind CSS, Lucide icons, and canvas-confetti in `frontend/`.
4. **UI Components & Dashboard**: Implemented all interactive components, demo scenario quick-switchers, and live API communication.
5. **Build Verification**: Executed `npm run build` with 100% successful compilation and zero errors.
