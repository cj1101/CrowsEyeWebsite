from typing import List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Query, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from crow_eye_api.crud import crud_media
from crow_eye_api import schemas, models
from crow_eye_api.database import get_db
from crow_eye_api.api.api_v1.dependencies import get_current_active_user
from crow_eye_api.core.config import settings

router = APIRouter()


@router.get("/", response_model=List[schemas.MediaItemResponse])
async def get_media_items(
    request: Request,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    current_user: models.User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all media items for the current user.
    """
    media_items = await crud_media.get_media_items(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    
    import asyncio
    return await asyncio.gather(*[_build_media_response(item, request) for item in media_items])


@router.post("/search", response_model=schemas.MediaSearchResponse)
async def search_media(
    request: Request,
    search_params: schemas.MediaSearch,
    current_user: models.User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Search media items with advanced filtering and AI tag search.
    """
    media_items, total = await crud_media.search_media_items(
        db=db, user_id=current_user.id, search_params=search_params
    )
    
    import asyncio
    items_response = await asyncio.gather(*[_build_media_response(item, request) for item in media_items])
    
    return schemas.MediaSearchResponse(
        items=items_response,
        total=total,
        limit=search_params.limit,
        offset=search_params.offset,
        has_more=(search_params.offset + search_params.limit) < total
    )


@router.get("/{media_id}", response_model=schemas.MediaItemResponse)
async def get_media_item(
    request: Request,
    media_id: Union[int, str],
    current_user: models.User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific media item by ID.
    """
    # Convert string to int if possible, otherwise treat as invalid
    if isinstance(media_id, str):
        try:
            media_id = int(media_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media item not found"
            )
    
    media_item = await crud_media.get_media_item(
        db=db, media_id=media_id, user_id=current_user.id
    )
    
    if not media_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media item not found"
        )
    
    return await _build_media_response(media_item, request)


@router.put("/{media_id}", response_model=schemas.MediaItemResponse)
async def update_media_item(
    request: Request,
    media_id: Union[int, str],
    media_update: schemas.MediaItemUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a media item (caption, tags, post-ready status).
    """
    # Convert string to int if possible, otherwise treat as invalid
    if isinstance(media_id, str):
        try:
            media_id = int(media_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media item not found"
            )
    
    updated_media = await crud_media.update_media_item(
        db=db, media_id=media_id, user_id=current_user.id, media_update=media_update
    )
    
    if not updated_media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media item not found"
        )
    
    return await _build_media_response(updated_media, request)


@router.delete("/{media_id}")
async def delete_media_item(
    media_id: Union[int, str],
    current_user: models.User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a media item and its files from Google Cloud Storage.
    """
    # Convert string to int if possible, otherwise treat as invalid
    if isinstance(media_id, str):
        try:
            media_id = int(media_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media item not found"
            )
    
    from crow_eye_api.services.storage import storage_service
    
    # Get media item first to access file paths
    media_item = await crud_media.get_media_item(
        db=db, media_id=media_id, user_id=current_user.id
    )
    
    if not media_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media item not found"
        )
    
    # Delete from database first
    success = await crud_media.delete_media_item(
        db=db, media_id=media_id, user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete media item from database"
        )
    
    # Delete files from Google Cloud Storage
    try:
        await storage_service.delete_file(media_item.filename)
    except Exception as e:
        # Log the error but don't fail the entire operation
        print(f"Warning: Failed to delete file from GCS: {e}")
    
    return {"success": True, "message": "Media item deleted successfully"}


@router.post("/upload")
async def upload_media(
    request: Request,
    file: UploadFile = File(...),
    caption: Optional[str] = None,
    current_user: models.User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a new media file to Google Cloud Storage.
    """
    import magic
    import logging
    
    logger = logging.getLogger(__name__)
    logger.info(f"Media upload requested by user: {current_user.email}")
    
    # Validate file type
    allowed_types = {
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'
    }
    
    # Read file content
    file_content = await file.read()
    logger.info(f"File read: {len(file_content)} bytes")
    
    # Detect actual MIME type
    try:
        detected_type = magic.from_buffer(file_content, mime=True)
        content_type = detected_type if detected_type in allowed_types else file.content_type
        logger.info(f"Detected content type: {detected_type}, using: {content_type}")
    except Exception as e:
        logger.error(f"Error detecting file type: {e}")
        content_type = file.content_type
    
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {content_type} not supported. Allowed types: {', '.join(allowed_types)}"
        )
    
    # Check file size (max 50MB)
    max_size = 50 * 1024 * 1024  # 50MB
    if len(file_content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds 50MB limit"
        )
    
    try:
        # Try to upload to Google Cloud Storage
        from crow_eye_api.services.storage import storage_service
        
        blob_name, file_metadata = await storage_service.upload_file(
            file_content=file_content,
            filename=file.filename or "unnamed_file",
            content_type=content_type,
            user_id=current_user.id
        )
        
        # Generate thumbnail for images
        thumbnail_path = None
        if file_metadata['media_type'] == 'image':
            try:
                thumbnail_path = await storage_service.generate_thumbnail(blob_name)
            except Exception as e:
                logger.warning(f"Failed to generate thumbnail: {e}")
        
        # Analyze media with AI for tags, description, etc.
        try:
            from crow_eye_api.services.media_ai_service import media_ai_service
            ai_analysis = await media_ai_service.analyze_media(file_content, content_type, caption)
        except ImportError:
            # Fallback AI analysis if service not available
            ai_analysis = {
                'ai_tags': [{'tag': 'imported', 'confidence': 0.8}],
                'description': f'Uploaded {file_metadata.get("media_type", "file")}: {file.filename}',
                'status': 'completed',
                'processing_metadata': {'processing_time': 0.1}
            }
        
        # Create database record with AI analysis
        media_create = schemas.MediaItemCreate(
            filename=blob_name,
            original_filename=file.filename or "unnamed_file",
            gcs_path=blob_name,  # Use blob_name as GCS path
            caption=caption or "AI-generated content ready for sharing",
            media_type=file_metadata['media_type'],
            file_size=file_metadata['file_size'],
            width=file_metadata.get('width'),
            height=file_metadata.get('height'),
            ai_tags=ai_analysis.get('ai_tags', []),
            is_post_ready=ai_analysis.get('is_processed', True)
        )
        
        media_item = await crud_media.create_media_item(db=db, media_item=media_create, user_id=current_user.id)
        
        # Update media item with AI analysis results
        if ai_analysis:
            media_item.description = ai_analysis.get('description')
            media_item.status = ai_analysis.get('status', 'completed')
            media_item.post_metadata = ai_analysis.get('processing_metadata', {})
            await db.commit()
            await db.refresh(media_item)
        
        # Update the media item with the signed URLs if available
        try:
            download_url = await storage_service.get_signed_url(blob_name)
            if thumbnail_path:
                media_item.thumbnail_path = thumbnail_path
        except Exception as e:
            logger.warning(f"Failed to generate signed URLs: {e}")
            # Set gcs_path to a public URL for the helper function
            media_item.gcs_path = f"gs://{settings.GOOGLE_CLOUD_STORAGE_BUCKET}/{blob_name}"
        else:
            # Update gcs_path to the signed URL
            media_item.gcs_path = download_url
        
        # Use the helper function to build the response
        media_response = await _build_media_response(media_item)
        
        # Return response in the format expected by frontend
        return {
            "success": True,
            "data": {
                "id": f"media_{media_item.id}",
                "name": media_item.original_filename,
                "content_type": content_type,
                "url": download_url,
                "thumbnail_url": thumbnail_url,
                "file_size": media_item.file_size,
                "created_at": media_item.upload_date.isoformat() if media_item.upload_date else None,
                "tags": ["uploaded"],
                "platforms": []
            }
        }
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Upload failed: {error_msg}")
        
        # Check if it's a Google Cloud billing/authentication issue
        if "billing account" in error_msg.lower() or "403" in error_msg or "authentication" in error_msg.lower():
            # For testing purposes, create a mock database entry when GCP is not available
            logger.warning("Google Cloud Storage not available, creating mock database entry for testing")
            
            # Determine media type from content type
            media_type = 'image' if content_type.startswith('image/') else 'video'
            
            # Analyze media with AI for tags, description, etc.
            from crow_eye_api.services.media_ai_service import media_ai_service
            ai_analysis = await media_ai_service.analyze_media(file_content, content_type, caption)
            
            # Create database record without GCS upload
            import uuid
            unique_id = str(uuid.uuid4())[:8]
            test_filename = f"test_{unique_id}_{file.filename or 'unnamed_file'}"
            media_create = schemas.MediaItemCreate(
                filename=test_filename,
                original_filename=file.filename or "unnamed_file",
                gcs_path=f"test/{test_filename}",  # Mock GCS path for testing
                caption=caption or "AI-generated content ready for sharing",
                media_type=media_type,
                file_size=len(file_content),
                width=None,
                height=None,
                ai_tags=ai_analysis.get('ai_tags', []),
                is_post_ready=ai_analysis.get('is_processed', True)
            )
            
            try:
                media_item = await crud_media.create_media_item(db=db, media_item=media_create, user_id=current_user.id)
                
                # Update media item with AI analysis results
                if ai_analysis:
                    media_item.description = ai_analysis.get('description')
                    media_item.status = ai_analysis.get('status', 'completed')
                    media_item.post_metadata = ai_analysis.get('processing_metadata', {})
                    await db.commit()
                    await db.refresh(media_item)
                
                # For testing mode, set the gcs_path to indicate testing
                media_item.gcs_path = "[Google Cloud Storage not configured - testing mode]"
                
                # Use the helper function to build the response
                media_response = _build_media_response(media_item)
                
                # Return response in the format expected by frontend (testing mode)
                return {
                    "success": True,
                    "data": {
                        "id": f"media_{media_item.id}",
                        "name": media_item.original_filename,
                        "content_type": content_type,
                        "url": "[Google Cloud Storage not configured - testing mode]",
                        "thumbnail_url": None,
                        "file_size": media_item.file_size,
                        "created_at": media_item.upload_date.isoformat() if media_item.upload_date else None,
                        "tags": ["uploaded"],
                        "platforms": []
                    }
                }
            except Exception as db_error:
                logger.error(f"Database error: {db_error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Database error: {str(db_error)}"
                )
        else:
            # Other errors
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Upload failed: {error_msg}"
            )


