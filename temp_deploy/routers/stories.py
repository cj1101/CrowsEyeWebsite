from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import List, Optional
import json
from datetime import datetime
import uuid

router = APIRouter()

@router.get("/")
async def get_stories():
    """Get all stories"""
    return {
        "stories": [
            {
                "id": "story_1",
                "title": "Product Launch Story",
                "type": "image_series",
                "slides_count": 5,
                "status": "published",
                "created_at": datetime.now().isoformat(),
                "published_at": datetime.now().isoformat(),
                "expires_at": (datetime.now() + timedelta(hours=24)).isoformat(),
                "thumbnail": "/api/media/story_1_thumb.jpg",
                "platforms": ["instagram"],
                "engagement": {
                    "views": 1250,
                    "replies": 15,
                    "shares": 8
                }
            },
            {
                "id": "story_2",
                "title": "Behind the Scenes",
                "type": "video",
                "slides_count": 1,
                "status": "draft",
                "created_at": datetime.now().isoformat(),
                "thumbnail": "/api/media/story_2_thumb.jpg",
                "platforms": [],
                "engagement": {
                    "views": 0,
                    "replies": 0,
                    "shares": 0
                }
            }
        ],
        "total": 2
    }

@router.post("/create")
async def create_story(
    title: str,
    story_type: str = "image_series",  # image_series, video, poll, quiz
    media_files: List[UploadFile] = File(...),
    text_overlays: Optional[List[str]] = None,
    background_music: Optional[str] = None
):
    """Create a new story"""
    
    story_id = str(uuid.uuid4())
    
    # Process uploaded media
    slides = []
    for i, file in enumerate(media_files):
        slide_id = str(uuid.uuid4())
        slides.append({
            "id": slide_id,
            "order": i + 1,
            "type": "image" if file.content_type.startswith("image") else "video",
            "filename": file.filename,
            "duration": 5,  # seconds
            "text_overlay": text_overlays[i] if text_overlays and i < len(text_overlays) else None
        })
    
    return {
        "id": story_id,
        "title": title,
        "type": story_type,
        "slides": slides,
        "slides_count": len(slides),
        "status": "draft",
        "created_at": datetime.now().isoformat(),
        "message": "Story created successfully"
    }

@router.get("/{story_id}")
async def get_story(story_id: str):
    """Get specific story details"""
    return {
        "id": story_id,
        "title": "Sample Story",
        "type": "image_series",
        "slides_count": 3,
        "status": "published",
        "created_at": datetime.now().isoformat(),
        "published_at": datetime.now().isoformat(),
        "slides": [
            {
                "id": "slide_1",
                "order": 1,
                "type": "image",
                "media_url": "/api/media/story_slide_1.jpg",
                "thumbnail_url": "/api/media/story_slide_1_thumb.jpg",
                "duration": 5,
                "text_overlay": "Welcome to our story!",
                "interactive_elements": []
            },
            {
                "id": "slide_2", 
                "order": 2,
                "type": "image",
                "media_url": "/api/media/story_slide_2.jpg",
                "thumbnail_url": "/api/media/story_slide_2_thumb.jpg",
                "duration": 5,
                "text_overlay": "Behind the scenes",
                "interactive_elements": [
                    {
                        "type": "poll",
                        "question": "What do you think?",
                        "options": ["Amazing!", "Love it!"]
                    }
                ]
            },
            {
                "id": "slide_3",
                "order": 3,
                "type": "video",
                "media_url": "/api/media/story_slide_3.mp4",
                "thumbnail_url": "/api/media/story_slide_3_thumb.jpg",
                "duration": 10,
                "text_overlay": "Coming soon...",
                "interactive_elements": []
            }
        ],
        "platforms": ["instagram"],
        "engagement": {
            "views": 1250,
            "replies": 15,
            "shares": 8,
            "poll_responses": {
                "Amazing!": 45,
                "Love it!": 38
            }
        }
    }

@router.put("/{story_id}")
async def update_story(
    story_id: str,
    title: Optional[str] = None,
    slides: Optional[List[dict]] = None
):
    """Update story details"""
    return {
        "id": story_id,
        "title": title,
        "slides_updated": len(slides) if slides else 0,
        "updated_at": datetime.now().isoformat(),
        "message": "Story updated successfully"
    }

@router.post("/{story_id}/publish")
async def publish_story(story_id: str, platforms: List[str]):
    """Publish story to specified platforms"""
    
    # Validate platforms
    supported_platforms = ["instagram", "snapchat", "facebook"]
    invalid_platforms = [p for p in platforms if p not in supported_platforms]
    
    if invalid_platforms:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported platforms: {', '.join(invalid_platforms)}"
        )
    
    return {
        "story_id": story_id,
        "platforms": platforms,
        "published_at": datetime.now().isoformat(),
        "expires_at": (datetime.now() + timedelta(hours=24)).isoformat(),
        "status": "published",
        "message": f"Story published to {', '.join(platforms)}"
    }

@router.delete("/{story_id}")
async def delete_story(story_id: str):
    """Delete story"""
    return {"message": f"Story {story_id} deleted successfully"}

@router.get("/{story_id}/analytics")
async def get_story_analytics(story_id: str):
    """Get story performance analytics"""
    return {
        "story_id": story_id,
        "performance": {
            "total_views": 1250,
            "unique_views": 890,
            "completion_rate": 65.5,
            "average_watch_time": 12.3,
            "replies": 15,
            "shares": 8,
            "profile_visits": 23
        },
        "demographics": {
            "age_groups": {
                "18-24": 35,
                "25-34": 40,
                "35-44": 20,
                "45+": 5
            },
            "locations": {
                "United States": 50,
                "Canada": 20,
                "United Kingdom": 15,
                "Other": 15
            }
        },
        "engagement_timeline": [
            {"hour": 0, "views": 150},
            {"hour": 1, "views": 300},
            {"hour": 2, "views": 450},
            {"hour": 3, "views": 350}
        ]
    }

@router.post("/templates")
async def create_story_template(
    name: str,
    description: str,
    template_data: dict
):
    """Create a reusable story template"""
    
    template_id = str(uuid.uuid4())
    
    return {
        "id": template_id,
        "name": name,
        "description": description,
        "created_at": datetime.now().isoformat(),
        "uses_count": 0,
        "message": "Story template created successfully"
    }

@router.get("/templates")
async def get_story_templates():
    """Get available story templates"""
    return {
        "templates": [
            {
                "id": "template_1",
                "name": "Product Showcase",
                "description": "Perfect for highlighting products",
                "thumbnail": "/api/media/template_1_thumb.jpg",
                "uses_count": 25,
                "created_at": "2024-12-01T00:00:00Z"
            },
            {
                "id": "template_2",
                "name": "Behind the Scenes",
                "description": "Show your process and team",
                "thumbnail": "/api/media/template_2_thumb.jpg",
                "uses_count": 18,
                "created_at": "2024-12-01T00:00:00Z"
            }
        ],
        "total": 2
    }

from datetime import timedelta 