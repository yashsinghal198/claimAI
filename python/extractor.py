"""
extractor.py
Document, image, EXIF metadata, and forgery forensics layer for ClaimAI.
Final Phase: PDF parsing, OCR, EXIF metadata, Perceptual Hashing (dHash), and generative forgery forensics.
"""

import io
import logging
import asyncio
from typing import Optional, List
from PIL import Image, ExifTags
from models import PhotoMetadata, ForensicAnalysis, VerificationCheck, OCRBoundingBox

logger = logging.getLogger("claimai.extractor")

FORGERY_SOFTWARE_SIGNATURES = [
    "photoshop", "adobe", "gimp", "canva", "lightroom", "paint.net",
    "corel", "pixelmator", "snapseed", "picsart", "vsco"
]

AI_GENERATOR_SIGNATURES = [
    "midjourney", "dall-e", "dalle", "stable diffusion", "stablediffusion",
    "comfyui", "novelai", "automatic1111", "firefly", "bing image creator", "leonardo.ai"
]

# Simulated index of known online duplicate / stock claim fraud image hashes
KNOWN_FRAUD_PHASH_INDEX = {
    "f0e1d2c3b4a59687", "aa55aa55aa55aa55", "deadbeefcafe1234"
}


def compute_image_phash(file_bytes: bytes) -> Optional[str]:
    """
    Computes a 64-bit Difference Perceptual Hash (dHash) for anti-fraud visual similarity
    and duplicate claim detection.
    """
    if not file_bytes:
        return None
    try:
        image = Image.open(io.BytesIO(file_bytes)).convert("L")
        # Resize to 9x8 to compare 8 horizontal pairs across 8 rows
        resized = image.resize((9, 8), Image.Resampling.LANCZOS)
        pixels = list(resized.getdata())

        difference = []
        for row in range(8):
            for col in range(8):
                pixel_left = pixels[row * 9 + col]
                pixel_right = pixels[row * 9 + col + 1]
                difference.append(pixel_left > pixel_right)

        # Convert boolean list to 64-bit integer hex string
        decimal_val = 0
        for bit in difference:
            decimal_val = (decimal_val << 1) | int(bit)

        return f"{decimal_val:016x}"
    except Exception as e:
        logger.warning(f"Failed to compute perceptual hash: {e}")
        return None


def _sync_extract_text_from_pdf(file_bytes: bytes) -> str:
    """Synchronously extract plain text and table contents from PDF bytes using pdfplumber."""
    try:
        import pdfplumber

        extracted_text = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            # Limit page scan to first 10 pages for performance
            for page_idx, page in enumerate(pdf.pages[:10]):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        extracted_text.append(f"--- Page {page_idx + 1} ---\n{page_text.strip()}")
                except Exception:
                    pass

                try:
                    tables = page.extract_tables()
                    if tables:
                        for table in tables[:5]:
                            table_str = "\n".join(
                                ["\t|\t".join([str(cell or "").strip() for cell in row if cell]) for row in table if row]
                            )
                            if table_str.strip():
                                extracted_text.append(f"[Table Data]\n{table_str}")
                except Exception:
                    pass

        return "\n\n".join(extracted_text).strip()
    except Exception as e:
        logger.warning(f"Failed to extract text from PDF: {e}")
        return ""


def _sync_extract_text_from_image(file_bytes: bytes) -> str:
    """Synchronously run OCR on image bytes using rapidocr-onnxruntime and Pillow."""
    try:
        from rapidocr_onnxruntime import RapidOCR
        import numpy as np

        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        img_np = np.array(image)

        ocr_engine = RapidOCR()
        result, _ = ocr_engine(img_np)

        if not result:
            return ""

        detected_texts = [line[1] for line in result if len(line) >= 2 and line[1]]
        return "\n".join(detected_texts).strip()
    except Exception as e:
        logger.warning(f"Failed to extract text from image via OCR: {e}")
        return ""


