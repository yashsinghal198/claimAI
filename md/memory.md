# ClaimAI — Memory & Context Log

## Project Summary
- **Project:** ClaimAI — Pre-Claim Evidence Intelligence (CodeBuild 1.0 hackathon by Team Tribit)
- **Objective:** Pre-submission evidence validation layer generating explainable readiness scores (0-100), flagging contradictions/discrepancies, detecting visual forgery, conversational intake interviewing, guided in-browser camera scanning, anti-fraud pHash checks, visual OCR bounding box overlays, and carrier-ready export packages.

---

## 🌟 Visual OCR Bounding Box Inspection ([PhotoMetadataCard.tsx](file:///c:/Users/Yash/OneDrive/Desktop/claimAI/frontend/src/components/PhotoMetadataCard.tsx))

1. **Backend Extraction ([extractor.py](file:///c:/Users/Yash/OneDrive/Desktop/claimAI/extractor.py))**:
   - Computes normalized bounding box coordinates `[x, y, w, h]` (percentages) for all detected OCR text regions using `rapidocr-onnxruntime`.
   - Returns structured `OCRBoundingBox` objects in `PhotoMetadata`.
2. **Frontend Glowing Visual Overlays**:
   - Renders glowing cyan/emerald bounding box overlays directly over detected serial numbers, model tags, and crack regions on image previews during demos.
   - Displays hover label tags with extracted text and confidence scores (*e.g. `SERIAL: SN-DELL-INSP-90812 (98%)`*).

---

## 🌟 Dynamic Client-Side Score Animation & Increment Badges

1. **⚡ Dynamic Recalculation**:
   - When a user resolves a conflict in `DiscrepancyInspector.tsx` or checks off an issue card in `VerificationChecklist.tsx`, the score animates dynamically upwards on the client side (e.g., **76% ➔ 95%**).
2. **❇️ Floating Green Increment Badge**:
   - Displays a pulsing green badge (**+19 PTS RECOVERED**) over the gauge during score transitions.
3. **🎉 Celebration Confetti**:
   - Fires celebratory confetti particles when reaching 80%+ readiness.

---

## 🌟 Preset Demo Scenarios (Judge Quick-Select)

1. **🟢 Clean & Complete Claim (95% Ready)**:
   - Dell Inspiron laptop with matching receipt, warranty, clear damage photo, and serial tag.
2. **🟡 Model Mismatch & Missing Serial Tag (76% Ready)**:
   - Invoice says Dell Inspiron 15, but warranty says Dell XPS 13, missing serial tag photo.
3. **🔴 Suspected Duplicate / Low Readiness (35% Ready)**:
   - Missing receipt, duplicate image warning triggered (pHash match), missing incident date.

---

## 🌟 The 5 Hackathon Winning Dynamic Features (ALL COMPLETE)

1. **💬 Conversational AI Intake Interviewer Agent (`InterviewerAgent.tsx`)**:
   - Interactive chat assistant at intake that asks follow-up questions to eliminate vague narratives.

2. **📸 "Smart Proof" Guided Photo Capture (`SmartCameraModal.tsx`)**:
   - In-browser mobile/web camera with HUD bounding box overlays.

3. **🛡️ Anti-Fraud Duplicate Claim & Perceptual Hash Check (`extractor.py` & `AuthenticityShield.tsx`)**:
   - Computes 64-bit difference perceptual hashes (dHash) to detect recycled claims and stock photos.

4. **⚡ "Instant Fix" 1-Click Auto-Resolution Assistant (`DiscrepancyInspector.tsx`)**:
   - Instant 1-click resolution button on conflict cards that auto-normalizes model codes.

5. **📦 Carrier-Ready Export Package (`CarrierExportModal.tsx`)**:
   - One-click downloadable branded PDF Audit Certificate with Claim UUID, Forensics Seal, and Matrix.