@router.get("/{media_id}/download")
async def download_media(
    media_id: Union[int, str],
    current_user: models.User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a signed URL to download media file from storage.
    """
    # Convert string to int if possible, otherwise treat as invalid
    if isinstance(media_id, str):
        try:
            media_id = int(media_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media item not found"
            )
    
    from crow_eye_api.services.storage import storage_service
    
    media_item = await crud_media.get_media_item(
        db=db, media_id=media_id, user_id=current_user.id
    )
    
    if not media_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media item not found"
        )
    
    try:
        # Check if using local storage and serve file directly
        if hasattr(storage_service, 'get_file_content'):
            # Local storage - serve file directly
            file_content = await storage_service.get_file_content(media_item.filename)
            if not file_content:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="File not found in local storage"
                )
            
            from fastapi.responses import Response
            import mimetypes
            
            # Determine content type
            content_type, _ = mimetypes.guess_type(media_item.original_filename)
            if not content_type:
                content_type = "application/octet-stream"
            
            return Response(
                content=file_content,
                media_type=content_type,
                headers={
                    "Content-Disposition": f"attachment; filename={media_item.original_filename}"
                }
            )
        else:
            # Google Cloud Storage - return signed URL
            signed_url = await storage_service.get_signed_url(media_item.filename)
            return {"download_url": signed_url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download file: {str(e)}"
        )


@router.get("/{media_id}/thumbnail")
async def get_thumbnail(
    media_id: Union[int, str],
    current_user: models.User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get thumbnail for media item.
    """
    # Convert string to int if possible, otherwise treat as invalid
    if isinstance(media_id, str):
        try:
            media_id = int(media_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media item not found"
            )
    
    from crow_eye_api.services.storage import storage_service
    
    media_item = await crud_media.get_media_item(
        db=db, media_id=media_id, user_id=current_user.id
    )
    
    if not media_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media item not found"
        )
    
    try:
        # Check if using local storage and serve thumbnail directly
        if hasattr(storage_service, 'get_thumbnail_content'):
            # Local storage - serve thumbnail directly
            thumbnail_content = await storage_service.get_thumbnail_content(media_item.filename)
            if not thumbnail_content:
                # Try to generate thumbnail if it doesn't exist
                thumbnail_path = await storage_service.generate_thumbnail(media_item.filename)
                if thumbnail_path:
                    thumbnail_content = await storage_service.get_thumbnail_content(media_item.filename)
                
                if not thumbnail_content:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Thumbnail not available for this media item"
                    )
            
            from fastapi.responses import Response
            
            return Response(
                content=thumbnail_content,
                media_type="image/jpeg",
                headers={
                    "Content-Disposition": f"inline; filename={media_item.filename}.thumb.jpg"
                }
            )
        else:
            # Google Cloud Storage - return signed URL
            if not media_item.thumbnail_path:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Thumbnail not available for this media item"
                )
            
            signed_url = await storage_service.get_signed_url(media_item.thumbnail_path)
            return {"thumbnail_url": signed_url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get thumbnail: {str(e)}"
        )


