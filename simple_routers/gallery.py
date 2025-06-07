"""
Simplified Gallery router for Crow's Eye API.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import uuid
from datetime import datetime

router = APIRouter()


class GalleryItem(BaseModel):
    """Gallery item model."""
    id: str
    name: str
    description: str
    media_items: List[str]  # List of media IDs
    created_at: str
    updated_at: str
    thumbnail_url: Optional[str] = None
    tags: List[str] = []


class CreateGalleryRequest(BaseModel):
    """Create gallery request model."""
    name: str
    description: Optional[str] = ""
    media_items: List[str] = []
    tags: List[str] = []


class GalleryListResponse(BaseModel):
    """Gallery list response model."""
    galleries: List[GalleryItem]
    total: int


@router.post("/", response_model=GalleryItem)
async def create_gallery(request: CreateGalleryRequest):
    """
    Create a new gallery to organize media items.
    
    Features:
    - Organize media into collections
    - Add descriptions and tags
    - Auto-generate thumbnails
    - Smart sorting and filtering
    """
    if len(request.name.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gallery name must be at least 3 characters long"
        )
    
    gallery_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    return GalleryItem(
        id=gallery_id,
        name=request.name.strip(),
        description=request.description.strip() if request.description else "",
        media_items=request.media_items,
        created_at=now,
        updated_at=now,
        thumbnail_url=f"https://example.com/gallery-thumbnails/{gallery_id}" if request.media_items else None,
        tags=request.tags
    )


@router.get("/", response_model=GalleryListResponse)
async def list_galleries(limit: int = 20, offset: int = 0, tag: Optional[str] = None):
    """
    List all galleries with optional filtering.
    
    Filters:
    - tag: Filter galleries by tag
    """
    # Mock response - in production this would fetch from database
    galleries = [
        GalleryItem(
            id=str(uuid.uuid4()),
            name="Sample Gallery",
            description="A sample gallery for demonstration",
            media_items=["media1", "media2", "media3"],
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat(),
            thumbnail_url="https://example.com/gallery-thumbnails/sample1",
            tags=["demo", "sample"]
        ),
        GalleryItem(
            id=str(uuid.uuid4()),
            name="Product Photos",
            description="Collection of product photography",
            media_items=["media4", "media5"],
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat(),
            thumbnail_url="https://example.com/gallery-thumbnails/sample2",
            tags=["products", "photography"]
        )
    ]
    
    # Apply tag filter if specified
    if tag:
        galleries = [gallery for gallery in galleries if tag in gallery.tags]
    
    return GalleryListResponse(
        galleries=galleries[offset:offset+limit],
        total=len(galleries)
    )


@router.get("/{gallery_id}", response_model=GalleryItem)
async def get_gallery(gallery_id: str):
    """Get a specific gallery by ID."""
    # Mock response - in production this would fetch from database
    return GalleryItem(
        id=gallery_id,
        name="Sample Gallery",
        description="A sample gallery for demonstration",
        media_items=["media1", "media2", "media3"],
        created_at=datetime.now().isoformat(),
        updated_at=datetime.now().isoformat(),
        thumbnail_url=f"https://example.com/gallery-thumbnails/{gallery_id}",
        tags=["demo"]
    )


@router.put("/{gallery_id}", response_model=GalleryItem)
async def update_gallery(gallery_id: str, request: CreateGalleryRequest):
    """Update an existing gallery."""
    if len(request.name.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gallery name must be at least 3 characters long"
        )
    
    # In production, this would update the database record
    return GalleryItem(
        id=gallery_id,
        name=request.name.strip(),
        description=request.description.strip() if request.description else "",
        media_items=request.media_items,
        created_at=datetime.now().isoformat(),  # Would be preserved from original
        updated_at=datetime.now().isoformat(),
        thumbnail_url=f"https://example.com/gallery-thumbnails/{gallery_id}" if request.media_items else None,
        tags=request.tags
    )


@router.delete("/{gallery_id}")
async def delete_gallery(gallery_id: str):
    """Delete a gallery."""
    # In production, this would remove the gallery from the database
    # Note: This doesn't delete the media items, just the gallery organization
    return {"message": f"Gallery {gallery_id} deleted successfully"}


@router.post("/{gallery_id}/media")
async def add_media_to_gallery(gallery_id: str, media_ids: List[str]):
    """Add media items to a gallery."""
    if not media_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one media ID is required"
        )
    
    # In production, this would:
    # 1. Validate that all media IDs exist
    # 2. Add them to the gallery
    # 3. Update the gallery's thumbnail if needed
    
    return {
        "message": f"Added {len(media_ids)} media items to gallery {gallery_id}",
        "media_ids": media_ids
    }


@router.delete("/{gallery_id}/media/{media_id}")
async def remove_media_from_gallery(gallery_id: str, media_id: str):
    """Remove a media item from a gallery."""
    return {"message": f"Removed media {media_id} from gallery {gallery_id}"}


@router.get("/{gallery_id}/export")
async def export_gallery(gallery_id: str, format: str = "zip"):
    """Export a gallery as a downloadable archive."""
    supported_formats = ["zip", "tar"]
    if format not in supported_formats:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format. Supported: {', '.join(supported_formats)}"
        )
    
    return {
        "download_url": f"https://example.com/exports/{gallery_id}.{format}",
        "expires_at": datetime.now().isoformat()
    } 