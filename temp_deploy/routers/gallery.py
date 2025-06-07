from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
import json
from datetime import datetime
import uuid

router = APIRouter()

@router.get("/")
async def get_galleries():
    """Get all galleries"""
    return {
        "galleries": [
            {
                "id": "gallery_1",
                "name": "Product Showcase",
                "description": "Our best product photography",
                "media_count": 25,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "thumbnail": "/api/media/gallery_1_thumb.jpg",
                "is_public": True,
                "tags": ["products", "showcase"]
            },
            {
                "id": "gallery_2", 
                "name": "Behind the Scenes",
                "description": "Team and process content",
                "media_count": 15,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
                "thumbnail": "/api/media/gallery_2_thumb.jpg",
                "is_public": False,
                "tags": ["team", "process"]
            }
        ],
        "total": 2
    }

@router.post("/")
async def create_gallery(name: str, description: Optional[str] = None, is_public: bool = True):
    """Create a new gallery"""
    gallery_id = str(uuid.uuid4())
    
    return {
        "id": gallery_id,
        "name": name,
        "description": description,
        "media_count": 0,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "is_public": is_public,
        "message": "Gallery created successfully"
    }

@router.get("/{gallery_id}")
async def get_gallery(gallery_id: str):
    """Get specific gallery with media"""
    return {
        "id": gallery_id,
        "name": "Sample Gallery",
        "description": "Gallery description",
        "media_count": 10,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "is_public": True,
        "media_items": [
            {
                "id": "media_1",
                "filename": "image1.jpg",
                "type": "image",
                "thumbnail_url": "/api/media/thumbnails/image1_thumb.jpg",
                "added_at": datetime.now().isoformat()
            },
            {
                "id": "media_2",
                "filename": "video1.mp4", 
                "type": "video",
                "thumbnail_url": "/api/media/thumbnails/video1_thumb.jpg",
                "added_at": datetime.now().isoformat()
            }
        ],
        "tags": ["curated", "featured"]
    }

@router.put("/{gallery_id}")
async def update_gallery(
    gallery_id: str, 
    name: Optional[str] = None,
    description: Optional[str] = None,
    is_public: Optional[bool] = None
):
    """Update gallery details"""
    return {
        "id": gallery_id,
        "name": name,
        "description": description,
        "is_public": is_public,
        "updated_at": datetime.now().isoformat(),
        "message": "Gallery updated successfully"
    }

@router.delete("/{gallery_id}")
async def delete_gallery(gallery_id: str):
    """Delete gallery"""
    return {"message": f"Gallery {gallery_id} deleted successfully"}

@router.post("/{gallery_id}/media")
async def add_media_to_gallery(gallery_id: str, media_ids: List[str]):
    """Add media items to gallery"""
    return {
        "gallery_id": gallery_id,
        "added_media": media_ids,
        "total_added": len(media_ids),
        "message": f"Added {len(media_ids)} media items to gallery"
    }

@router.delete("/{gallery_id}/media/{media_id}")
async def remove_media_from_gallery(gallery_id: str, media_id: str):
    """Remove media item from gallery"""
    return {
        "gallery_id": gallery_id,
        "removed_media": media_id,
        "message": "Media removed from gallery successfully"
    } 