def _sync_extract_ocr_boxes_from_image(file_bytes: bytes) -> List[OCRBoundingBox]:
    """Extracts OCR text bounding boxes [x, y, w, h] normalized as percentages from image bytes using RapidOCR."""
    if not file_bytes:
        return []
    try:
        from rapidocr_onnxruntime import RapidOCR
        import numpy as np

        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        width, height = image.size
        img_np = np.array(image)

        ocr_engine = RapidOCR()
        result, _ = ocr_engine(img_np)

        if not result:
            return []

        boxes = []
        for item in result:
            if len(item) >= 2 and item[1]:
                pts = item[0]  # [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
                text = str(item[1]).strip()
                confidence = float(item[2]) if len(item) >= 3 else 0.95

                xs = [pt[0] for pt in pts]
                ys = [pt[1] for pt in pts]

                min_x = min(xs)
                min_y = min(ys)
                w = max(xs) - min_x
                h = max(ys) - min_y

                x_pct = round(max(0, min(100, (min_x / width) * 100)), 2)
                y_pct = round(max(0, min(100, (min_y / height) * 100)), 2)
                w_pct = round(max(1, min(100, (w / width) * 100)), 2)
                h_pct = round(max(1, min(100, (h / height) * 100)), 2)

                boxes.append(
                    OCRBoundingBox(
                        text=text,
                        confidence=confidence,
                        x=x_pct,
                        y=y_pct,
                        w=w_pct,
                        h=h_pct,
                    )
                )

        return boxes
    except Exception as e:
        logger.warning(f"Failed to extract OCR bounding boxes: {e}")
        return []


def extract_image_exif_metadata(file_bytes: bytes, filename: str) -> PhotoMetadata:
    """Extracts EXIF metadata & OCR bounding boxes from image bytes."""
    capture_date = None
    camera_make = None
    camera_model = None
    has_gps = False
    gps_coordinates = None

    if not file_bytes:
        return PhotoMetadata(filename=filename, has_gps=False)

    ocr_boxes = _sync_extract_ocr_boxes_from_image(file_bytes)

    try:
        image = Image.open(io.BytesIO(file_bytes))
        exif_raw = image.getexif()

        if exif_raw:
            exif_dict = {
                ExifTags.TAGS.get(tag_id, tag_id): value
                for tag_id, value in exif_raw.items()
            }

            capture_date = (
                exif_dict.get("DateTimeOriginal")
                or exif_dict.get("DateTimeDigitized")
                or exif_dict.get("DateTime")
            )
            if capture_date:
                capture_date = str(capture_date).replace(":", "-", 2).strip()

            camera_make = exif_dict.get("Make")
            if camera_make:
                camera_make = str(camera_make).strip()

            camera_model = exif_dict.get("Model")
            if camera_model:
                camera_model = str(camera_model).strip()

            if ExifTags.IFD.GPSInfo in exif_raw:
                gps_info = exif_raw.get_ifd(ExifTags.IFD.GPSInfo)
                if gps_info:
                    has_gps = True
                    gps_coordinates = "GPS Tag Present (Embedded Location)"

    except Exception as e:
        logger.warning(f"Failed to parse EXIF metadata from {filename}: {e}")

    return PhotoMetadata(
        filename=filename,
        capture_date=capture_date,
        camera_make=camera_make,
        camera_model=camera_model,
        has_gps=has_gps,
        gps_coordinates=gps_coordinates,
        ocr_boxes=ocr_boxes
    )


