"""
models.py
Data models and schemas for ClaimAI - Pre-Claim Evidence Intelligence.
Strict Pydantic v2 models matching the structured API output specification.
"""

from typing import List, Literal
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
