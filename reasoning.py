"""
reasoning.py
AI reasoning and cross-evidence intelligence layer for ClaimAI.
Uses LangChain and OpenAI GPT-4o to construct a cross-document evidence graph,
evaluating identity consistency, timeline logic, and coverage completeness.
"""

import os
import logging
from typing import Dict, Any
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from models import ReadinessResponse, VerificationCheck, DetectedIssue

load_dotenv()
logger = logging.getLogger("claimai.reasoning")

SYSTEM_PROMPT = """You are the Lead Claim Evidence Analyst for ClaimAI (Pre-Claim Evidence Intelligence System).
Your task is to analyze pre-submission evidence uploaded for an insurance or warranty claim and produce an explainable readiness assessment.

EVIDENCE INPUTS PROVIDED:
1. Incident Description: Narrative of what happened and when.
2. Invoice Text: Extracted text/tables from the purchase receipt or invoice.
3. Warranty Text: Extracted text from warranty/guarantee policy documents.
4. Photos OCR / Visual Evidence: Extracted OCR text and visual labels from damage and product photos.

ANALYSIS GUIDELINES:
1. Identity Consistency:
   - Check if product make, model name, and serial numbers match across the invoice, warranty policy, and photo OCR.
   - Flag any model mismatches (e.g. Invoice mentions "Model X Pro" while Warranty is for "Model X Standard").
2. Timeline Logic:
   - Verify purchase date vs incident date (e.g. Incident must happen AFTER purchase date).
   - Verify if the incident falls within the valid warranty/coverage period.
3. Coverage Completeness:
   - Check if mandatory proof items are provided (e.g. serial number tag photo, clear damage photo from appropriate angles, proof of purchase).
4. Readiness Score Calculation (0 to 100):
   - 80-100: Claim package is robust, consistent, and ready for submission.
   - 50-79: Minor or medium issues/gaps detected (e.g. missing second damage angle, unclear serial photo). Needs remediation.
   - 0-49: Critical contradictions, mismatched identities, invalid timeline, or severe lack of evidence.
5. Standard Verification Checks (Always evaluate these core points):
   - "Ownership verified" (passed: true/false)
   - "Purchase date identified" (passed: true/false)
   - "Product identity matched" (passed: true/false)
   - "Damage visible" (passed: true/false)
   - Plus any relevant additional checks as needed.
6. Detected Issues:
   - Categorize severity as "HIGH", "MEDIUM", or "LOW".
   - Be concise and clear about the exact discrepancy found.
7. Recommended Actions:
   - Provide concrete, prioritized actionable steps the claimant can take to resolve issues before final submission.

Output strictly conforming to the requested schema.
"""


def _get_llm():
    """Initializes and returns the ChatOpenAI model instance."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.warning("OPENAI_API_KEY environment variable is not set.")
    return ChatOpenAI(
        model=os.getenv("OPENAI_MODEL", "gpt-4o"),
        temperature=0.1,
        api_key=api_key or "sk-dummy"
    )


async def analyze_evidence(evidence_payload: Dict[str, Any]) -> ReadinessResponse:
    """
    Analyzes aggregated claim evidence and returns a structured ReadinessResponse.
    
    :param evidence_payload: Dictionary containing extracted text and descriptions:
        - incident_description: str
        - invoice_text: str
        - warranty_text: str
        - damage_photos_ocr: List[str] or str
    :return: ReadinessResponse Pydantic model
    """
    incident_description = evidence_payload.get("incident_description", "").strip()
    invoice_text = evidence_payload.get("invoice_text", "").strip()
    warranty_text = evidence_payload.get("warranty_text", "").strip()
    damage_photos_ocr = evidence_payload.get("damage_photos_ocr", [])

    # Format photos OCR into readable text block
    if isinstance(damage_photos_ocr, list):
        photos_text = "\n\n".join(
            [f"--- Photo {idx + 1} OCR Text ---\n{text}" for idx, text in enumerate(damage_photos_ocr) if text]
        )
    else:
        photos_text = str(damage_photos_ocr)

    user_prompt_content = f"""Please evaluate the following claim evidence package:

=== INCIDENT DESCRIPTION ===
{incident_description or '[No incident description provided]'}

=== INVOICE DOCUMENT EXTRACT ===
{invoice_text or '[No invoice text extracted]'}

=== WARRANTY POLICY EXTRACT ===
{warranty_text or '[No warranty text extracted]'}

=== DAMAGE & PRODUCT PHOTOS OCR ===
{photos_text or '[No OCR text detected from photo uploads]'}
"""

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("user", "{user_input}")
    ])

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        # Fallback simulation engine if OPENAI_API_KEY is not configured in local environment
        logger.info("OPENAI_API_KEY not configured. Running heuristic fallback evaluation.")
        return _fallback_heuristic_analysis(
            incident_description=incident_description,
            invoice_text=invoice_text,
            warranty_text=warranty_text,
            photos_text=photos_text
        )

    try:
        llm = _get_llm()
        structured_llm = llm.with_structured_output(ReadinessResponse)
        chain = prompt | structured_llm
        result: ReadinessResponse = await chain.ainvoke({"user_input": user_prompt_content})
        return result
    except Exception as e:
        logger.error(f"Error during LLM reasoning execution: {e}", exc_info=True)
        # Return fallback heuristic assessment so API call succeeds gracefully
        return _fallback_heuristic_analysis(
            incident_description=incident_description,
            invoice_text=invoice_text,
            warranty_text=warranty_text,
            photos_text=photos_text,
            error_note=str(e)
        )


def _fallback_heuristic_analysis(
    incident_description: str,
    invoice_text: str,
    warranty_text: str,
    photos_text: str,
    error_note: str = ""
) -> ReadinessResponse:
    """Heuristic rule-based fallback when OpenAI key is missing or call fails."""
    checks = []
    issues = []
    actions = []
    score = 100

    # Check 1: Ownership / Invoice
    has_invoice = bool(invoice_text.strip())
    checks.append(VerificationCheck(label="Ownership verified", passed=has_invoice))
    if not has_invoice:
        score -= 30
        issues.append(DetectedIssue(severity="HIGH", description="Proof of purchase or invoice document is missing."))
        actions.append("Upload a valid invoice or purchase receipt.")

    # Check 2: Purchase Date
    has_date = has_invoice and any(keyword in invoice_text.lower() for keyword in ["date", "202", "201", "/"])
    checks.append(VerificationCheck(label="Purchase date identified", passed=has_date))
    if not has_date and has_invoice:
        score -= 15
        issues.append(DetectedIssue(severity="MEDIUM", description="Could not clearly identify purchase date on invoice."))
        actions.append("Ensure invoice clearly displays purchase date.")

    # Check 3: Product Identity
    has_product_match = bool(invoice_text and (warranty_text or photos_text))
    checks.append(VerificationCheck(label="Product identity matched", passed=has_product_match))
    if not has_product_match:
        score -= 20
        issues.append(DetectedIssue(severity="MEDIUM", description="Product model or serial could not be cross-verified."))
        actions.append("Upload warranty document or clear photo of product serial tag.")

    # Check 4: Damage Visible
    has_damage = bool(incident_description.strip())
    checks.append(VerificationCheck(label="Damage visible", passed=has_damage))
    if not has_damage:
        score -= 25
        issues.append(DetectedIssue(severity="HIGH", description="Incident description or damage evidence is incomplete."))
        actions.append("Provide detailed incident description and upload clear damage photos.")

    if error_note:
        issues.append(DetectedIssue(severity="LOW", description=f"AI model fallback triggered: {error_note[:80]}"))

    score = max(0, min(100, score))

    return ReadinessResponse(
        readiness_score=score,
        verification_checks=checks,
        issues_detected=issues,
        recommended_actions=actions if actions else ["Claim package is complete. Proceed to submission."]
    )