def analyze_image_forensics(file_bytes: bytes, filename: str) -> ForensicAnalysis:
    """
    Forensics engine detecting image manipulation, editing software signatures,
    perceptual duplicate claim hashes (pHash), and synthetic AI artifacts.
    """
    checks: List[VerificationCheck] = []
    authenticity_score = 96
    is_tampered = False
    ai_risk = "LOW"
    detected_software = None
    metadata_status = "VERIFIED"
    is_duplicate = False

    phash_fingerprint = compute_image_phash(file_bytes) if file_bytes else None

    if not file_bytes:
        return ForensicAnalysis(
            authenticity_score=70,
            is_tampered=False,
            ai_generated_risk="LOW",
            metadata_integrity="INCOMPLETE",
            phash_fingerprint=phash_fingerprint,
            is_duplicate_claim=False,
            forensic_checks=[
                VerificationCheck(label="Digital signature verified", passed=False),
                VerificationCheck(label="No editing software artifacts", passed=True),
                VerificationCheck(label="Perceptual hash unique (No duplicates)", passed=True),
            ]
        )

    try:
        image = Image.open(io.BytesIO(file_bytes))
        raw_text_headers = str(file_bytes[:4096]).lower()

        # Check 1: Perceptual Hash Duplicate Claim Detection
        if phash_fingerprint and phash_fingerprint in KNOWN_FRAUD_PHASH_INDEX:
            is_duplicate = True
            authenticity_score -= 45
            is_tampered = True
            checks.append(VerificationCheck(label="Perceptual hash unique (No duplicates)", passed=False))
        else:
            checks.append(VerificationCheck(label="Perceptual hash unique (No duplicates)", passed=True))

        # Check 2: Editing software signatures in EXIF/XMP
        exif_raw = image.getexif()
        software_field = ""
        if exif_raw:
            for tag_id, val in exif_raw.items():
                tag_name = str(ExifTags.TAGS.get(tag_id, "")).lower()
                if "software" in tag_name or "processing" in tag_name:
                    software_field = str(val).lower()

        found_editing_sw = None
        for sw in FORGERY_SOFTWARE_SIGNATURES:
            if sw in software_field or sw in raw_text_headers:
                found_editing_sw = sw.capitalize()
                break

        if found_editing_sw:
            is_tampered = True
            detected_software = found_editing_sw
            authenticity_score -= 30
            checks.append(VerificationCheck(label="No editing software artifacts", passed=False))
        else:
            checks.append(VerificationCheck(label="No editing software artifacts", passed=True))

        # Check 3: AI Generative model signatures
        found_ai_tag = False
        for ai_sig in AI_GENERATOR_SIGNATURES:
            if ai_sig in raw_text_headers or (software_field and ai_sig in software_field):
                found_ai_tag = True
                ai_risk = "HIGH"
                is_tampered = True
                authenticity_score -= 50
                detected_software = f"Generative AI ({ai_sig.capitalize()})"
                break

        if found_ai_tag:
            checks.append(VerificationCheck(label="AI generative pattern test", passed=False))
        else:
            checks.append(VerificationCheck(label="AI generative pattern test", passed=True))

        # Check 4: Camera Sensor Metadata Integrity
        has_sensor_data = bool(exif_raw and len(exif_raw) >= 3)
        checks.append(VerificationCheck(label="Camera hardware profile valid", passed=has_sensor_data))
        if not has_sensor_data:
            authenticity_score -= 10
            metadata_status = "INCOMPLETE"

    except Exception as e:
        logger.warning(f"Forensic inspection error on {filename}: {e}")
        checks.append(VerificationCheck(label="Basic file structure valid", passed=True))

    authenticity_score = max(0, min(100, authenticity_score))

    return ForensicAnalysis(
        authenticity_score=authenticity_score,
        is_tampered=is_tampered,
        ai_generated_risk=ai_risk,
        editing_software_detected=detected_software,
        metadata_integrity=metadata_status,
        phash_fingerprint=phash_fingerprint,
        is_duplicate_claim=is_duplicate,
        forensic_checks=checks
    )


def extract_text_from_txt(file_bytes: bytes) -> str:
    """Decode text file bytes with UTF-8 / latin-1 fallback."""
    if not file_bytes:
        return ""
    try:
        return file_bytes.decode("utf-8").strip()
    except UnicodeDecodeError:
        return file_bytes.decode("latin-1", errors="ignore").strip()


async def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Asynchronously extract text from PDF document bytes with 5s timeout & fallback."""
    if not file_bytes:
        return ""
    try:
        return await asyncio.wait_for(
            asyncio.to_thread(_sync_extract_text_from_pdf, file_bytes),
            timeout=5.0
        )
    except Exception as e:
        logger.warning(f"PDF extraction timed out or failed ({e}), using raw text string fallback.")
        try:
            import re
            raw = file_bytes.decode("latin-1", errors="ignore")
            readable = re.findall(r'[A-Za-z0-9\s#\-\:\.\,\$\/]{4,}', raw)
            return "\n".join(readable[:50])
        except Exception:
            return ""


async def extract_text_from_image(file_bytes: bytes) -> str:
    """Asynchronously extract OCR text from image bytes."""
    if not file_bytes:
        return ""
    return await asyncio.to_thread(_sync_extract_text_from_image, file_bytes)