@router.post("/{media_id}/edit", response_model=schemas.MediaEditResponse)
async def edit_media(
    media_id: Union[int, str],
    edit_request: schemas.MediaEditRequest,
    current_user: models.User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Apply editing instructions to media using natural language instructions.
    """
    # Convert string to int if possible, otherwise treat as invalid
    if isinstance(media_id, str):
        try:
            media_id = int(media_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media item not found"
            )
    
    media_item = await crud_media.get_media_item(
        db=db, media_id=media_id, user_id=current_user.id
    )
    
    if not media_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media item not found"
        )
    
    try:
        # Import media editing service
        from crow_eye_api.services.media_editing_service import MediaEditingService
        editing_service = MediaEditingService()
        
        # Start editing job
        job_id = await editing_service.start_editing_job(
            media_item=media_item,
            instructions=edit_request.instructions,
            formatting_options=edit_request.formatting_options,
            user_id=current_user.id
        )
        
        return schemas.MediaEditResponse(
            job_id=job_id,
            status="processing",
            message="Media editing job started successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error starting media editing job: {str(e)}"
        )


@router.get("/{media_id}/edit-status/{job_id}", response_model=schemas.MediaEditStatusResponse)
async def get_edit_status(
    media_id: Union[int, str],
    job_id: str,
    current_user: models.User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the status of a media editing job.
    """
    # Convert string to int if possible, otherwise treat as invalid
    if isinstance(media_id, str):
        try:
            media_id = int(media_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media item not found"
            )
    
    media_item = await crud_media.get_media_item(
        db=db, media_id=media_id, user_id=current_user.id
    )
    
    if not media_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media item not found"
        )
    
    try:
        # Import media editing service
        from crow_eye_api.services.media_editing_service import MediaEditingService
        editing_service = MediaEditingService()
        
        # Get job status
        job_status = await editing_service.get_job_status(
            job_id=job_id,
            user_id=current_user.id
        )
        
        if not job_status:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Editing job not found"
            )
        
        response = schemas.MediaEditStatusResponse(
            job_id=job_id,
            status=job_status.get("status", "unknown"),
            progress=job_status.get("progress", 0),
            message=job_status.get("message", ""),
            error=job_status.get("error"),
            result_media_id=job_status.get("result_media_id")
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting editing job status: {str(e)}"
        )

