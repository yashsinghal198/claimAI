"""
main.py
FastAPI gateway server for ClaimAI - Pre-Claim Evidence Intelligence.
Phase 3: Multipart document ingestion with EXIF metadata, Forensics analysis & Cross-Document Graph Reasoning.
"""

import logging
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from models import ReadinessResponse, PhotoMetadata, ForensicAnalysis
from extractor import (
    extract_text_from_pdf,
    extract_text_from_image,
    extract_text_from_txt,
    extract_image_exif_metadata,
    analyze_image_forensics,
)
from reasoning import analyze_evidence

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("claimai.main")

app = FastAPI(
    title="ClaimAI — Pre-Claim Evidence Intelligence API",
    description="API gateway for intelligent pre-submission insurance and warranty claim evidence validation.",
    version="3.0.0"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    """Root health check and service info."""
    return {
        "service": "ClaimAI Pre-Claim Evidence Intelligence",
        "status": "online",
        "version": "3.0.0",
        "features": [
            "OCR & PDF Parsing",
            "EXIF Hardware Metadata",
            "Forgery & Manipulation Forensics",
            "Cross-Document Discrepancy Graph",
            "Carrier-Ready Compliance Audit"
        ],
        "endpoint": "POST /api/v1/analyze"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check status endpoint."""
    return {"status": "healthy"}


async def _parse_upload_file(file: Optional[UploadFile]) -> str:
    """Helper to detect file type (PDF, Text, Image) and extract text via appropriate extractor."""
    if not file:
        return ""
    
    file_bytes = await file.read()
    if not file_bytes:
        return ""

    filename = (file.filename or "").lower()
    content_type = (file.content_type or "").lower()

    if filename.endswith(".pdf") or "application/pdf" in content_type:
        return await extract_text_from_pdf(file_bytes)
    elif filename.endswith(".txt") or "text/plain" in content_type:
        return extract_text_from_txt(file_bytes)
    else:
        return await extract_text_from_image(file_bytes)


@app.post(
    "/api/v1/analyze",
    response_model=ReadinessResponse,
    status_code=status.HTTP_200_OK,
    tags=["Analysis"],
    summary="Analyze claim evidence package and return explainable readiness score, discrepancies, and forensics"
)
async def analyze_claim_evidence(
    incident_description: Optional[str] = Form(None, description="Detailed text narrative describing what happened"),
    invoice: Optional[UploadFile] = File(None, description="Purchase invoice or receipt (PDF, Image, or Text)"),
    warranty: Optional[UploadFile] = File(None, description="Warranty or policy document (PDF, Image, or Text)"),
    damage_photos: Optional[List[UploadFile]] = File(None, description="Damage and product serial photos")
):
    """
    Accepts multipart claim evidence, extracts structured text, EXIF metadata,
    runs generative forgery forensics, and performs cross-document discrepancy graph reasoning.
    """
    logger.info("Received request to /api/v1/analyze")

    try:
        # 1. Parse Invoice
        invoice_text = ""
        if invoice:
            logger.info(f"Parsing invoice document: {invoice.filename}")
            invoice_text = await _parse_upload_file(invoice)

        # 2. Parse Warranty
        warranty_text = ""
        if warranty:
            logger.info(f"Parsing warranty document: {warranty.filename}")
            warranty_text = await _parse_upload_file(warranty)

        # 3. Parse Damage Photos OCR, EXIF & Forensics
        photos_ocr = []
        photo_metadata_list: List[PhotoMetadata] = []
        overall_forensics: Optional[ForensicAnalysis] = None

        if damage_photos:
            for idx, photo in enumerate(damage_photos):
                logger.info(f"Processing photo {idx + 1}: {photo.filename}")
                photo_bytes = await photo.read()
                if photo_bytes:
                    # OCR Text
                    ocr_text = await extract_text_from_image(photo_bytes)
                    if ocr_text:
                        photos_ocr.append(ocr_text)

                    # EXIF Metadata
                    exif_data = extract_image_exif_metadata(photo_bytes, photo.filename or f"photo_{idx + 1}.jpg")
                    photo_metadata_list.append(exif_data)

                    # Forensics Analysis
                    photo_forensics = analyze_image_forensics(photo_bytes, photo.filename or f"photo_{idx + 1}.jpg")
                    if overall_forensics is None or (photo_forensics.is_tampered and not overall_forensics.is_tampered):
                        overall_forensics = photo_forensics

        # 4. Construct payload for reasoning engine
        evidence_payload = {
            "incident_description": incident_description or "",
            "invoice_text": invoice_text,
            "warranty_text": warranty_text,
            "damage_photos_ocr": photos_ocr,
            "photo_metadata": photo_metadata_list,
            "forensics": overall_forensics
        }

        # 5. Run AI Reasoning & Discrepancy Graph Engine
        readiness_result: ReadinessResponse = await analyze_evidence(evidence_payload)
        logger.info(f"Analysis complete. Readiness score: {readiness_result.readiness_score}, Authenticity: {readiness_result.forensics.authenticity_score if readiness_result.forensics else 'N/A'}%")

        return readiness_result

    except Exception as e:
        logger.error(f"Error processing analyze request: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze claim evidence: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
