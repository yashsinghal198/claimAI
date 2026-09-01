# ClaimAI — Memory & Context Log

## Project Summary
- **Project:** ClaimAI — Pre-Claim Evidence Intelligence (CodeBuild 1.0 hackathon by Team Tribit)
- **Objective:** Pre-submission evidence validation layer generating explainable readiness scores (0-100), flagging contradictions/discrepancies, detecting visual forgery, conversational intake interviewing, guided in-browser camera scanning, anti-fraud pHash checks, and carrier-ready export packages.

---

## 🌟 The 5 Hackathon Winning Dynamic Features (ALL COMPLETE)

1. **💬 Conversational AI Intake Interviewer Agent (`InterviewerAgent.tsx`)**:
   - Interactive chat assistant at intake that asks follow-up questions to eliminate vague narratives.
   - Live real-time statement refinement and quick-answer suggestion chips.
   - Backed by `POST /api/v1/interview` endpoint with Groq Llama-3.3-70B.

2. **📸 "Smart Proof" Guided Photo Capture (`SmartCameraModal.tsx`)**:
   - In-browser mobile/web camera with HUD bounding box overlays:
     - *Serial Number Tag Bounding Box*
     - *Wide-Angle Damage Context Frame*
     - *Macro Crack Focus Crosshair*
   - Instant capture and auto-attachment to claim evidence.

3. **🛡️ Anti-Fraud Duplicate Claim & Perceptual Hash Check (`extractor.py` & `AuthenticityShield.tsx`)**:
   - Computes 64-bit difference perceptual hashes (dHash) to detect recycled claims and stock photos.
   - Evaluates EXIF editing software signatures (Photoshop, Canva) and generative AI model markers.

4. **⚡ "Instant Fix" 1-Click Auto-Resolution Assistant (`DiscrepancyInspector.tsx`)**:
   - Instant 1-click resolution button on conflict cards that auto-normalizes model codes and recovers +25 readiness score points in real time.

5. **📦 Carrier-Ready Export Package (`CarrierExportModal.tsx`)**:
   - One-click downloadable branded PDF Audit Certificate with Claim UUID, Forensics Seal, and Matrix using `jspdf` & `html2canvas`.
   - Structured JSON carrier claim payload matching enterprise insurance APIs.

---

## Architecture & Codebase Status
- Backend: FastAPI with Groq Llama-3.3-70B, rapidocr-onnxruntime, Pillow EXIF & dHash, pdfplumber.
- Frontend: Next.js App Router, Tailwind CSS, Lucide icons, html2canvas, jspdf.
- Deployed: Vercel (Frontend) & Render (Backend).
- GitHub: All code committed and pushed to `main` branch.
