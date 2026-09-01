"""
main.py
FastAPI gateway server for ClaimAI - Pre-Claim Evidence Intelligence.
Final Phase: Multipart Ingestion, Forensics with pHash, and Conversational Intake Interviewer.
"""

import os
import logging
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from models import (
    ReadinessResponse,
    PhotoMetadata,
    ForensicAnalysis,
    InterviewRequest,
    InterviewResponse,
)
from extractor import (
    extract_text_from_pdf,
    extract_text_from_image,
    extract_text_from_txt,
    extract_image_exif_metadata,
    analyze_image_forensics,
)
from reasoning import analyze_evidence, _get_llm

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("claimai.main")

app = FastAPI(
    title="ClaimAI — Pre-Claim Evidence Intelligence API",
    description="API gateway for intelligent pre-submission insurance and warranty claim evidence validation.",
    version="3.5.0"
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
        "version": "3.5.0",
        "features": [
            "OCR & PDF Parsing",
            "EXIF Hardware Metadata",
            "Perceptual Hashing (dHash) Anti-Fraud",
            "Forgery & Manipulation Forensics",
            "Cross-Document Discrepancy Graph",
            "Conversational Intake Interviewer",
            "Carrier-Ready Compliance Audit"
        ],
        "endpoints": [
            "POST /api/v1/analyze",
            "POST /api/v1/interview"
        ]
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
    "/api/v1/interview",
    response_model=InterviewResponse,
    status_code=status.HTTP_200_OK,
    tags=["Intake"],
    summary="Interactive conversational intake interviewer to refine and clarify incident narratives"
)
async def interview_claimant(req: InterviewRequest):
    """
    Conversational AI interviewer that reviews the user's initial statement,
    asks clarifying follow-up questions to uncover risk details (liquid, location, case),
    and refines the incident statement in real-time.
    """
    current_statement = req.current_statement.strip()
    last_response = (req.last_user_response or "").strip()
    history = req.messages

    # Heuristic fallback if LLM is unavailable
    fallback_chips = ["Indoors on desk", "No liquid involved", "Protective case was on", "Device powered off immediately"]
    
    # Check if statement already has essential details
    has_date = any(k in current_statement for k in ["2024", "2025", "2026", "yesterday", "last week", "date"])
    has_location = any(k in current_statement.lower() for k in ["desk", "floor", "office", "home", "car", "room", "table"])
    has_mechanics = any(k in current_statement.lower() for k in ["drop", "crack", "spill", "fell", "shatter", "impact"])

    # Enhance statement with last user reply if provided
    enhanced = current_statement
    if last_response and last_response not in current_statement:
        enhanced = f"{current_statement}. Additional context: {last_response}".strip(". ") + "."

    llm = _get_llm()
    if not llm:
        if not has_location:
            return InterviewResponse(
                assistant_reply="Where did the incident occur? Was it indoors (e.g. office/home desk) or outdoors?",
                enhanced_statement=enhanced,
                clarifying_chips=["Indoors at my office desk", "At home in living room", "Outdoors while commuting"],
                is_statement_complete=False
            )
        elif not ("liquid" in enhanced.lower() or "water" in enhanced.lower()):
            return InterviewResponse(
                assistant_reply="Was there any liquid exposure or spillage involved during or after the drop?",
                enhanced_statement=enhanced,
                clarifying_chips=["No liquid exposure whatsoever", "Minor water splash", "Coffee/beverage spill"],
                is_statement_complete=False
            )
        else:
            return InterviewResponse(
                assistant_reply="Thank you! Your incident narrative now contains clear timeline, location, and risk context.",
                enhanced_statement=enhanced,
                clarifying_chips=["Use this refined statement", "Add more details"],
                is_statement_complete=True
            )

    # Dynamic LLM Interview Prompt
    try:
        from langchain_core.prompts import ChatPromptTemplate
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the Claims Intake Interviewer Agent for ClaimAI.
Your goal is to politely ask 1 focused, clarifying question to extract missing risk and timeline details from a user's claim incident statement.
If the statement is already detailed and complete, set is_statement_complete=True.
Always provide 3 helpful quick-reply answer chips.
Refine the enhanced_statement to be professional, chronological, and carrier-ready."""),
            ("user", f"Current Statement: {current_statement}\nLast User Input: {last_response}\nChat History: {[m.model_dump() for m in history]}")
        ])
        structured_llm = llm.with_structured_output(InterviewResponse)
        chain = prompt | structured_llm
        result: InterviewResponse = await chain.ainvoke({})
        return result
    except Exception as e:
        logger.warning(f"LLM interview failed, using heuristic: {e}")
        return InterviewResponse(
            assistant_reply="Could you clarify if any liquid was involved, or if the device had a protective case?",
            enhanced_statement=enhanced,
            clarifying_chips=["No liquid, dropped on carpet", "Protective case was installed", "Dry surface impact"],
            is_statement_complete=True
        )


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
    runs generative forgery & pHash duplicate forensics, and performs cross-document discrepancy graph reasoning.
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

                    # Forensics Analysis (Tampering + pHash)
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
        logger.info(f"Analysis complete. Score: {readiness_result.readiness_score}, Authenticity: {readiness_result.forensics.authenticity_score if readiness_result.forensics else 'N/A'}%")

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
