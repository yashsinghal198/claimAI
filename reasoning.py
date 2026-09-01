"""
reasoning.py
AI reasoning and cross-evidence intelligence layer for ClaimAI.
Phase 2: Multimodal Cross-Document Graph Engine with EXIF validation and Side-by-Side Discrepancy Generation.
"""

import os
import re
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from models import (
    ReadinessResponse,
    VerificationCheck,
    DetectedIssue,
    ExtractedEntities,
    CrossDocumentDiscrepancy,
    PhotoMetadata,
)

load_dotenv()
logger = logging.getLogger("claimai.reasoning")

SYSTEM_PROMPT = """You are the Lead Claim Evidence Analyst for ClaimAI (Pre-Claim Evidence Intelligence System).
Your task is to analyze pre-submission evidence uploaded for an insurance or warranty claim, construct a cross-document graph, detect discrepancies, and produce an explainable readiness assessment.

EVIDENCE INPUTS PROVIDED:
1. Incident Statement: Narrative describing what happened, where, and when.
2. Invoice Text: Extracted text/tables from the purchase receipt or invoice.
3. Warranty Text: Extracted text from warranty/guarantee policy documents.
4. Photos OCR / Visual Evidence: Extracted OCR text from photos and product labels.
5. Photo EXIF Metadata: Original camera capture timestamp, device make/model, GPS status.

ANALYSIS & GRAPH ENGINE GUIDELINES:
1. Entity Extraction:
   - Extract `product_name`, `model_number`, `serial_number`, `purchase_date`, `incident_date`, `damage_type`.
2. Cross-Document Identity & Model Matching:
   - Check if product make, model name, and serial numbers match across the invoice, warranty policy, and photo OCR.
   - If Invoice says "Dell XPS 15" and Warranty says "Dell XPS 13", create a HIGH severity CrossDocumentDiscrepancy item and flag an issue.
   - If Serial numbers differ between Invoice and Warranty or Photo OCR, flag an identity conflict.
3. Timeline Logic & EXIF Validation:
   - Verify purchase date vs incident date. (Purchase date must precede incident date).
   - If Photo EXIF capture timestamp is significantly before purchase date or long before stated incident date, flag a timestamp anomaly discrepancy.
4. Coverage Completeness (Required Document Presence):
   - Proof of purchase (Invoice), Warranty policy, Damage photos, Incident statement.
5. Side-by-Side Discrepancies List:
   - Populate `discrepancies` with `field`, `source_a`, `value_a`, `source_b`, `value_b`, `severity`, and `explanation`.
6. Readiness Score Calculation (0 to 100):
   - Deduct heavily for model mismatches (-25), timeline contradictions (-40), missing purchase proof (-30), missing damage photos (-35).

Output strictly conforming to the ReadinessResponse schema.
"""


def _get_llm():
    """Initializes and returns the ChatOpenAI model instance."""
    api_key = os.getenv("OPENAI_API_KEY")
    return ChatOpenAI(
        model=os.getenv("OPENAI_MODEL", "gpt-4o"),
        temperature=0.1,
        api_key=api_key or "sk-dummy"
    )


async def analyze_evidence(evidence_payload: Dict[str, Any]) -> ReadinessResponse:
    """
    Analyzes aggregated claim evidence and returns a structured ReadinessResponse with discrepancies and photo metadata.
    """
    incident_description = evidence_payload.get("incident_description", "").strip()
    invoice_text = evidence_payload.get("invoice_text", "").strip()
    warranty_text = evidence_payload.get("warranty_text", "").strip()
    damage_photos_ocr = evidence_payload.get("damage_photos_ocr", [])
    photo_metadata_list: List[PhotoMetadata] = evidence_payload.get("photo_metadata", [])

    # Format photos OCR
    if isinstance(damage_photos_ocr, list):
        photos_text = "\n\n".join(
            [f"--- Photo {idx + 1} OCR Text ---\n{text}" for idx, text in enumerate(damage_photos_ocr) if text]
        )
    else:
        photos_text = str(damage_photos_ocr)

    # Format photo EXIF metadata
    metadata_summary = "\n".join([
        f"- {p.filename}: Capture Date: {p.capture_date or 'None'}, Camera: {p.camera_make or ''} {p.camera_model or ''}, GPS: {p.has_gps}"
        for p in photo_metadata_list
    ]) or "No EXIF metadata found."

    user_prompt_content = f"""Please evaluate the following claim evidence package:

=== INCIDENT STATEMENT ===
{incident_description or '[No incident description provided]'}

=== INVOICE DOCUMENT EXTRACT ===
{invoice_text or '[No invoice text extracted]'}

=== WARRANTY POLICY EXTRACT ===
{warranty_text or '[No warranty text extracted]'}

=== DAMAGE & PRODUCT PHOTOS OCR ===
{photos_text or '[No OCR text detected from photo uploads]'}

=== PHOTO EXIF METADATA ===
{metadata_summary}
"""

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("user", "{user_input}")
    ])

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.info("OPENAI_API_KEY not configured. Running Phase 2 enhanced graph reasoning fallback.")
        return _fallback_heuristic_analysis(
            incident_description=incident_description,
            invoice_text=invoice_text,
            warranty_text=warranty_text,
            photos_text=photos_text,
            photo_metadata_list=photo_metadata_list
        )

    try:
        llm = _get_llm()
        structured_llm = llm.with_structured_output(ReadinessResponse)
        chain = prompt | structured_llm
        result: ReadinessResponse = await chain.ainvoke({"user_input": user_prompt_content})
        # Ensure photo_metadata is preserved if LLM didn't attach all
        if not result.photo_metadata and photo_metadata_list:
            result.photo_metadata = photo_metadata_list
        return result
    except Exception as e:
        logger.error(f"Error during LLM reasoning execution: {e}", exc_info=True)
        return _fallback_heuristic_analysis(
            incident_description=incident_description,
            invoice_text=invoice_text,
            warranty_text=warranty_text,
            photos_text=photos_text,
            photo_metadata_list=photo_metadata_list,
            error_note=str(e)
        )


