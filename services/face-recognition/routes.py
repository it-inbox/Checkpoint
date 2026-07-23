from typing import Annotated

from fastapi import APIRouter, File, UploadFile

from schemas import AttendanceBurstResponse, AttendanceResponse, DetectFaceResponse, ErrorResponse
from service import decode_image, detect_face_for_preview, mark_attendance, mark_attendance_burst

router = APIRouter()


@router.post(
    "/face/detect",
    response_model=DetectFaceResponse,
    responses={400: {"model": ErrorResponse}, 422: {"model": ErrorResponse}},
    summary="Detect a face in an image and return its bounding box (for UI overlay only)",
)
async def face_detect(
    image: Annotated[UploadFile, File(description="Image to run face detection on")],
):
    """
    Used by the test page (and can be used by any client) purely to draw a
    circle/oval guide around the detected face on top of the preview —
    does not do any matching or liveness scoring.
    """
    raw = await image.read()
    arr = decode_image(raw, image.filename or "frame.jpg")
    return detect_face_for_preview(arr)


@router.post(
    "/attendance/mark-burst",
    response_model=AttendanceBurstResponse,
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
    summary="RECOMMENDED: mark attendance from a burst of frames + blink/motion liveness",
)
async def attendance_mark_burst(
    profile_image: Annotated[UploadFile, File(description="Stored profile photo (reference)")],
    capture_images: Annotated[list[UploadFile], File(description="3-10 frames captured over ~1.5-2s")],
):
    """
    Production-path attendance check. The client should capture several
    frames in quick succession (e.g. 6 frames over 1.5-2 seconds) while
    prompting the user to blink naturally, instead of sending one still
    photo. This defeats the two spoofs a single still frame can't:
    a static printed/screen photo (no blink, no motion) and a plain video
    replay with no matching live challenge.
    """
    profile_raw = await profile_image.read()
    profile_arr = decode_image(profile_raw, profile_image.filename or "profile.jpg")

    frames = []
    for i, upload in enumerate(capture_images):
        raw = await upload.read()
        frames.append(decode_image(raw, upload.filename or f"frame_{i}.jpg"))

    return mark_attendance_burst(
        profile_img=profile_arr,
        capture_frames=frames,
        profile_filename=profile_image.filename or "profile.jpg",
    )


@router.post(
    "/attendance/mark",
    response_model=AttendanceResponse,
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
    summary="Mark attendance from a single live capture vs. a profile photo",
)
async def attendance_mark(
    profile_image: Annotated[UploadFile, File(description="Stored profile photo (reference)")],
    capture_image: Annotated[UploadFile, File(description="Single live camera capture to verify")],
):
    """
    Minimal single-photo attendance flow:

    1. Decode both images.
    2. Detect the face in each.
    3. Run a passive liveness check on `capture_image` (reject printed
       photos / screen replays).
    4. Compare the two face embeddings with cosine distance.
    5. Return marked / rejected / spoof_suspected.

    NOTE: `profile_image` is sent as a file here so the endpoint can be
    tested standalone (see test_attendance.html). Once your DB table
    structure is available, replace this with a lookup that fetches the
    stored profile photo (or, better, its precomputed embedding) by user
    ID instead of re-uploading it on every request.
    """
    profile_raw = await profile_image.read()
    capture_raw = await capture_image.read()

    profile_arr = decode_image(profile_raw, profile_image.filename or "profile.jpg")
    capture_arr = decode_image(capture_raw, capture_image.filename or "capture.jpg")

    return mark_attendance(
        profile_img=profile_arr,
        capture_img=capture_arr,
        profile_filename=profile_image.filename or "profile.jpg",
        capture_filename=capture_image.filename or "capture.jpg",
    )
