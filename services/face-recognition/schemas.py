from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class AttendanceStatus(str, Enum):
    MARKED = "marked"          # face matched + passed liveness
    REJECTED = "rejected"      # face did not match profile photo
    SPOOF_SUSPECTED = "spoof_suspected"  # failed liveness check


class LivenessDetail(BaseModel):
    is_live: bool
    liveness_score: float = Field(..., ge=0.0, le=1.0)
    reasons: list[str] = Field(
        default_factory=list,
        description="Human-readable signals that lowered the liveness score (empty if clean).",
    )


class AttendanceResponse(BaseModel):
    status: AttendanceStatus
    is_match: bool
    match_confidence: float = Field(..., ge=0.0, le=1.0)
    distance: float
    liveness: LivenessDetail
    message: str


class BurstLivenessDetail(BaseModel):
    is_live: bool
    liveness_score: float = Field(..., ge=0.0, le=1.0)
    blink_detected: bool
    motion_ok: bool
    reasons: list[str] = Field(default_factory=list)
    per_frame_scores: list[float] = Field(default_factory=list)


class AttendanceBurstResponse(BaseModel):
    status: AttendanceStatus
    is_match: bool
    match_confidence: float = Field(..., ge=0.0, le=1.0)
    distance: float
    liveness: BurstLivenessDetail
    message: str


class FaceBox(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int


class DetectFaceResponse(BaseModel):
    detected: bool
    box: Optional[FaceBox] = None
    image_width: int
    image_height: int


class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
