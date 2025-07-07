import os
import asyncio
import logging
import io
import shutil
from datetime import timedelta
from typing import Tuple, Optional, Dict, Any
from pathlib import Path
from PIL import Image
import json
import uuid
import mimetypes

logger = logging.getLogger(__name__)

class LocalStorageService:
    """Local file storage service for offline development."""
    
    def __init__(self):
        # Create storage directories
        self.storage_root = Path("./local_storage")
        self.media_dir = self.storage_root / "media"
        self.thumbnails_dir = self.storage_root / "thumbnails"
        
        # Create directories if they don't exist
        self.media_dir.mkdir(parents=True, exist_ok=True)
        self.thumbnails_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"LocalStorageService initialized with storage at: {self.storage_root}")
    
    async def upload_file(
        self, 
        file_content: bytes, 
        filename: str, 
        content_type: str,
        user_id: int
    ) -> Tuple[str, dict]:
        """
        Store file locally and return blob name and metadata.
        
        Args:
            file_content: File content as bytes
            filename: Original filename
            content_type: MIME type
            user_id: User ID (for organization)
            
        Returns:
            Tuple of (blob_name, metadata_dict)
        """
        try:
            # Generate unique blob name to avoid conflicts
            file_extension = Path(filename).suffix
            unique_id = str(uuid.uuid4())[:8]
            blob_name = f"user_{user_id}_{unique_id}_{filename}"
            
            # Full path for storage
            file_path = self.media_dir / blob_name
            
            # Write file to local storage
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            # Get file metadata
            metadata = await self._get_file_metadata(file_content, content_type)
            metadata['local_path'] = str(file_path)
            metadata['blob_name'] = blob_name
            
            logger.info(f"File uploaded to local storage: {blob_name}")
            return blob_name, metadata
            
        except Exception as e:
            logger.error(f"Error uploading file to local storage: {e}")
            raise
    
    async def _get_file_metadata(self, file_content: bytes, content_type: str) -> dict:
        """Extract metadata from file content."""
        metadata = {
            'file_size': len(file_content),
            'content_type': content_type,
        }
        
        # If it's an image, get dimensions
        if content_type.startswith('image/'):
            try:
                loop = asyncio.get_event_loop()
                image = await loop.run_in_executor(
                    None, lambda: Image.open(io.BytesIO(file_content))
                )
                metadata['width'] = image.width
                metadata['height'] = image.height
                metadata['media_type'] = 'image'
            except Exception:
                metadata['media_type'] = 'image'
        elif content_type.startswith('video/'):
            metadata['media_type'] = 'video'
            # Basic video metadata - could be enhanced with ffprobe if needed
            metadata['width'] = 0
            metadata['height'] = 0
            metadata['duration'] = 0
        else:
            metadata['media_type'] = 'other'
            
        return metadata
    
    async def generate_thumbnail(
        self, 
        blob_name: str, 
        size: Tuple[int, int] = (300, 300)
    ) -> Optional[str]:
        """
        Generate thumbnail for image files.
        
        Args:
            blob_name: Original file blob name
            size: Thumbnail size (width, height)
            
        Returns:
            Thumbnail blob name or None if not an image
        """
        try:
            # Path to original file
            original_path = self.media_dir / blob_name
            
            if not original_path.exists():
                logger.warning(f"Original file not found for thumbnail: {blob_name}")
                return None
            
            # Read original file
            with open(original_path, 'rb') as f:
                file_content = f.read()
            
            # Detect content type
            content_type, _ = mimetypes.guess_type(str(original_path))
            if not content_type or not content_type.startswith('image/'):
                return None
            
            # Create thumbnail
            loop = asyncio.get_event_loop()
            image = await loop.run_in_executor(
                None, lambda: Image.open(io.BytesIO(file_content))
            )
            
            # Convert to RGB if necessary (for JPEG compatibility)
            if image.mode in ('RGBA', 'LA', 'P'):
                image = image.convert('RGB')
            
            # Create thumbnail
            image.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Save thumbnail to bytes
            thumbnail_io = io.BytesIO()
            image.save(thumbnail_io, format='JPEG', optimize=True, quality=85)
            thumbnail_content = thumbnail_io.getvalue()
            
            # Save thumbnail to local storage
            thumbnail_name = f"{blob_name}.thumb.jpg"
            thumbnail_path = self.thumbnails_dir / thumbnail_name
            
            with open(thumbnail_path, 'wb') as f:
                f.write(thumbnail_content)
            
            logger.info(f"Thumbnail generated: {thumbnail_name}")
            return f"thumbnails/{thumbnail_name}"
            
        except Exception as e:
            logger.error(f"Error generating thumbnail for {blob_name}: {e}")
            return None
    
    async def get_signed_url(
        self, 
        blob_name: str, 
        expiration: timedelta = timedelta(hours=1)
    ) -> str:
        """
        Generate a local URL for accessing a file.
        
        Args:
            blob_name: Name of the blob
            expiration: URL expiration time (ignored for local storage)
            
        Returns:
            Local file URL
        """
        # For local storage, return a download endpoint URL
        if blob_name.startswith("thumbnails/"):
            # Remove thumbnails/ prefix for the API endpoint
            file_id = blob_name.replace("thumbnails/", "").replace(".thumb.jpg", "")
            return f"/api/v1/media/local/{file_id}/thumbnail"
        else:
            return f"/api/v1/media/local/{blob_name}/download"
    
    async def delete_file(self, blob_name: str) -> bool:
        """
        Delete a file from local storage.
        
        Args:
            blob_name: Name of the blob to delete
            
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            # Delete main file
            file_path = self.media_dir / blob_name
            if file_path.exists():
                file_path.unlink()
            
            # Delete thumbnail if exists
            thumbnail_name = f"{blob_name}.thumb.jpg"
            thumbnail_path = self.thumbnails_dir / thumbnail_name
            if thumbnail_path.exists():
                thumbnail_path.unlink()
                
            logger.info(f"File deleted from local storage: {blob_name}")
            return True
        except Exception as e:
            logger.error(f"Error deleting file {blob_name}: {e}")
            return False
    
    async def file_exists(self, blob_name: str) -> bool:
        """Check if a file exists in local storage."""
        file_path = self.media_dir / blob_name
        return file_path.exists()
    
    async def get_file_content(self, blob_name: str) -> Optional[bytes]:
        """Get file content from local storage."""
        try:
            file_path = self.media_dir / blob_name
            if not file_path.exists():
                return None
            
            with open(file_path, 'rb') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading file {blob_name}: {e}")
            return None
    
    async def get_thumbnail_content(self, blob_name: str) -> Optional[bytes]:
        """Get thumbnail content from local storage."""
        try:
            thumbnail_name = f"{blob_name}.thumb.jpg"
            thumbnail_path = self.thumbnails_dir / thumbnail_name
            if not thumbnail_path.exists():
                return None
            
            with open(thumbnail_path, 'rb') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading thumbnail {blob_name}: {e}")
            return None


# Global instance
local_storage_service = LocalStorageService() 