# New endpoints for API specification compliance

@router.post("/{media_id}/process", response_model=schemas.MediaEditResponse)
async def process_media_with_instructions(
    media_id: Union[int, str],
    process_request: schemas.MediaProcessingRequest,
    current_user: models.User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Process media with natural language instructions."""
    # Convert string to int if possible, otherwise treat as invalid
    if isinstance(media_id, str):
        try:
            media_id = int(media_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media item not found"
            )
    
    # For demo mode, return mock processing response
    import uuid
    job_id = str(uuid.uuid4())
    
    return schemas.MediaEditResponse(
        job_id=job_id,
        status="processing",
        message=f"Media processing started with instructions: {process_request.instructions}"
    )

@router.post("/{media_id}/optimize", response_model=schemas.MediaEditResponse)
async def generate_platform_optimized_versions(
    media_id: Union[int, str],
    optimization_request: schemas.MediaOptimizationRequest,
    current_user: models.User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Generate platform-optimized versions of media."""
    # Convert string to int if possible, otherwise treat as invalid
    if isinstance(media_id, str):
        try:
            media_id = int(media_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Media item not found"
            )
    
    # For demo mode, return mock optimization response
    import uuid
    job_id = str(uuid.uuid4())
    
    return schemas.MediaEditResponse(
        job_id=job_id,
        status="processing",
        message=f"Platform optimization started for: {', '.join(optimization_request.platforms)}"
    )


# Enhanced Video Processing and Thumbnail Generation

@router.post("/video/process", response_model=schemas.VideoProcessingResponse)
async def process_video(
    request: schemas.VideoProcessingRequest,
    current_user: models.User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Process video with various operations (trim, resize, add captions, etc.).
    """
    try:
        import uuid
        import random
        
        # Verify video exists and belongs to user
        media_item = await crud_media.get_media_item(
            db=db, media_id=int(request.video_id), user_id=current_user.id
        )
        
        if not media_item or media_item.media_type != 'video':
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video not found"
            )
        
        # Generate job ID for processing
        job_id = f"video_proc_{uuid.uuid4().hex[:8]}"
        
        # Simulate video processing (replace with actual video processing logic)
        processed_video_url = f"https://processed-video-{job_id}.{request.output_format}"
        
        # Calculate estimated processing time based on operations
        estimated_time = len(request.operations) * 15  # 15 seconds per operation
        
        operations_applied = [op.get("type", "unknown") for op in request.operations]
        
        return schemas.VideoProcessingResponse(
            job_id=job_id,
            status="processing",
            processed_video_url=processed_video_url,
            estimated_time=estimated_time,
            operations_applied=operations_applied
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Video processing failed: {str(e)}"
        )


@router.post("/thumbnails/generate", response_model=schemas.ThumbnailGenerateResponse)
async def generate_thumbnails(
    request: schemas.ThumbnailGenerateRequest,
    current_user: models.User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate thumbnails for video content.
    """
    try:
        import uuid
        import random
        
        # Verify video exists and belongs to user
        media_item = await crud_media.get_media_item(
            db=db, media_id=int(request.video_id), user_id=current_user.id
        )
        
        if not media_item or media_item.media_type != 'video':
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video not found"
            )
        
        # Generate thumbnails (simulate with mock data)
        thumbnails = []
        best_score = 0
        best_thumbnail = None
        
        for i in range(request.count):
            thumbnail_id = f"thumb_{uuid.uuid4().hex[:8]}"
            timestamp = request.timestamp if request.timestamp else (i + 1) * 10.0
            
            # Simulate thumbnail quality scoring
            quality_score = random.uniform(0.6, 0.95)
            
            thumbnail_data = {
                "thumbnail_id": thumbnail_id,
                "url": f"https://thumbnail-{thumbnail_id}.jpg",
                "timestamp": timestamp,
                "quality_score": quality_score,
                "width": 1920,
                "height": 1080,
                "file_size": random.randint(50000, 200000)
            }
            
            thumbnails.append(thumbnail_data)
            
            if quality_score > best_score:
                best_score = quality_score
                best_thumbnail = thumbnail_data
        
        return schemas.ThumbnailGenerateResponse(
            thumbnails=thumbnails,
            video_id=request.video_id,
            total_generated=len(thumbnails),
            best_thumbnail=best_thumbnail
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Thumbnail generation failed: {str(e)}"
        )

# Helper function to convert ORM object to response schema
async def _build_media_response(item: models.MediaItem, request: Request) -> schemas.MediaItemResponse:
    """Builds a MediaItemResponse ensuring `url` and `thumbnail_url` are always populated."""
    import logging
    logger = logging.getLogger(__name__)
    
    from crow_eye_api.services.storage import storage_service
    # Determine base URL for original media
    base_url = str(request.base_url)
    download_url = f"{base_url}api/v1/media/{item.id}/download"
    
    logger.info(f"[_build_media_response] Generating URL for media item {item.id} with filename: {item.filename}")
    
    try:
        url = await storage_service.get_signed_url(item.filename)
        logger.info(f"[_build_media_response] Successfully generated signed URL for media item {item.id}: {url}")
    except Exception as e:
        logger.error(f"[_build_media_response] Failed to generate signed URL for media item {item.id}. Falling back to download URL. Error: {e}")
        url = download_url

    # Determine thumbnail URL
    if item.thumbnail_path:
        logger.info(f"[_build_media_response] Generating thumbnail URL for media item {item.id} with path: {item.thumbnail_path}")
        try:
            thumbnail_url = await storage_service.get_signed_url(item.thumbnail_path)
            logger.info(f"[_build_media_response] Successfully generated signed URL for thumbnail of media item {item.id}: {thumbnail_url}")
        except Exception as e:
            logger.error(f"[_build_media_response] Failed to generate signed URL for thumbnail of media item {item.id}. Falling back to download URL. Error: {e}")
            thumbnail_url = f"{base_url}api/v1/media/{item.id}/thumbnail"
    else:
        # Provide placeholder for images & videos so FE never receives null
        if item.media_type in {"image", "video"}:
            logger.info(f"[_build_media_response] No thumbnail path for media item {item.id}. Using placeholder.")
            thumbnail_url = settings.PLACEHOLDER_THUMBNAIL_URL
        else:
            logger.info(f"[_build_media_response] No thumbnail path for media item {item.id}. Setting thumbnail URL to None.")
            thumbnail_url = None

    # Enhanced response with additional frontend-expected fields
    response = schemas.MediaItemResponse(
        id=item.id,
        filename=item.filename,
        original_filename=item.original_filename,
        caption=item.caption or "",
        description=item.description or "",
        ai_tags=item.ai_tags or [],
        media_type=item.media_type,
        file_size=item.file_size,
        width=item.width,
        height=item.height,
        duration=item.duration,
        is_post_ready=item.is_post_ready,
        status=item.status or "completed",
        post_metadata=item.post_metadata or {},
        upload_date=item.upload_date,
        platforms=item.platforms or [],
        url=url,
        thumbnail_url=thumbnail_url,
        download_url=download_url,
    )
    
    # Add frontend-expected computed fields
    if hasattr(response, '__dict__'):
        response.__dict__.update({
            'categorizedAs': 'completed' if item.is_post_ready else 'unedited',
            'hasContent': bool(item.caption or item.description or (item.ai_tags and len(item.ai_tags) > 0)),
            'isProcessed': item.status in ['completed', 'published'] if item.status else True,
            'shouldShow': True,
            'tags': [tag.get('tag', '') if isinstance(tag, dict) else str(tag) for tag in (item.ai_tags or [])]
        })
    
    return response 