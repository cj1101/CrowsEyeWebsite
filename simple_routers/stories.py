"""
Simplified Stories router for Crow's Eye API.
"""

from typing import List
from fastapi import APIRouter
from pydantic import BaseModel
import uuid
from datetime import datetime

router = APIRouter()


class StoryRequest(BaseModel):
    title: str
    content: str
    media_urls: List[str] = []


class StoryResponse(BaseModel):
    id: str
    title: str
    content: str
    media_urls: List[str]
    created_at: str


@router.post("/", response_model=StoryResponse)
async def create_story(request: StoryRequest):
    """Create a new story."""
    return StoryResponse(
        id=str(uuid.uuid4()),
        title=request.title,
        content=request.content,
        media_urls=request.media_urls,
        created_at=datetime.now().isoformat()
    )


@router.get("/{story_id}", response_model=StoryResponse)
async def get_story(story_id: str):
    """Get a story by ID."""
    return StoryResponse(
        id=story_id,
        title="Sample Story",
        content="This is a sample story content.",
        media_urls=["https://example.com/media1"],
        created_at=datetime.now().isoformat()
    )


@router.get("/", response_model=List[StoryResponse])
async def list_stories():
    """List all stories."""
    return [
        StoryResponse(
            id=str(uuid.uuid4()),
            title="Sample Story",
            content="Sample content",
            media_urls=[],
            created_at=datetime.now().isoformat()
        )
    ] 