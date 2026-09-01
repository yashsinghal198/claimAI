# ClaimAI — Tech Stack Architecture

This document details the complete technology stack powering **ClaimAI** for the CodeBuild1.0 hackathon by Team Tribit[cite: 1]. The architecture is divided into clear functional layers to enable rapid end-to-end evidence processing, real-time cross-document intelligence, and interactive user feedback[cite: 1].

---

## 1. Core Tech Stack Breakdown

| Layer | Technology | Key Responsibility |
| :--- | :--- | :--- |
| **Frontend Framework** | React / Next.js[cite: 1] | Modern UI dashboard & server-side rendering |
| **Styling & UI Components** | Tailwind CSS + Lucide Icons | Responsive layouts, file dropzone, & readiness cards |
| **Backend Framework** | FastAPI (Python 3.10+)[cite: 1] | Asynchronous API gateway & multi-part file streaming |
| **Document Extraction** | `pdfplumber`[cite: 1] | Parsing text & tables from PDF invoices and warranty policies |
| **OCR & Computer Vision** | `rapidocr-onnxruntime` & `Pillow`[cite: 1] | Visual text detection on serial tags & damaged device images |
| **AI Orchestration & LLM** | LangChain + OpenAI `gpt-4o`[cite: 1] | Cross-document reasoning, timeline check, & anomaly engine |
| **Server Engine** | Uvicorn[cite: 1] | High-performance ASGI server for hosting Python API |

---

## 2. Layer Deep Dive

### Frontend Stack (User Workspace)
* **Next.js / React:** Enables instant visual response during evidence upload and dynamic UI updates as readiness scores change[cite: 1].
* **Tailwind CSS:** Provides modern design tokens for displaying state indicators (Red/Yellow/Green readiness levels)[cite: 1].

### Backend Stack (Gateway & Utilities)
* **FastAPI:** Handles rapid multi-part image and document uploads with native async capabilities[cite: 1].
* **Pydantic:** Strictly validates incoming parameters and enforces schema outputs for downstream consumption[cite: 1].

### Processing & AI Stack (Intelligence Engine)
* **OCR & PDF Extraction:** Converts unstructured file formats (PNG, JPG, PDF) into clean, machine-readable string context[cite: 1].
* **LangChain + OpenAI (GPT-4o):** Serves as the primary evidence graph engine, comparing serial numbers, checking dates, and calculating the final readiness percentage[cite: 1].

---

## 3. Environment Dependencies (`requirements.txt`)

```text
fastapi>=0.110.0
uvicorn>=0.28.0
python-multipart>=0.0.9
pydantic>=2.6.0
langchain-openai>=0.0.8
pdfplumber>=0.10.4
pillow>=10.2.0
rapidocr-onnxruntime>=1.3.8