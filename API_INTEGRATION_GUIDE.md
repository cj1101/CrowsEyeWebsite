# API Integration Guide - Crow's Eye Website

This document outlines the API integration between the frontend web application and the Python backend, ensuring seamless communication and functionality.

## Base Configuration

### Backend URLs
- **Development**: `http://localhost:8000`
- **Production**: `https://firebasestorage.googleapis.com`

### Authentication
- Bearer token authentication via `Authorization: Bearer <token>` header
- Token stored in localStorage as `authToken`
- 401 responses redirect to sign-in page

## API Endpoints Overview

### Health Checks
- `GET /health` - Basic health check
- `GET /api/v1/health` - API health check
- `GET /ping` - Backend responsiveness check
- `GET /api/v1/version` - API version information

## AI Content Generation Endpoints

### 1. AI Caption Generation
```typescript
POST /api/v1/ai/captions/generate

Request:
{
  content: string;
  platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube';
  style: 'engaging' | 'professional' | 'casual' | 'funny';
  max_length?: number;
}

Response:
{
  captions: string[];
  metadata: {
    platform: string;
    style: string;
    generated_at: string;
  };
}
```

### 2. AI Hashtag Generation
```typescript
POST /api/v1/ai/hashtags/generate

Request:
{
  content: string;
  count?: number;
  platform?: string;
}

Response:
{
  hashtags: string[];
  relevance_scores: number[];
  trending_score: number;
}
```

### 3. AI Content Ideas
```typescript
POST /api/v1/ai/content/ideas

Request:
{
  topic?: string;
  platform?: string;
  content_type?: string;
  count?: number;
}

Response:
{
  ideas: Array<{
    title: string;
    description: string;
    category: string;
    engagement_potential: number;
  }>;
}
```

### 4. Imagen 3 Image Generation
```typescript
POST /api/v1/ai/images/generate

Request:
{
  prompt: string;
  style: 'photorealistic' | 'artistic' | 'cartoon';
  aspect_ratio: '1:1' | '16:9' | '4:5';
  quality: 'standard' | 'hd';
}

Response:
{
  images: Array<{
    url: string;
    filename: string;
    metadata: {
      style: string;
      aspect_ratio: string;
      quality: string;
      generation_time: number;
    };
  }>;
  job_id: string;
}
```

### 5. Veo Video Generation
```typescript
POST /api/v1/ai/videos/generate

Request:
{
  prompt: string;
  duration?: number;
  style?: string;
  aspect_ratio?: string;
}

Response:
{
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimated_completion: string;
  video_url?: string;
}
```

### 6. Highlight Reel Generation
```typescript
POST /api/v1/ai/highlights/generate

Request:
{
  media_ids: number[];
  highlight_type: string;
  duration: number;
  style: string;
  include_text: boolean;
  include_music: boolean;
}

Response:
{
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimated_completion: string;
  highlight_url?: string;
  clips_info?: Array<{
    media_id: number;
    start_time: number;
    end_time: number;
    clip_url: string;
  }>;
}
```

## Media Processing Endpoints

### 1. Media Upload
```typescript
POST /api/v1/media/upload
Content-Type: multipart/form-data

Files in FormData format with progress tracking support
```

### 2. Get Media
```typescript
GET /api/v1/media/{media_id}

Response: MediaFile object with metadata
```

### 3. Video Processing
```typescript
POST /api/v1/media/video/process

Request:
{
  video_url: string;
  operations: Array<{
    type: 'trim' | 'resize' | 'add_captions' | 'compress' | 'extract_audio' | 'add_effects';
    [key: string]: any;
  }>;
  output_format: 'mp4' | 'webm' | 'mov';
}

Response:
{
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  processed_video_url?: string;
  operations_applied: string[];
}
```

### 4. Thumbnail Generation
```typescript
POST /api/v1/media/thumbnails/generate

Request:
{
  media_id: string;
  timestamp?: number;
  count?: number;
}

Response:
{
  thumbnails: Array<{
    url: string;
    timestamp: number;
    filename: string;
  }>;
}
```

## Analytics & Performance Endpoints

