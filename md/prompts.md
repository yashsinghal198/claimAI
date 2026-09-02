# ClaimAI — Complete Master Prompt

You are an expert AI system architect and full-stack engineer building **ClaimAI** for the **CodeBuild1.0** hackathon by **Team Tribit**[cite: 1]. 

Your task is to generate the complete backend codebase, API infrastructure, document parsing engines, and structured AI reasoning layers based on the detailed project specifications below[cite: 1].

---

## Project Specification & Context

* **Project Name:** ClaimAI — Pre-Claim Evidence Intelligence[cite: 1]
* **Tagline:** Before you submit a claim, know whether your evidence is actually ready[cite: 1].
* **Core Concept:** ClaimAI is an intelligent pre-submission evidence validation layer[cite: 1]. It does not approve or reject claims; instead, it generates an explainable readiness score, flags contradictions, and provides actionable recommendations to optimize claim packages before formal submission[cite: 1].
* **Tech Stack:**
  * **Frontend:** React / Next.js with Tailwind CSS & Lucide Icons[cite: 1]
  * **Backend Framework:** FastAPI (Python 3.10+) hosted via Uvicorn[cite: 1]
  * **Document Processing:** `pdfplumber` (PDF parsing), `rapidocr-onnxruntime` & `Pillow` (OCR & image parsing)[cite: 1]
  * **AI Reasoning Layer:** OpenAI (`gpt-4o`) orchestrated via `langchain-openai`[cite: 1]

---

## Core System Architecture & Data Flow

1. **Ingestion Layer:** Accepts multipart data comprising `incident_description` (text), `invoice` (PDF/Image), `warranty` (PDF/Image), and `damage_photos` (List of Images)[cite: 1].
2. **Extraction Engine (`extractor.py`):** Asynchronously parses raw binary files into plain-text strings using OCR and PDF extractors[cite: 1].
3. **Reasoning Engine (`reasoning.py`):** Constructs a cross-document evidence graph to evaluate[cite: 1]:
   * **Identity Consistency:** Matching product models, brands, and serial numbers across invoice, warranty, and visual proof[cite: 1].
   * **Timeline Logic:** Verifying purchase date vs. incident date order[cite: 1].
   * **Coverage Completeness:** Identifying missing required evidence (e.g., missing serial tags or damage angles)[cite: 1].
4. **API Gateway (`main.py`):** Exposes a CORS-enabled REST endpoint (`POST /api/v1/analyze`) returning validated JSON matching the output schema[cite: 1].

---

## File Deliverables & Implementation Details

Generate code for the following four core files:

### File 1: `requirements.txt`
Dependencies must include:
* `fastapi`
* `uvicorn`
* `python-multipart`
* `pydantic`
* `langchain-openai`
* `pdfplumber`
* `pillow`
* `rapidocr-onnxruntime`

### File 2: `models.py`
Define strict Pydantic (v2) models matching the target JSON output[cite: 1]:
* `VerificationCheck`: `label` (str), `passed` (bool)
* `DetectedIssue`: `severity` (str: "HIGH", "MEDIUM", "LOW"), `description` (str)
* `ReadinessResponse`: `readiness_score` (int: 0–100), `verification_checks` (List[VerificationCheck]), `issues_detected` (List[DetectedIssue]), `recommended_actions` (List[str])

### File 3: `extractor.py`
Implement async document processing helper functions:
* `extract_text_from_pdf(file_bytes: bytes) -> str`: Extracts text from PDF documents via `pdfplumber`.
* `extract_text_from_image(file_bytes: bytes) -> str`: Performs OCR on images using `rapidocr-onnxruntime` and `Pillow`.
* Include fallback error handling to return clean empty strings if parsing encounters issues.

### File 4: `reasoning.py`
Implement cross-evidence intelligence using `langchain_openai.ChatOpenAI` (`gpt-4o`):
* Function: `analyze_evidence(evidence_payload: dict) -> ReadinessResponse`
* System Prompt Rules: Analyze invoice text, warranty text, image OCR texts, and incident descriptions[cite: 1]. Cross-check serial numbers, model identities, timeline dates, and damage proof[cite: 1].
* Bind structured output to the `ReadinessResponse` schema using `.with_structured_output(ReadinessResponse)`.

### File 5: `main.py`
FastAPI server implementation:
* Configure `CORSMiddleware` with `allow_origins=["*"]`, `allow_methods=["*"]`, `allow_headers=["*"]`.
* Endpoint: `POST /api/v1/analyze` accepting multipart form data (`incident_description`, `invoice`, `warranty`, `damage_photos`).
* Read file streams, trigger extractions, construct context payload, execute reasoning, and return the final JSON response.

Please output clean, fully commented, production-ready code for each file.