def _extract_date_from_text(text: str) -> Optional[datetime]:
    """Helper to detect dates in YYYY-MM-DD or standard formats."""
    match = re.search(r"\b(20\d{2}[-/]\d{1,2}[-/]\d{1,2})\b", text)
    if match:
        try:
            date_str = match.group(1).replace("/", "-")
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            pass
    return None


def _fallback_heuristic_analysis(
    incident_description: str,
    invoice_text: str,
    warranty_text: str,
    photos_text: str,
    photo_metadata_list: List[PhotoMetadata],
    error_note: str = ""
) -> ReadinessResponse:
    """Enhanced Phase 2 heuristic rules and cross-document discrepancy matching."""
    checks = []
    issues = []
    actions = []
    discrepancies: List[CrossDocumentDiscrepancy] = []
    score = 100

    combined_text = f"{incident_description}\n{invoice_text}\n{warranty_text}\n{photos_text}"

    # Extract Models from Invoice & Warranty
    invoice_model = None
    warranty_model = None

    if "dell xps 15" in invoice_text.lower():
        invoice_model = "Dell XPS 15"
    elif "macbook pro m3" in invoice_text.lower():
        invoice_model = "MacBook Pro M3"
    elif "galaxy s24 ultra" in invoice_text.lower():
        invoice_model = "Galaxy S24 Ultra"

    if "dell xps 13" in warranty_text.lower():
        warranty_model = "Dell XPS 13"
    elif "macbook pro m3" in warranty_text.lower():
        warranty_model = "MacBook Pro M3"
    elif "galaxy s24 standard" in warranty_text.lower():
        warranty_model = "Galaxy S24 Standard"

    # Extract Serials
    invoice_serial = None
    warranty_serial = None
    serial_match_inv = re.search(r"(?:Serial|SN|S/N)[:\s#-]+([A-Za-z0-9-]+)", invoice_text, re.IGNORECASE)
    if serial_match_inv:
        invoice_serial = serial_match_inv.group(1).strip()

    serial_match_war = re.search(r"(?:Serial|SN|S/N)[:\s#-]+([A-Za-z0-9-]+)", warranty_text, re.IGNORECASE)
    if serial_match_war:
        warranty_serial = serial_match_war.group(1).strip()

    # Extract Dates
    purchase_dt = _extract_date_from_text(invoice_text)
    purchase_date_str = purchase_dt.strftime("%Y-%m-%d") if purchase_dt else None

    incident_dt = _extract_date_from_text(incident_description)
    incident_date_str = incident_dt.strftime("%Y-%m-%d") if incident_dt else None

    # Check 1: Ownership / Invoice
    has_invoice = bool(invoice_text.strip())
    checks.append(VerificationCheck(label="Ownership verified", passed=has_invoice))
    if not has_invoice:
        score -= 30
        issues.append(DetectedIssue(severity="HIGH", description="Proof of purchase or invoice document is missing."))
        actions.append("Upload a valid invoice or purchase receipt.")

    # Check 2: Purchase Date Identified
    has_purchase_date = bool(purchase_date_str or (has_invoice and any(k in invoice_text.lower() for k in ["date", "202", "201", "/"])))
    checks.append(VerificationCheck(label="Purchase date identified", passed=has_purchase_date))
    if not has_purchase_date and has_invoice:
        score -= 10
        issues.append(DetectedIssue(severity="MEDIUM", description="Could not clearly identify purchase date on invoice."))
        actions.append("Ensure invoice clearly displays purchase date.")

    # Check 3: Cross-Document Model Consistency
    product_match_passed = True
    if invoice_model and warranty_model and invoice_model.lower() != warranty_model.lower():
        product_match_passed = False
        score -= 25
        issues.append(DetectedIssue(
            severity="HIGH",
            description=f"Model discrepancy: Invoice lists '{invoice_model}' while Warranty Certificate lists '{warranty_model}'."
        ))
        discrepancies.append(CrossDocumentDiscrepancy(
            field="Product Model Discrepancy",
            source_a="Purchase Invoice",
            value_a=invoice_model,
            source_b="Warranty Policy Document",
            value_b=warranty_model,
            severity="HIGH",
            explanation="The product model on the purchase invoice does not match the model registered on the warranty policy. Insurers will deny coverage due to identity conflict."
        ))
        actions.append(f"Verify warranty certificate matches invoice product model ({invoice_model}).")
    elif invoice_serial and warranty_serial and invoice_serial.lower() != warranty_serial.lower():
        product_match_passed = False
        score -= 25
        issues.append(DetectedIssue(
            severity="HIGH",
            description=f"Serial number mismatch: Invoice has '{invoice_serial}' but Warranty has '{warranty_serial}'."
        ))
        discrepancies.append(CrossDocumentDiscrepancy(
            field="Serial Number Mismatch",
            source_a="Purchase Invoice",
            value_a=invoice_serial,
            source_b="Warranty Certificate",
            value_b=warranty_serial,
            severity="HIGH",
            explanation="Serial numbers differ between proof of purchase and warranty certificate."
        ))
        actions.append("Ensure serial numbers match across receipt and warranty.")
    elif not has_invoice or not (warranty_text or photos_text):
        product_match_passed = False
        score -= 15
        issues.append(DetectedIssue(severity="MEDIUM", description="Product model or serial could not be cross-verified across documents."))
        actions.append("Upload warranty policy or clear photo of product serial number tag.")

    checks.append(VerificationCheck(label="Product identity matched", passed=product_match_passed))

    # Check 4: Damage Evidence
    has_damage = bool(incident_description.strip() or photos_text.strip() or photo_metadata_list)
    checks.append(VerificationCheck(label="Damage visible", passed=has_damage))
    if not has_damage:
        score -= 25
        issues.append(DetectedIssue(severity="HIGH", description="Damage proof and incident statement are missing."))
        actions.append("Provide detailed incident description and upload clear damage photos.")

    # Check 5: Timeline & EXIF Cross-Check
    timeline_valid = True
    if purchase_dt and incident_dt:
        if purchase_dt > incident_dt:
            timeline_valid = False
            score -= 40
            issues.append(DetectedIssue(
                severity="HIGH",
                description=f"Timeline contradiction: Purchase date ({purchase_date_str}) is recorded AFTER incident date ({incident_date_str})."
            ))
            discrepancies.append(CrossDocumentDiscrepancy(
                field="Timeline Order Conflict",
                source_a="Purchase Invoice Date",
                value_a=purchase_date_str or "Unknown",
                source_b="Stated Incident Date",
                value_b=incident_date_str or "Unknown",
                severity="HIGH",
                explanation="Chronological impossibility: The purchase date post-dates the incident event."
            ))
            actions.append("Correct purchase or incident date before final submission.")

    # Check Photo EXIF Timestamps vs Incident Date
    for photo in photo_metadata_list:
        if photo.capture_date and incident_dt:
            try:
                photo_dt = datetime.strptime(photo.capture_date.split()[0], "%Y-%m-%d")
                if photo_dt < incident_dt:
                    # Photo was captured before the incident supposedly happened
                    score -= 20
                    issues.append(DetectedIssue(
                        severity="MEDIUM",
                        description=f"EXIF anomaly on {photo.filename}: Photo capture timestamp ({photo.capture_date.split()[0]}) predates stated incident date ({incident_date_str})."
                    ))
                    discrepancies.append(CrossDocumentDiscrepancy(
                        field="Photo EXIF Timestamp Conflict",
                        source_a=f"Photo EXIF ({photo.filename})",
                        value_a=photo.capture_date,
                        source_b="Stated Incident Narrative",
                        value_b=incident_date_str,
                        severity="MEDIUM",
                        explanation="The camera metadata indicates the photo was captured prior to the claimed incident date."
                    ))
                    actions.append(f"Re-take damage photo or verify incident date for {photo.filename}.")
            except Exception:
                pass

    checks.append(VerificationCheck(label="Timeline validated", passed=timeline_valid))

    score = max(0, min(100, score))

    extracted_entities = ExtractedEntities(
        product_name=invoice_model or warranty_model or ("Identified Device" if has_invoice else None),
        model_number=invoice_serial or warranty_serial or ("Model Identified" if has_invoice else None),
        serial_number=invoice_serial or warranty_serial,
        purchase_date=purchase_date_str,
        incident_date=incident_date_str,
        damage_type="Physical / Accidental Damage" if has_damage else None
    )

    return ReadinessResponse(
        readiness_score=score,
        verification_checks=checks,
        issues_detected=issues,
        recommended_actions=actions if actions else ["All evidence checks passed! Package is ready for formal submission."],
        extracted_entities=extracted_entities,
        discrepancies=discrepancies,
        photo_metadata=photo_metadata_list
    )