### 1. Performance Analytics
```typescript
GET /api/v1/analytics/performance
GET /api/v1/analytics/performance/{platform}

Response:
{
  platform_stats: Array<{
    platform: string;
    total_posts: number;
    total_engagement: number;
    avg_engagement_rate: number;
    top_performing_posts: Array<{
      post_id: string;
      engagement_score: number;
      reach: number;
    }>;
  }>;
  overall_stats: {
    total_posts: number;
    total_engagement: number;
    avg_engagement_rate: number;
    growth_rate: number;
  };
  time_period: {
    start_date: string;
    end_date: string;
  };
}
```

### 2. Track Analytics
```typescript
POST /api/v1/analytics/track

Request:
{
  event_type: string;
  platform: string;
  media_id?: string;
  post_id?: string;
  metrics: Record<string, any>;
}
```

## Bulk Operations Endpoints

### 1. Bulk Upload
```typescript
POST /api/v1/bulk/upload
Content-Type: multipart/form-data

Request includes:
- files: File[]
- batch_id?: string
- metadata?: Record<string, any>

Response:
{
  batch_id: string;
  uploaded_files: Array<{
    filename: string;
    media_id: string;
    status: 'success' | 'failed';
    error_message?: string;
  }>;
  total_files: number;
  successful_uploads: number;
  failed_uploads: number;
}
```

### 2. Bulk Schedule
```typescript
POST /api/v1/bulk/schedule

Request:
{
  posts: Array<{
    content: string;
    platform: string;
    scheduled_time: string;
    media_ids?: string[];
  }>;
}

Response:
{
  batch_id: string;
  scheduled_posts: Array<{
    post_id: string;
    platform: string;
    scheduled_time: string;
    status: 'scheduled' | 'failed';
    error_message?: string;
  }>;
  total_posts: number;
  successful_schedules: number;
  failed_schedules: number;
}
```

### 3. Bulk Job Status
```typescript
GET /api/v1/bulk/status/{job_id}

Response:
{
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  total_items: number;
  completed_items: number;
  failed_items: number;
  estimated_completion: string;
  results?: Array<{
    item_id: string;
    status: 'success' | 'failed';
    result_data?: any;
    error_message?: string;
  }>;
}
```

## Platform Previews Endpoints

### 1. Generate Previews
```typescript
POST /api/v1/previews/generate

Request:
{
  content: string;
  media_ids?: string[];
  platforms: string[];
}

Response:
{
  preview_id: string;
  previews: Array<{
    platform: string;
    preview_url: string;
    dimensions: {
      width: number;
      height: number;
    };
    format: string;
  }>;
  expires_at: string;
}
```

### 2. Get Preview
```typescript
GET /api/v1/previews/{preview_id}

Response:
{
  preview_id: string;
  platform: string;
  preview_url: string;
  content: string;
  media_urls: string[];
  created_at: string;
  expires_at: string;
}
```

## Frontend Integration

### API Service Location
- Main API service: `src/services/api.ts`
- Type definitions: `src/types/api.ts`
- Custom hooks: `src/hooks/api/`

### Key Hooks Available
- `useAI()` - AI content generation operations
- `useMediaProcessing()` - Media upload and processing
- `useMediaLibrary()` - Media library management

### Error Handling
- All API calls include proper error handling
- Errors are surfaced to UI components
- Network timeouts set to 30 seconds
- Automatic retry logic can be implemented

### Authentication Flow
1. User authentication sets token in localStorage
2. All API calls include Bearer token in header
3. 401 responses automatically redirect to sign-in
4. Token refreshing can be implemented as needed

## Testing Endpoints

### Development Testing
```bash
# Test health endpoints
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/health

# Test with authentication
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/media
```

### Frontend Testing
The frontend includes comprehensive error handling and loading states for all API interactions. Each component that uses the API service includes:

- Loading indicators during API calls
- Error message display
- Retry mechanisms where appropriate
- Progress indicators for long-running operations

## Backend Implementation Notes

### Required Response Headers
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### File Upload Handling
- Support for multipart/form-data
- Progress tracking via content-length
- Multiple file uploads in single request
- Proper error handling for file size limits

### Async Operations
- Long-running operations (video processing, AI generation) should return job IDs
- Status endpoint should provide progress updates
- WebSocket connections can be added for real-time updates

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

This integration guide ensures seamless communication between the Crow's Eye frontend and Python backend systems. 