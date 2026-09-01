"""
test_claimai.py
Smoke test script to verify ClaimAI Phase 1:
- Pydantic models with ExtractedEntities
- Extractors (PDF, Image OCR, Text files)
- Reasoning rules engine & timeline cross-checks
- FastAPI /api/v1/analyze endpoint
"""

import io
import asyncio
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient

from models import ReadinessResponse, VerificationCheck, DetectedIssue, ExtractedEntities
from extractor import extract_text_from_pdf, extract_text_from_image, extract_text_from_txt
from reasoning import analyze_evidence
from main import app


def test_models():
    """Verify Pydantic models serialization and validation."""
    print("[1/4] Testing Pydantic Data Models & ExtractedEntities...")
    check = VerificationCheck(label="Ownership verified", passed=True)
    issue = DetectedIssue(severity="HIGH", description="Missing serial photo")
    entities = ExtractedEntities(
        product_name="MacBook Pro M3",
        model_number="MBP-M3-16",
        serial_number="SN-998811",
        purchase_date="2024-01-15",
        incident_date="2024-05-10",
        damage_type="Screen Impact Crack"
    )
    response = ReadinessResponse(
        readiness_score=85,
        verification_checks=[check],
        issues_detected=[issue],
        recommended_actions=["Upload serial photo"],
        extracted_entities=entities
    )
    json_data = response.model_dump()
    assert json_data["readiness_score"] == 85
    assert json_data["verification_checks"][0]["label"] == "Ownership verified"
    assert json_data["issues_detected"][0]["severity"] == "HIGH"
    assert json_data["extracted_entities"]["product_name"] == "MacBook Pro M3"
    print("  [OK] Models & Entities passed.")


async def test_extractor():
    """Verify image OCR, PDF fallback, and text decoding."""
    print("[2/4] Testing Document / Image Extractors...")
    # 1. Text extractor
    txt_sample = b"Invoice #101\nItem: Smart Phone\nDate: 2024-01-10"
    txt_res = extract_text_from_txt(txt_sample)
    assert "Smart Phone" in txt_res

    # 2. Image OCR
    img = Image.new("RGB", (300, 100), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((20, 35), "SERIAL-ABC-12345", fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    img_bytes = buf.getvalue()

    ocr_result = await extract_text_from_image(img_bytes)
    print(f"  [OK] Image OCR output: '{ocr_result}'")

    # 3. PDF Fallback
    pdf_fallback = await extract_text_from_pdf(b"")
    assert pdf_fallback == ""
    print("  [OK] Extractor fallbacks and text parsing passed.")


async def test_reasoning():
    """Verify reasoning rules engine, timeline checks, and entity extraction."""
    print("[3/4] Testing Reasoning Engine (Rules + Timeline logic)...")
    
    # Test Normal Valid Case
    valid_payload = {
        "incident_description": "Dropped my phone on 2024-05-10, screen is cracked.",
        "invoice_text": "Invoice #1029\nDate: 2024-01-15\nProduct: Phone Ultra X\nSerial: SN-998811",
        "warranty_text": "1-Year Limited Warranty for Phone Ultra X. Valid until 2025-01-15.",
        "damage_photos_ocr": ["SN-998811 Phone Ultra X"]
    }
    result = await analyze_evidence(valid_payload)
    assert isinstance(result, ReadinessResponse)
    assert 0 <= result.readiness_score <= 100
    assert result.extracted_entities is not None
    assert result.extracted_entities.serial_number == "SN-998811"
    print(f"  [OK] Normal score: {result.readiness_score}/100")
    print(f"  [OK] Extracted entities: {result.extracted_entities.model_dump()}")

    # Test Timeline Contradiction Case (Purchase Date 2024-12-01 > Incident Date 2024-05-01)
    contradiction_payload = {
        "incident_description": "Damaged on 2024-05-01 during rain.",
        "invoice_text": "Invoice Date: 2024-12-01\nProduct: Smart Watch",
        "warranty_text": "",
        "damage_photos_ocr": []
    }
    contradiction_result = await analyze_evidence(contradiction_payload)
    has_timeline_issue = any("Timeline contradiction" in issue.description for issue in contradiction_result.issues_detected)
    assert has_timeline_issue, "Expected timeline contradiction issue to be flagged"
    print(f"  [OK] Timeline contradiction correctly flagged! Issues: {len(contradiction_result.issues_detected)}")


def test_api():
    """Verify FastAPI endpoint with multipart data."""
    print("[4/4] Testing FastAPI /api/v1/analyze endpoint...")
    client = TestClient(app)

    # Health check
    res = client.get("/health")
    assert res.status_code == 200

    # Multipart analyze endpoint
    img = Image.new("RGB", (200, 50), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    files = [
        ("invoice", ("receipt.jpg", buf, "image/jpeg"))
    ]
    data = {
        "incident_description": "Water spillage on laptop keyboard on 2024-07-20"
    }

    response = client.post("/api/v1/analyze", data=data, files=files)
    assert response.status_code == 200, f"API Error: {response.text}"
    resp_json = response.json()
    assert "readiness_score" in resp_json
    assert "verification_checks" in resp_json
    assert "issues_detected" in resp_json
    assert "recommended_actions" in resp_json
    assert "extracted_entities" in resp_json
    print("  [OK] API returned 200 with schema:")
    print(f"    - Score: {resp_json['readiness_score']}")
    print(f"    - Extracted entities: {resp_json['extracted_entities']}")


async def main():
    test_models()
    await test_extractor()
    await test_reasoning()
    test_api()
    print("\nALL PHASE 1 TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    asyncio.run(main())
