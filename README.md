# ClaimAI — Pre-Claim Evidence Intelligence System

> **Before you submit a claim, know whether your evidence is actually ready.**  
> Built for the **CodeBuild 1.0** hackathon by **Team Tribit**.

---

## 📌 Overview

**ClaimAI** is an intelligent pre-submission evidence validation layer for insurance and warranty claims. Rather than approving or rejecting claims, ClaimAI:
1. Ingests multimodal evidence (invoices, warranty certificates, photos, and incident narratives).
2. Runs OCR and PDF parsers to extract serial numbers, dates, models, and damage descriptions.
3. Uses an AI Evidence Graph powered by **OpenAI GPT-4o** to cross-reference documents and detect contradictions.
4. Generates an **explainable readiness score (0–100%)**, validation check statuses, flagged discrepancies, and an actionable remediation plan.

---

## 🏗️ Architecture & Data Flow

```
[ User Uploads: Invoice, Warranty, Damage Photos, Narrative ]
                          │
                          ▼
            [ FastAPI Gateway (/api/v1/analyze) ]
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
[ RapidOCR Image Parsing ]      [ pdfplumber PDF Parsing ]
         │                                 │
         └────────────────┬────────────────┘
                          ▼
     [ GPT-4o Cross-Document Evidence Graph ]
                          │
                          ▼
[ Structured Readiness Assessment (Score, Checks, Issues, Next Steps) ]
                          │
                          ▼
      [ Modern Next.js / Tailwind CSS Workspace ]
```

---

## 🛠️ Tech Stack

- **Backend:** FastAPI (Python 3.10+), Uvicorn, Pydantic v2
- **Document Processing:** `pdfplumber` (PDF parsing), `rapidocr-onnxruntime` + `Pillow` (OCR)
- **AI Reasoning Engine:** LangChain + OpenAI `gpt-4o`
- **Frontend Workspace:** Next.js (App Router), React, Tailwind CSS, Lucide Icons, Canvas Confetti

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/<your-username>/claimAI.git
cd claimAI

# Create virtual environment & activate
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# (Optional) Add your OpenAI API key for live GPT-4o reasoning
cp .env.example .env

# Start FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*API interactive documentation: [http://localhost:8000/docs](http://localhost:8000/docs)*

---

### 3. Frontend Setup
```bash
# In a new terminal tab:
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000) in your browser.*

---

## 🧪 Automated Testing
Run the backend smoke test suite:
```bash
python test_claimai.py
```

---

## 📄 License
MIT License. Built for CodeBuild 1.0 by Team Tribit.
