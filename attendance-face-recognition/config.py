from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Recognition ──────────────────────────────────────────────────────
    # Single InsightFace model handles both detection + embedding.
    RECOGNITION_MODEL: str = "buffalo_sc"
    DISTANCE_METRIC: str = "cosine"

    # Cosine distance cutoff. Lower = stricter. 0.55 is a reasonable
    # working default for buffalo_sc; tune against your own dataset.
    MATCH_THRESHOLD: float = 0.55

    # ── Liveness / Anti-Spoof ────────────────────────────────────────────
    # Overall score (0-1, higher = more likely real) required to pass.
    LIVENESS_THRESHOLD: float = 0.65
    MIN_FACE_SIZE_PX: int = 80  # reject tiny/far-away faces

    # ── Burst / Active Liveness (production path) ───────────────────────
    # A single still frame can't reliably tell a live face from a good
    # photo/screen replay. /attendance/mark-burst expects several frames
    # captured over ~1.5-2s and requires a detected blink + real inter-
    # frame motion on top of the passive per-frame checks above.
    BURST_MIN_FRAMES: int = 3
    BURST_MAX_FRAMES: int = 10
    # Blink is now enforced as a one-time CLIENT-SIDE gate: the capture
    # button in test_attendance.html stays disabled until the browser's
    # own live MediaPipe check confirms a blink, so by the time frames are
    # even captured a blink has already happened. The frames actually
    # submitted are captured fresh AFTER that gate and are not required to
    # individually contain a blink — set this True only if you want the
    # server to also hard-require a blink within the submitted frames
    # themselves (stricter, but means the user must blink at the exact
    # moment of capture, which is what caused repeated false rejections).
    REQUIRE_BLINK: bool = False
    # Smaller detector input for burst frames = faster per-frame detection.
    # Capture frames are always close-up selfies, so this costs ~no accuracy.
    BURST_DET_SIZE: tuple[int, int] = (320, 320)

    # ── Image Constraints ────────────────────────────────────────────────
    MAX_FILE_SIZE_MB: int = 8
    ALLOWED_EXTENSIONS: list[str] = ["jpg", "jpeg", "png"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()