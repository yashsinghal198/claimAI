# ClaimAI — Development Phases

This document outlines the step-by-step phases for developing **ClaimAI** for the CodeBuild1.0 hackathon by Team Tribit[cite: 1].

---

## Phase Overview

| Phase | Module | Objective | Core Deliverables |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Project Setup & Data Models | Establish backend environment and data contracts | Virtual environment, `requirements.txt`, Pydantic schemas in `models.py` |
| **Phase 2** | Evidence Ingestion & Parsing | Extract text from uploaded documents and images | File stream handlers, PDF text parsing (`pdfplumber`), Image OCR (`RapidOCR`) |
| **Phase 3** | AI Reasoning Engine | Perform cross-document graph analysis | LangChain setup, OpenAI `gpt-4o` prompts, score calculation, issue detection |
| **Phase 4** | API Layer & CORS Integration | Expose server endpoints for client UI | FastAPI `/api/v1/analyze` route, CORS middleware, multipart handling |

---

## Detailed Execution Steps

### Phase 1: Project Setup & Data Schemas
* Set up Python virtual environment and install core packages[cite: 1].
* Create `models.py` defining the structured JSON outputs: `VerificationCheck`, `DetectedIssue`, and `ReadinessResponse`[cite: 1].

### Phase 2: Evidence Ingestion & Extraction Layer
* Create `extractor.py` to handle dynamic file uploads[cite: 1].
* Implement `extract_text_from_pdf()` using `pdfplumber` for receipts and warranty policies[cite: 1].
* Implement `extract_text_from_image()` using `rapidocr-onnxruntime` to pull serial numbers and text from photos[cite: 1].

### Phase 3: Evidence Graph Reasoning Engine
* Build `reasoning.py` using `langchain-openai` and `gpt-4o`[cite: 1].
* Create system prompts to cross-reference extracted context (matching serial numbers, timeline validation, and damage verification)[cite: 1].
* Compute the `readiness_score` (0–100%) and assemble flagged issues and recommended action steps[cite: 1].

### Phase 4: API Gateway & Frontend Integration
* Build `main.py` using FastAPI and configure `CORSMiddleware`[cite: 1].
* Implement multipart endpoint `POST /api/v1/analyze` to handle incoming files and plain text descriptions simultaneously[cite: 1].
* Wire end-to-end data flow to return structured JSON to the React/Next.js dashboard[cite: 1].