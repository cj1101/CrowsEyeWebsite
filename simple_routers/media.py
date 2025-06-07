"""
Simplified Media router for Crow's Eye API.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, UploadFile, File
from pydantic import BaseModel
import uuid
from datetime import datetime

router = APIRouter()


class MediaItem(BaseModel):
    """Media item model."""
    id: str
    filename: str
    content_type: str
    size: int
    upload_date: str
    url: str
    thumbnail_url: Optional[str] = None
    tags: List[str] = []


class MediaListResponse(BaseModel):
    """Media list response model."""
    media: List[MediaItem]
    total: int


@router.post("/upload", response_model=MediaItem)
async def upload_media(file: UploadFile = File(...)):
    """
    Upload a media file (image, video, or audio).
    
    Supported formats:
    - Images: JPG, PNG, GIF, WebP
    - Videos: MP4, WebM, MOV
    - Audio: MP3, WAV, M4A
    """
    # Validate file type
    allowed_types = [
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "video/mp4", "video/webm", "video/quicktime",
        "audio/mpeg", "audio/wav", "audio/mp4"
    ]
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}"
        )
    
    # Validate file size (max 100MB)
    max_size = 100 * 1024 * 1024  # 100MB
    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 100MB limit"
        )
    
    # In production, you would:
    # 1. Save the file to cloud storage (AWS S3, Google Cloud Storage, etc.)
    # 2. Generate thumbnails for videos/images
    # 3. Extract metadata
    # 4. Save metadata to database
    
    media_id = str(uuid.uuid4())
    
    return MediaItem(
        id=media_id,
        filename=file.filename or "unknown",
        content_type=file.content_type,
        size=len(content),
        upload_date=datetime.now().isoformat(),
        url=f"https://example.com/media/{media_id}",
        thumbnail_url=f"https://example.com/thumbnails/{media_id}" if file.content_type.startswith("video") else None,
        tags=[]
    )


@router.get("/", response_model=MediaListResponse)
async def list_media(limit: int = 50, offset: int = 0, content_type: Optional[str] = None):
    """
    List all media files.
    
    Filters:
    - content_type: Filter by MIME type (e.g., 'image', 'video', 'audio')
    """
    # Mock response - in production this would fetch from database
    media_items = [
        MediaItem(
            id=str(uuid.uuid4()),
            filename="sample_image.jpg",
            content_type="image/jpeg",
            size=1024000,
            upload_date=datetime.now().isoformat(),
            url="https://example.com/media/sample1",
            tags=["sample", "demo"]
        ),
        MediaItem(
            id=str(uuid.uuid4()),
            filename="sample_video.mp4",
            content_type="video/mp4",
            size=5120000,
            upload_date=datetime.now().isoformat(),
            url="https://example.com/media/sample2",
            thumbnail_url="https://example.com/thumbnails/sample2",
            tags=["video", "demo"]
        )
    ]
    
    # Apply content type filter if specified
    if content_type:
        media_items = [item for item in media_items if item.content_type.startswith(content_type)]
    
    return MediaListResponse(
        media=media_items[offset:offset+limit],
        total=len(media_items)
    )


@router.get("/{media_id}", response_model=MediaItem)
async def get_media(media_id: str):
    """Get a specific media item by ID."""
    # Mock response - in production this would fetch from database
    return MediaItem(
        id=media_id,
        filename="sample_file.jpg",
        content_type="image/jpeg",
        size=1024000,
        upload_date=datetime.now().isoformat(),
        url=f"https://example.com/media/{media_id}",
        tags=["sample"]
    )


@router.delete("/{media_id}")
async def delete_media(media_id: str):
    """Delete a media item."""
    # In production, this would:
    # 1. Delete file from cloud storage
    # 2. Remove metadata from database
    # 3. Clean up any associated thumbnails
    
    return {"message": f"Media item {media_id} deleted successfully"}


@router.put("/{media_id}/tags")
async def update_media_tags(media_id: str, tags: List[str]):
    """Update tags for a media item."""
    return {"message": f"Tags updated for media item {media_id}", "tags": tags}


@router.get("/{media_id}/download")
async def download_media(media_id: str):
    """Get download URL for a media item."""
    return {
        "download_url": f"https://example.com/downloads/{media_id}",
        "expires_at": datetime.now().isoformat()
    } 