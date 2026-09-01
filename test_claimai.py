"""
test_claimai.py
Phase 2 Comprehensive Smoke Test Script:
- Pydantic models with Discrepancies and PhotoMetadata
- EXIF and OCR extractors
- Cross-Document Graph Reasoning (Dell XPS 15 vs 13 model mismatch & photo timestamp validation)
- FastAPI /api/v1/analyze endpoint with full Phase 2 response payload
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
)
from extractor import (
    extract_text_from_pdf,
    extract_text_from_image,
    extract_text_from_txt,
    extract_image_exif_metadata,
)
from reasoning import analyze_evidence
from main import app


def test_models():
    """Verify Phase 2 data models serialization and validation."""
    print("[1/4] Testing Pydantic Data Models, Discrepancies & PhotoMetadata...")
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

    response = ReadinessResponse(
        readiness_score=50,
        verification_checks=[check],
        issues_detected=[issue],
        recommended_actions=["Upload corrected warranty certificate"],
        extracted_entities=entities,
        discrepancies=[discrepancy],
        photo_metadata=[photo_meta]
    )
    json_data = response.model_dump()
    assert json_data["readiness_score"] == 50
    assert len(json_data["discrepancies"]) == 1
    assert json_data["discrepancies"][0]["value_a"] == "Dell XPS 15"
    assert json_data["discrepancies"][0]["value_b"] == "Dell XPS 13"
    assert len(json_data["photo_metadata"]) == 1
    print("  [OK] Models, Discrepancies & EXIF schemas passed.")


async def test_extractor():
    """Verify image OCR, PDF fallback, text decoding, and EXIF extraction."""
    print("[2/4] Testing Document, Image, and EXIF Extractors...")
    # 1. Text extractor
    txt_sample = b"Invoice #101\nItem: Smart Phone\nDate: 2024-01-10"
    txt_res = extract_text_from_txt(txt_sample)
    assert "Smart Phone" in txt_res

    # 2. Image OCR & EXIF
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
    assert exif_result.filename == "sample_damage.jpg"
    print(f"  [OK] EXIF Parser output: filename={exif_result.filename}, has_gps={exif_result.has_gps}")

    # 3. PDF Fallback
    pdf_fallback = await extract_text_from_pdf(b"")
    assert pdf_fallback == ""
    print("  [OK] Extractor fallbacks passed.")


async def test_reasoning_phase2():
    """Verify Phase 2 cross-document graph reasoning (Dell XPS 15 vs 13 model mismatch & photo timestamp validation)."""
    print("[3/4] Testing Phase 2 Evidence Graph Reasoning (Model Mismatch & EXIF Timeline)...")
    
    # Test Criteria 1: Dell XPS 15 (Invoice) vs Dell XPS 13 (Warranty) Model Mismatch
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
        ]
    }
    result = await analyze_evidence(mismatch_payload)
    assert isinstance(result, ReadinessResponse)
    
    # Model mismatch must trigger lower score (e.g. <= 75)
    assert result.readiness_score < 80, f"Expected score to be lowered due to model mismatch, got {result.readiness_score}"
    
    # Check that discrepancy is created
    has_model_discrepancy = any("Dell XPS 15" in d.value_a and "Dell XPS 13" in d.value_b for d in result.discrepancies) or any("Model discrepancy" in issue.description for issue in result.issues_detected)
    assert has_model_discrepancy, "Expected Dell XPS 15 vs 13 model discrepancy to be flagged"
    print(f"  [OK] Dell XPS 15 vs 13 Model Mismatch verified! Score: {result.readiness_score}/100, Discrepancies: {len(result.discrepancies)}")

    # Test Criteria 2: Photo capture date anomaly (Photo was taken in 2023, but incident claimed in 2024)
    exif_anomaly_payload = {
        "incident_description": "Screen cracked on 2024-07-18.",
        "invoice_text": "Invoice Date: 2024-01-10\nItem: MacBook Pro M3",
        "warranty_text": "Warranty for MacBook Pro M3",
        "damage_photos_ocr": [],
        "photo_metadata": [
            PhotoMetadata(
                filename="old_photo.jpg",
                capture_date="2023-05-10 10:00:00",  # 1 year before incident!
                camera_make="Sony",
                has_gps=False
            )
        ]
    }
    exif_result = await analyze_evidence(exif_anomaly_payload)
    has_exif_issue = any("EXIF anomaly" in issue.description or "Photo EXIF Timestamp Conflict" in d.field for issue in exif_result.issues_detected for d in exif_result.discrepancies) or any("EXIF" in issue.description for issue in exif_result.issues_detected)
    assert has_exif_issue, "Expected photo timestamp anomaly to be flagged"
    print(f"  [OK] Photo EXIF Timestamp anomaly verified! Issues: {len(exif_result.issues_detected)}")


def test_api():
    """Verify FastAPI /api/v1/analyze endpoint with Phase 2 response schema."""
    print("[4/4] Testing FastAPI /api/v1/analyze endpoint (Phase 2)...")
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
    print("  [OK] API returned 200 with complete Phase 2 schema:")
    print(f"    - Score: {resp_json['readiness_score']}")
    print(f"    - Discrepancies: {len(resp_json['discrepancies'])}")
    print(f"    - Photo metadata: {len(resp_json['photo_metadata'])}")


async def main():
    test_models()
    await test_extractor()
    await test_reasoning_phase2()
    test_api()
    print("\nALL PHASE 2 TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    asyncio.run(main())
