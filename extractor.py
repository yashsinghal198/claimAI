"""
extractor.py
Document and image processing layer for ClaimAI.
Extracts structured text from PDF invoices/warranties, plain text files, and runs OCR on visual evidence.
"""

import io
import logging
import asyncio
from PIL import Image

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

        # Open image with Pillow to handle diverse formats (PNG, JPG, WEBP, etc.)
        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        img_np = np.array(image)

        ocr_engine = RapidOCR()
        result, _ = ocr_engine(img_np)

        if not result:
            return ""

        # RapidOCR results return format: [[box, text, score], ...]
        detected_texts = [line[1] for line in result if len(line) >= 2 and line[1]]
        return "\n".join(detected_texts).strip()
    except Exception as e:
        logger.warning(f"Failed to extract text from image via OCR: {e}")
        return ""


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
