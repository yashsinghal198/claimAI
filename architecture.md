# ClaimAI — Pre-Claim Evidence Intelligence System Architecture

This document provides the complete system architecture for **ClaimAI**, developed for the CodeBuild1.0 hackathon by Team Tribit[cite: 1]. ClaimAI operates as a pre-submission evidence intelligence layer designed to evaluate, cross-check, and score claim readiness before formal submission to an insurer or warranty provider[cite: 1].

---

## 1. System Overview

ClaimAI accepts multimodal evidence inputs (invoices, warranties, images, text descriptions)[cite: 1], extracts text and metadata[cite: 1], constructs a cross-document reasoning graph[cite: 1], and outputs an explainable readiness assessment[cite: 1].

+-----------------------------------------------------------------------+
|                            FRONTEND LAYER                             |
|              (React / Next.js Upload Workspace & Dashboard)           |
+-----------------------------------------------------------------------+
|
| Multipart Form Data
v
+-----------------------------------------------------------------------+
|                            BACKEND GATEWAY                            |
|                       (FastAPI Server / Python)                       |
+-----------------------------------------------------------------------+
|
+-------------------------+-------------------------+
|                                                   |
v                                                   v
+-----------------------------------+   +-----------------------------------+
|     EVIDENCE PROCESSING LAYER     |   |          AI REASONING LAYER       |
|  - OCR Engine (RapidOCR)          |   |  - LLM Graph Engine (GPT-4o)      |
|  - PDF Extraction (pdfplumber)    |   |  - Timeline & Cross-Document Check|
|  - Metadata Reader (Pillow/EXIF)  |   |  - Anomaly & Readiness Evaluation |
+-----------------------------------+   +-----------------------------------+
|                                                   |
+-------------------------+-------------------------+
|
v
+-----------------------------------------------------------------------+
|                             OUTPUT LAYER                              |
|   Readiness Score (%) | Verification Checks | Issues | Next Actions   |
+-----------------------------------------------------------------------+


---

## 2. Layer Specifications

### 2.1 Frontend Workspace Layer
* **Technology:** React / Next.js, Tailwind CSS[cite: 1]
* **Role:** Interactive upload workspace handling dynamic file drops, incident text inputs, real-time score visualization, and recommended action cards[cite: 1].

### 2.2 Backend Gateway Layer
* **Technology:** FastAPI (Python)[cite: 1]
* **Role:** REST API endpoints managing multi-part file streaming, payload aggregation, and cross-origin resource sharing (CORS)[cite: 1].

### 2.3 Evidence Processing Layer
* **PDF Extractor:** `pdfplumber` for structured text and table parsing from invoices and policy documents[cite: 1].
* **OCR & Vision Engine:** `rapidocr-onnxruntime` and `Pillow` for OCR extraction across product tags, serial numbers, and damage photographs[cite: 1].

### 2.4 AI Reasoning & Graph Layer
* **Intelligence Engine:** OpenAI LLM (`gpt-4o`) orchestrated via LangChain[cite: 1].
* **Graph Logic:** Executes semantic cross-referencing to match product identities, timeline validity (purchase vs. incident date), missing mandatory proof, and model discrepancies[cite: 1].

---

## 3. End-to-End Data Flow

[ User Uploads ] ---> [ FastAPI /api/v1/analyze ] ---> [ OCR / PDF Text Parsing ]
|
v
[ JSON Payload Engine ] <--- [ GPT-4o Reasoning ] <--- [ Aggregated Evidence Context ]
|
v
[ Dynamic Dashboard Display ]

1. **Ingestion:** User uploads invoice, warranty, photos, and incident descriptions[cite: 1].
2. **Extraction:** Backend converts raw binaries (PDF/Images) into structured text and context tags[cite: 1].
3. **Graph Analysis:** The AI engine cross-references serial numbers, dates, damage visual evidence, and policy rules[cite: 1].
4. **Structured JSON Output:** API returns an explicit score, flagged issues, and actionable fix steps[cite: 1].

---

## 4. API Response Data Schema

```json
{
  "readiness_score": 76,
  "verification_checks": [
    { "label": "Ownership verified", "passed": true },
    { "label": "Purchase date identified", "passed": true },
    { "label": "Product identity matched", "passed": true },
    { "label": "Damage visible", "passed": true }
  ],
  "issues_detected": [
    {
      "severity": "HIGH",
      "description": "Serial-number photograph missing"
    },
    {
      "severity": "MEDIUM",
      "description": "Required damage angle missing"
    },
    {
      "severity": "HIGH",
      "description": "Warranty model differs from invoice model"
    }
  ],
  "recommended_actions": [
    "Upload serial-number photo",
    "Add a second damage angle",
    "Verify model in warranty document"
  ]
}
```[cite: 1]

---

## 5. Deployment Setup

* **Backend Environment:** Python 3.10+ running via Uvicorn[cite: 1].
* **Frontend Environment:** Node.js 18+ hosting the Next.js bundle[cite: 1].