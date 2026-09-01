"""
extractor.py
Document, image, and EXIF metadata processing layer for ClaimAI.
Extracts structured text from PDF/text invoices, runs OCR on visual evidence,
and extracts EXIF camera timestamps and device tags.
"""

import io
import logging
import asyncio
from typing import Optional
from PIL import Image, ExifTags
from models import PhotoMetadata

logger = logging.getLogger("claimai.extractor")


def _sync_extract_text_from_pdf(file_bytes: bytes) -> str:
    """Synchronously extract plain text and table contents from PDF bytes using pdfplumber."""
    try:
        import pdfplumber

        extracted_text = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page_idx, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    extracted_text.append(f"--- Page {page_idx + 1} ---\n{page_text.strip()}")
                
                # Check for tables and extract if present
                tables = page.extract_tables()
                if tables:
                    for table in tables:
                        table_str = "\n".join(
                            ["\t|\t".join([str(cell or "").strip() for cell in row]) for row in table]
                        )
                        if table_str.strip():
                            extracted_text.append(f"[Table Data]\n{table_str}")

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


def extract_image_exif_metadata(file_bytes: bytes, filename: str) -> PhotoMetadata:
    """
    Extracts EXIF metadata from image bytes (capture date, camera make/model, GPS).
    """
    capture_date = None
    camera_make = None
    camera_model = None
    has_gps = False
    gps_coordinates = None

    if not file_bytes:
        return PhotoMetadata(filename=filename, has_gps=False)

    try:
        image = Image.open(io.BytesIO(file_bytes))
        exif_raw = image.getexif()

        if exif_raw:
            # Map tag IDs to human readable names
            exif_dict = {
                ExifTags.TAGS.get(tag_id, tag_id): value
                for tag_id, value in exif_raw.items()
            }

            # Check capture datetime
            capture_date = (
                exif_dict.get("DateTimeOriginal")
                or exif_dict.get("DateTimeDigitized")
                or exif_dict.get("DateTime")
            )
            if capture_date:
                # Format EXIF "YYYY:MM:DD HH:MM:SS" -> "YYYY-MM-DD HH:MM:SS"
                capture_date = str(capture_date).replace(":", "-", 2).strip()

            camera_make = exif_dict.get("Make")
            if camera_make:
                camera_make = str(camera_make).strip()

            camera_model = exif_dict.get("Model")
            if camera_model:
                camera_model = str(camera_model).strip()

            # Check GPS IFD
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
        gps_coordinates=gps_coordinates
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
    """
    Asynchronously extract text from PDF document bytes.
    Offloads CPU-bound parsing to a worker thread.
    """
    if not file_bytes:
        return ""
    return await asyncio.to_thread(_sync_extract_text_from_pdf, file_bytes)


async def extract_text_from_image(file_bytes: bytes) -> str:
    """
    Asynchronously extract OCR text from image bytes.
    Offloads CPU-bound OCR processing to a worker thread.
    """
    if not file_bytes:
        return ""
    return await asyncio.to_thread(_sync_extract_text_from_image, file_bytes)
