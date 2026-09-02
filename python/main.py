"""
main.py
FastAPI gateway server for ClaimAI - Pre-Claim Evidence Intelligence.
Final Phase: Multipart Ingestion, Forensics with pHash, and Human Conversational Intake Interviewer.
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
    version="3.7.0"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GREETINGS = {"hi", "hio", "hello", "hey", "hey there", "hola", "sup", "good morning", "good evening", "hi there"}
COMPLIMENTS = {"you are good", "you're good", "good job", "nice", "thanks", "thank you", "awesome", "great", "cool", "perfect", "amazing"}


@app.get("/", tags=["Health"])
async def root():
    """Root health check and service info."""
    return {
        "service": "ClaimAI Pre-Claim Evidence Intelligence",
        "status": "online",
        "version": "3.7.0",
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
    Human-like Conversational AI interviewer that greets the user naturally,
    reviews the incident statement, asks clarifying follow-up questions,
    and refines the claim narrative in real-time without mechanical repetition.
    """
    current_statement = req.current_statement.strip()
    raw_user_input = (req.last_user_response or "").strip()
    last_response = raw_user_input.lower().strip("!.,?")
    history = req.messages

    # 1. Handle Compliments & Thanks
    if last_response in COMPLIMENTS or "you are good" in last_response or "thank you" in last_response:
        return InterviewResponse(
            assistant_reply="Thank you so much! 😊 I'm happy to help. Let me know if you want to add any details or test your claim evidence!",
            enhanced_statement=current_statement,
            clarifying_chips=["I dropped my device", "How does ClaimAI work?", "What documents do I need?"],
            is_statement_complete=False
        )

    # 2. Handle Greetings & Small Talk naturally without corrupting the statement
    if last_response in GREETINGS or not last_response:
        reply = (
            "Hey there! 👋 I'm your ClaimAI intake specialist. I'm here to help you build a bulletproof claim statement and spot any tricky document mismatches before you submit.\n\n"
            "What happened to your device? Feel free to describe the incident or pick one of the options below!"
        )
        if current_statement:
            reply = (
                f"Hey! 👋 I see you already have a draft statement: \"{current_statement}\".\n\n"
                "Let's make sure it's 100% carrier-ready. Was there any liquid exposure or spillage involved when this happened?"
            )
        return InterviewResponse(
            assistant_reply=reply,
            enhanced_statement=current_statement,
            clarifying_chips=[
                "Dropped laptop / phone",
                "Screen shattered after fall",
                "Liquid spilled on device",
                "No liquid, dry impact"
            ],
            is_statement_complete=False
        )

    # 3. Handle "How are you", "Who are you", small talk
    if "how are you" in last_response or "how r u" in last_response or "how are u" in last_response:
        return InterviewResponse(
            assistant_reply="I'm doing great, thanks for asking! 😊 I'm here and ready to help you analyze your claim evidence or answer any questions about your policy. How can I help you today?",
            enhanced_statement=current_statement,
            clarifying_chips=["I dropped my device", "How does ClaimAI work?", "What documents do I need?"],
            is_statement_complete=False
        )

    if "who are you" in last_response or "what are you" in last_response:
        return InterviewResponse(
            assistant_reply="I'm the ClaimAI Intake Assistant! 🤖 I use OCR and AI graph reasoning to cross-check purchase receipts against warranties, detect photo tampering, and make sure your claim gets approved without delays.",
            enhanced_statement=current_statement,
            clarifying_chips=["Tell me more about ClaimAI", "Analyze my claim", "How to upload photos"],
            is_statement_complete=False
        )

    # 4. Check if user is asking how ClaimAI works
    if any(q in last_response for q in ["how it works", "what do you do", "what is claimai", "what to do"]):
        return InterviewResponse(
            assistant_reply=(
                "Great question! 💡 ClaimAI scans your purchase receipt, warranty policy, and damage photos using OCR & AI graph reasoning. "
                "We calculate your Readiness Score (0-100%), detect model or serial mismatches, check photo EXIF timestamps, and generate a carrier-ready audit package.\n\n"
                "To get started, tell me what happened to your device or upload your invoice!"
            ),
            enhanced_statement=current_statement,
            clarifying_chips=["Dropped my device", "Model mismatch question", "How to upload files"],
            is_statement_complete=False
        )

    # 5. Handle liquid exposure replies specifically (No liquid / dry impact)
    is_liquid_reply = any(k in last_response for k in ["no liquid", "dry impact", "dry surface", "no water", "without liquid"])
    
    # 6. Enhance statement with genuine incident facts
    enhanced = current_statement
    is_meaningful_fact = len(raw_user_input) > 3 and not (last_response in GREETINGS or last_response in COMPLIMENTS)
    if is_meaningful_fact:
        if current_statement:
            if raw_user_input.lower() not in current_statement.lower():
                enhanced = f"{current_statement}. Context: {raw_user_input}".strip(". ") + "."
        else:
            enhanced = raw_user_input

    llm = _get_llm()
    if not llm:
        lower_enhanced = enhanced.lower()

        if is_liquid_reply or "liquid" in lower_enhanced or "dry" in lower_enhanced:
            return InterviewResponse(
                assistant_reply="Understood! Dry impact with no liquid exposure. 🛡️ Was the device inside a protective case or cover when it fell?",
                enhanced_statement=enhanced,
                clarifying_chips=["Protective case was installed", "No case, bare device", "Screen protector was on"],
                is_statement_complete=False
            )
        elif not any(k in lower_enhanced for k in ["desk", "floor", "office", "home", "car", "room", "table", "ground", "outdoors"]):
            return InterviewResponse(
                assistant_reply="Got it! I've updated your statement. 📍 Quick question: Where did this happen? (For example: indoors at an office desk, or outdoors on concrete?)",
                enhanced_statement=enhanced,
                clarifying_chips=["Indoors at my office desk", "At home on living room floor", "Outdoors on sidewalk"],
                is_statement_complete=False
            )
        elif not any(k in lower_enhanced for k in ["liquid", "water", "coffee", "spill", "dry", "splash"]):
            return InterviewResponse(
                assistant_reply="Understood! Was there any liquid or moisture involved during or after the impact?",
                enhanced_statement=enhanced,
                clarifying_chips=["No liquid involved, dry impact", "Minor water splash", "Liquid spilled on keyboard"],
                is_statement_complete=False
            )
        elif not any(k in lower_enhanced for k in ["case", "cover", "protector", "bare"]):
            return InterviewResponse(
                assistant_reply="Almost complete! Did the device have a protective case or screen protector on when it fell?",
                enhanced_statement=enhanced,
                clarifying_chips=["Protective case was installed", "No case, bare device", "Screen protector cracked"],
                is_statement_complete=False
            )
        else:
            return InterviewResponse(
                assistant_reply="Awesome! Your incident narrative now contains clear timeline, location, and risk context. Your statement is carrier-ready!",
                enhanced_statement=enhanced,
                clarifying_chips=["Looks perfect!", "Add more details"],
                is_statement_complete=True
            )

    # Dynamic LLM Interview Prompt
    try:
        from langchain_core.prompts import ChatPromptTemplate
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a warm, empathetic, and professional Insurance Claims Specialist AI for ClaimAI.
Respond naturally like a friendly human expert guiding a claimant through their intake.
Never repeat 'Understood! I've updated your statement...' mechanically.
Acknowledge what the user said with human empathy.
Ask 1 focused follow-up question to clarify missing risk details (location, liquid, case, timeline).
Do NOT re-ask questions the user already answered (e.g. if user said 'no liquid', move to asking about protective case).
Always provide 3 helpful, natural quick-reply answer chips.
Refine the enhanced_statement to be clear, chronological, and professional."""),
            ("user", f"Current Statement: {current_statement}\nLast User Input: {raw_user_input}\nChat History: {[m.model_dump() for m in history]}")
        ])
        structured_llm = llm.with_structured_output(InterviewResponse)
        chain = prompt | structured_llm
        result: InterviewResponse = await chain.ainvoke({})
        return result
    except Exception as e:
        logger.warning(f"LLM interview failed, using heuristic: {e}")
        return InterviewResponse(
            assistant_reply="Got it! I've recorded that detail. Was any liquid involved, or was it a dry surface impact?",
            enhanced_statement=enhanced,
            clarifying_chips=["No liquid, dry impact", "Protective case was installed", "Powered off immediately"],
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
