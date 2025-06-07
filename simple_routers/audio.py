"""
Simplified Audio router for Crow's Eye API.
"""

from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
import uuid
from datetime import datetime

router = APIRouter()


class AudioResponse(BaseModel):
    id: str
    filename: str
    duration: int
    format: str
    created_at: str


@router.post("/upload", response_model=AudioResponse)
async def upload_audio(file: UploadFile = File(...)):
    """Upload an audio file."""
    return AudioResponse(
        id=str(uuid.uuid4()),
        filename=file.filename or "unknown.mp3",
        duration=120,  # Mock duration in seconds
        format="mp3",
        created_at=datetime.now().isoformat()
    )


@router.get("/{audio_id}", response_model=AudioResponse)
async def get_audio(audio_id: str):
    """Get audio file info."""
    return AudioResponse(
        id=audio_id,
        filename="sample.mp3",
        duration=120,
        format="mp3",
        created_at=datetime.now().isoformat()
    ) 