"""
test_claimai.py
Smoke test script to verify ClaimAI data models, extractors, reasoning engine, and API routes.
"""

import io
import asyncio
from PIL import Image, ImageDraw, ImageFont
from fastapi.testclient import TestClient

from models import ReadinessResponse, VerificationCheck, DetectedIssue
from extractor import extract_text_from_pdf, extract_text_from_image
from reasoning import analyze_evidence
from main import app


def test_models():
    """Verify Pydantic models serialization and validation."""
    print("[1/4] Testing Pydantic Data Models...")
    check = VerificationCheck(label="Ownership verified", passed=True)
    issue = DetectedIssue(severity="HIGH", description="Missing serial photo")
    response = ReadinessResponse(
        readiness_score=85,
        verification_checks=[check],
        issues_detected=[issue],
        recommended_actions=["Upload serial photo"]
    )
    json_data = response.model_dump()
    assert json_data["readiness_score"] == 85
    assert json_data["verification_checks"][0]["label"] == "Ownership verified"
    assert json_data["issues_detected"][0]["severity"] == "HIGH"
    print("  [OK] Models passed.")


async def test_extractor():
    """Verify image OCR extraction on a synthetic image."""
    print("[2/4] Testing Document / Image Extractors...")
    # Create synthetic test image with text
    img = Image.new("RGB", (300, 100), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((20, 35), "SERIAL-ABC-12345", fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    img_bytes = buf.getvalue()

    ocr_result = await extract_text_from_image(img_bytes)
    print(f"  [OK] Image OCR output: '{ocr_result}'")

    # Empty buffer fallback test
    pdf_fallback = await extract_text_from_pdf(b"")
    assert pdf_fallback == ""
    print("  [OK] Extractor fallbacks passed.")


async def test_reasoning():
    """Verify reasoning engine returns compliant ReadinessResponse."""
    print("[3/4] Testing Reasoning Engine (with fallback / structured output)...")
    payload = {
        "incident_description": "Dropped my phone on concrete on 2024-05-10, screen is cracked.",
        "invoice_text": "Invoice #1029\nDate: 2024-01-15\nProduct: Phone Ultra X\nSerial: SN-998811",
        "warranty_text": "1-Year Limited Warranty for Phone Ultra X. Valid until 2025-01-15.",
        "damage_photos_ocr": ["SN-998811 Phone Ultra X"]
    }
    result = await analyze_evidence(payload)
    assert isinstance(result, ReadinessResponse)
    assert 0 <= result.readiness_score <= 100
    assert len(result.verification_checks) >= 4
    print(f"  [OK] Reasoning score: {result.readiness_score}/100")
    print(f"  [OK] Checks: {[c.label for c in result.verification_checks]}")


def test_api():
    """Verify FastAPI endpoint using TestClient."""
    print("[4/4] Testing FastAPI /api/v1/analyze endpoint...")
    client = TestClient(app)

    # Health check
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "healthy"}

    # Multipart analyze endpoint
    img = Image.new("RGB", (200, 50), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    files = [
        ("invoice", ("receipt.jpg", buf, "image/jpeg"))
    ]
    data = {
        "incident_description": "Water spillage on laptop keyboard"
    }

    response = client.post("/api/v1/analyze", data=data, files=files)
    assert response.status_code == 200, f"API Error: {response.text}"
    resp_json = response.json()
    assert "readiness_score" in resp_json
    assert "verification_checks" in resp_json
    assert "issues_detected" in resp_json
    assert "recommended_actions" in resp_json
    print("  [OK] API returned 200 with schema:")
    print(f"    - Score: {resp_json['readiness_score']}")
    print(f"    - Issues: {len(resp_json['issues_detected'])}")
    print(f"    - Actions: {resp_json['recommended_actions']}")


async def main():
    test_models()
    await test_extractor()
    await test_reasoning()
    test_api()
    print("\nALL TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    asyncio.run(main())
