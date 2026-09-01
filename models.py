"""
models.py
Data models and schemas for ClaimAI - Pre-Claim Evidence Intelligence.
Final Phase: Conversational Intake, Guided Forensics with pHash, and Auto-Resolution.
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class VerificationCheck(BaseModel):
    """Individual verification checkpoint result for evidence validation."""
    label: str = Field(..., description="Description of the verification check (e.g. 'Ownership verified')")
    passed: bool = Field(..., description="Whether this specific verification check passed")


class DetectedIssue(BaseModel):
    """An issue, discrepancy, contradiction, or missing element detected in claim evidence."""
    severity: Literal["HIGH", "MEDIUM", "LOW"] = Field(
        ...,
        description="Severity level of the issue: HIGH, MEDIUM, or LOW"
    )
    description: str = Field(
        ...,
        description="Detailed explanation of the issue or discrepancy detected"
    )


class ExtractedEntities(BaseModel):
    """Structured entities extracted across invoices, warranties, photos, and narratives."""
    product_name: Optional[str] = Field(None, description="Identified product or device name (e.g., MacBook Pro M3)")
    model_number: Optional[str] = Field(None, description="Identified model number or code")
    serial_number: Optional[str] = Field(None, description="Identified serial number or IMEI")
    purchase_date: Optional[str] = Field(None, description="Identified purchase date")
    incident_date: Optional[str] = Field(None, description="Identified incident date")
    damage_type: Optional[str] = Field(None, description="Summary of physical/liquid/electronic damage")


class PhotoMetadata(BaseModel):
    """EXIF metadata parsed from uploaded image evidence."""
    filename: str = Field(..., description="Uploaded image filename")
    capture_date: Optional[str] = Field(None, description="Original camera capture datetime from EXIF")
    camera_make: Optional[str] = Field(None, description="Camera manufacturer (e.g. Apple, Samsung, Sony)")
    camera_model: Optional[str] = Field(None, description="Camera model (e.g. iPhone 15 Pro)")
    has_gps: bool = Field(default=False, description="Whether GPS location metadata is embedded")
    gps_coordinates: Optional[str] = Field(None, description="Formatted GPS latitude & longitude if present")


class CrossDocumentDiscrepancy(BaseModel):
    """Side-by-side contradiction detected across evidence documents."""
    field: str = Field(..., description="Discrepancy category (e.g. 'Product Model', 'Serial Number', 'Date Ordering')")
    source_a: str = Field(..., description="First evidence source (e.g. 'Purchase Invoice')")
    value_a: str = Field(..., description="Value found in Source A (e.g. 'Dell XPS 15 9530')")
    source_b: str = Field(..., description="Second evidence source (e.g. 'Warranty Policy')")
    value_b: str = Field(..., description="Conflicting value found in Source B (e.g. 'Dell XPS 13 9315')")
    severity: Literal["HIGH", "MEDIUM", "LOW"] = Field(default="HIGH", description="Impact severity of discrepancy")
    explanation: str = Field(..., description="Detailed rationale explaining the contradiction")
    can_auto_resolve: bool = Field(default=True, description="Whether system can auto-normalize this conflict")
    suggested_fix: Optional[str] = Field(None, description="Auto-normalized target value")


class ForensicAnalysis(BaseModel):
    """Forensic forgery and tampering analysis results."""
    authenticity_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Authenticity & Integrity Index from 0 to 100 percentage"
    )
    is_tampered: bool = Field(default=False, description="Whether editing or AI generation artifacts are detected")
    ai_generated_risk: Literal["LOW", "MEDIUM", "HIGH"] = Field(
        default="LOW",
        description="Likelihood of synthetic or AI generated damage visual artifacts"
    )
    editing_software_detected: Optional[str] = Field(
        None,
        description="Editing software name if detected in EXIF/XMP headers (e.g., Photoshop, Canva, GIMP)"
    )
    metadata_integrity: str = Field(
        default="VERIFIED",
        description="Metadata status: VERIFIED, INCOMPLETE, or SUSPICIOUS"
    )
    phash_fingerprint: Optional[str] = Field(
        None,
        description="Perceptual difference hash fingerprint for reverse image search and duplicate claim defense"
    )
    is_duplicate_claim: bool = Field(
        default=False,
        description="Whether this perceptual hash matches any known online stock photo or recycled claim index"
    )
    forensic_checks: List[VerificationCheck] = Field(
        default_factory=list,
        description="Specific forensic checkpoints evaluated"
    )


class ReadinessResponse(BaseModel):
    """Complete claim readiness analysis response."""
    readiness_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Explainable claim readiness score ranging from 0 to 100 percentage"
    )
    verification_checks: List[VerificationCheck] = Field(
        default_factory=list,
        description="List of standardized verification checks with boolean pass/fail status"
    )
    issues_detected: List[DetectedIssue] = Field(
        default_factory=list,
        description="List of detected inconsistencies, timeline conflicts, or missing documents"
    )
    recommended_actions: List[str] = Field(
        default_factory=list,
        description="List of actionable remediation steps to improve claim readiness before submission"
    )
    extracted_entities: Optional[ExtractedEntities] = Field(
        default=None,
        description="Structured key-value entities parsed from multimodal evidence"
    )
    discrepancies: List[CrossDocumentDiscrepancy] = Field(
        default_factory=list,
        description="Side-by-side conflicting evidence data points across documents"
    )
    photo_metadata: List[PhotoMetadata] = Field(
        default_factory=list,
        description="Parsed EXIF camera and timestamp metadata from uploaded photos"
    )
    forensics: Optional[ForensicAnalysis] = Field(
        default=None,
        description="Generative forgery and image manipulation forensics audit"
    )


class InterviewMessage(BaseModel):
    """A message in the conversational intake interview."""
    role: Literal["assistant", "user"] = Field(..., description="Role of message sender")
    content: str = Field(..., description="Message text content")


class InterviewRequest(BaseModel):
    """Request payload for conversational interviewer assistant."""
    current_statement: str = Field(..., description="Current user incident narrative")
    messages: List[InterviewMessage] = Field(default_factory=list, description="Chat transcript history")
    last_user_response: Optional[str] = Field(None, description="Latest message from the user")


class InterviewResponse(BaseModel):
    """Response payload from conversational interviewer assistant."""
    assistant_reply: str = Field(..., description="Next conversational follow-up question or clarification")
    enhanced_statement: str = Field(..., description="Refined, legally clear incident narrative updated in real-time")
    clarifying_chips: List[str] = Field(default_factory=list, description="Suggested quick-reply chips for user convenience")
    is_statement_complete: bool = Field(default=False, description="Whether the statement now has all required risk details")
