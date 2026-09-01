"""
test_claimai.py
Phase 3 Comprehensive Smoke Test Script:
- Pydantic models with Discrepancies, PhotoMetadata, and ForensicAnalysis
- EXIF and Forensics extractors
- Cross-Document Graph Reasoning (Dell XPS 15 vs 13 model mismatch & photo timestamp validation)
- FastAPI /api/v1/analyze endpoint with full Phase 3 response payload
"""

import io
import asyncio
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient

from models import (
    ReadinessResponse,
    VerificationCheck,
    DetectedIssue,
    ExtractedEntities,
    CrossDocumentDiscrepancy,
    PhotoMetadata,
    ForensicAnalysis,
)
from extractor import (
    extract_text_from_pdf,
    extract_text_from_image,
    extract_text_from_txt,
    extract_image_exif_metadata,
    analyze_image_forensics,
)
from reasoning import analyze_evidence
from main import app


def test_models():
    """Verify Phase 3 data models serialization and validation."""
    print("[1/4] Testing Pydantic Data Models, Discrepancies, EXIF & Forensics...")
    check = VerificationCheck(label="Ownership verified", passed=True)
    issue = DetectedIssue(severity="HIGH", description="Model mismatch between invoice and warranty")
    entities = ExtractedEntities(
        product_name="Dell XPS 15",
        model_number="9530",
        serial_number="SN-DELL-7722",
        purchase_date="2024-01-10",
        incident_date="2024-07-18",
        damage_type="Screen Impact Crack"
    )
    discrepancy = CrossDocumentDiscrepancy(
        field="Product Model Discrepancy",
        source_a="Purchase Invoice",
        value_a="Dell XPS 15",
        source_b="Warranty Certificate",
        value_b="Dell XPS 13",
        severity="HIGH",
        explanation="Invoice model does not match warranty certificate."
    )
    photo_meta = PhotoMetadata(
        filename="damage_photo.jpg",
        capture_date="2024-07-18 14:30:00",
        camera_make="Apple",
        camera_model="iPhone 15 Pro",
        has_gps=True,
        gps_coordinates="Embedded Location Tag"
    )
    forensics = ForensicAnalysis(
        authenticity_score=96,
        is_tampered=False,
        ai_generated_risk="LOW",
        metadata_integrity="VERIFIED",
        forensic_checks=[
            VerificationCheck(label="No editing software artifacts", passed=True),
            VerificationCheck(label="AI generative pattern test", passed=True),
        ]
    )

    response = ReadinessResponse(
        readiness_score=75,
        verification_checks=[check],
        issues_detected=[issue],
        recommended_actions=["Upload corrected warranty certificate"],
        extracted_entities=entities,
        discrepancies=[discrepancy],
        photo_metadata=[photo_meta],
        forensics=forensics
    )
    json_data = response.model_dump()
    assert json_data["readiness_score"] == 75
    assert len(json_data["discrepancies"]) == 1
    assert json_data["forensics"]["authenticity_score"] == 96
    assert json_data["forensics"]["is_tampered"] is False
    print("  [OK] Phase 3 Schemas passed.")


async def test_extractor():
    """Verify image OCR, PDF fallback, text decoding, EXIF, and Forensics."""
    print("[2/4] Testing Document, Image, EXIF & Forensics Extractors...")
    # 1. Text extractor
    txt_sample = b"Invoice #101\nItem: Smart Phone\nDate: 2024-01-10"
    txt_res = extract_text_from_txt(txt_sample)
    assert "Smart Phone" in txt_res

    # 2. Image OCR, EXIF, and Forensics
    img = Image.new("RGB", (300, 100), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)
    draw.text((20, 35), "SERIAL-ABC-12345", fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    ocr_result = await extract_text_from_image(img_bytes)
    print(f"  [OK] Image OCR output: '{ocr_result}'")

    exif_result = extract_image_exif_metadata(img_bytes, "sample_damage.jpg")
    assert isinstance(exif_result, PhotoMetadata)

    forensics_res = analyze_image_forensics(img_bytes, "sample_damage.jpg")
    assert isinstance(forensics_res, ForensicAnalysis)
    assert forensics_res.authenticity_score > 0
    print(f"  [OK] Forensics output: Authenticity={forensics_res.authenticity_score}%, Tampered={forensics_res.is_tampered}")


async def test_reasoning_phase3():
    """Verify Phase 3 cross-document graph reasoning and forensics penalties."""
    print("[3/4] Testing Phase 3 Evidence Graph Reasoning & Forensics Integration...")
    
    # Dell XPS 15 vs 13 Model Mismatch
    mismatch_payload = {
        "incident_description": "Dropped my laptop on 2024-07-18, screen shattered.",
        "invoice_text": "Dell Official Invoice #1029\nDate: 2024-01-10\nProduct: Dell XPS 15 (9530)\nSerial: SN-DELL-XPS15-7722",
        "warranty_text": "Dell Premium Care Certificate\nRegistered Model: Dell XPS 13 (9315)\nSerial: SN-DELL-XPS13-1100",
        "damage_photos_ocr": ["Dell XPS SN-DELL-XPS15-7722"],
        "photo_metadata": [
            PhotoMetadata(
                filename="screen_crack.jpg",
                capture_date="2024-07-18 15:30:00",
                camera_make="Apple",
                camera_model="iPhone 15 Pro",
                has_gps=True
            )
        ],
        "forensics": ForensicAnalysis(
            authenticity_score=95,
            is_tampered=False,
            ai_generated_risk="LOW",
            metadata_integrity="VERIFIED",
            forensic_checks=[]
        )
    }
    result = await analyze_evidence(mismatch_payload)
    assert isinstance(result, ReadinessResponse)
    assert result.readiness_score < 80
    assert result.forensics is not None
    assert result.forensics.authenticity_score == 95
    print(f"  [OK] Phase 3 Reasoning passed! Score: {result.readiness_score}/100, Forensics: {result.forensics.authenticity_score}%")


def test_api():
    """Verify FastAPI /api/v1/analyze endpoint with Phase 3 response schema."""
    print("[4/4] Testing FastAPI /api/v1/analyze endpoint (Phase 3)...")
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
        ("damage_photos", ("laptop_photo.jpg", buf, "image/jpeg"))
    ]
    data = {
        "incident_description": "Dell laptop screen cracked on 2024-07-18"
    }

    response = client.post("/api/v1/analyze", data=data, files=files)
    assert response.status_code == 200, f"API Error: {response.text}"
    resp_json = response.json()
    assert "readiness_score" in resp_json
    assert "verification_checks" in resp_json
    assert "issues_detected" in resp_json
    assert "recommended_actions" in resp_json
    assert "extracted_entities" in resp_json
    assert "discrepancies" in resp_json
    assert "photo_metadata" in resp_json
    assert "forensics" in resp_json
    # Test interview endpoint
    interview_res = client.post("/api/v1/interview", json={
        "current_statement": "I dropped my phone",
        "messages": [],
        "last_user_response": "At home on tile floor"
    })
    assert interview_res.status_code == 200, f"Interview Error: {interview_res.text}"
    int_json = interview_res.json()
    assert "assistant_reply" in int_json
    assert "enhanced_statement" in int_json
    print(f"    - Interview Assistant: '{int_json['assistant_reply'][:40]}...'")


async def main():
    test_models()
    await test_extractor()
    await test_reasoning_phase3()
    test_api()
    print("\nALL PHASE 3 TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    asyncio.run(main())
