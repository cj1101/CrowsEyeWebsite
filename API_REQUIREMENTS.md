# Crow's Eye Web Application - API Requirements

## Overview
This document outlines the API endpoints required to support the full functionality of the Crow's Eye Web Application, including post management, scheduling, and all features currently available in the desktop application.

## Base Configuration
- **Base URL**: `https://crow-eye-api-605899951231.us-central1.run.app`
- **Authentication**: JWT tokens or API keys
- **Content-Type**: `application/json`
- **Supported Platforms**: Instagram, Facebook, BlueSky, Snapchat, Pinterest, TikTok, YouTube

## 1. Post Management Endpoints

### 1.1 Create Post
```
POST /api/posts
```

**Request Body:**
```json
{
  "mediaId": "string",
  "caption": "string",
  "platforms": ["instagram", "facebook", "bluesky"],
  "customInstructions": "string (optional)",
  "formatting": {
    "verticalOptimization": "boolean",
    "captionOverlay": "boolean",
    "overlayPosition": "top|center|bottom",
    "overlayFontSize": "small|medium|large",
    "aspectRatio": "original|1:1|4:5|16:9|9:16"
  },
  "contextFiles": ["string array of file IDs"],
  "scheduledTime": "ISO 8601 datetime (optional)",
  "isRecurring": "boolean",
  "recurringPattern": "daily|weekly|monthly",
  "recurringEndDate": "ISO 8601 datetime (optional)"
}
```

**Response:**
```json
{
  "id": "string",
  "status": "draft|scheduled|published|failed",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime",
  "scheduledTime": "ISO 8601 datetime (if scheduled)",
  "mediaUrl": "string",
  "mediaType": "image|video|audio"
}
```

### 1.2 Get Posts
```
GET /api/posts?status=draft&platform=instagram&limit=20&offset=0
```

**Response:**
```json
{
  "posts": [
    {
      "id": "string",
      "mediaId": "string",
      "caption": "string",
      "platforms": ["string array"],
      "status": "draft|scheduled|published|failed",
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime",
      "scheduledTime": "ISO 8601 datetime (optional)",
      "publishedTime": "ISO 8601 datetime (optional)",
      "mediaType": "image|video|audio",
      "mediaUrl": "string",
      "isRecurring": "boolean",
      "recurringPattern": "daily|weekly|monthly (optional)",
      "customInstructions": "string (optional)",
      "formatting": "object (optional)",
      "contextFiles": ["string array"],
      "analytics": {
        "views": "number",
        "likes": "number",
        "comments": "number",
        "shares": "number",
        "engagementRate": "number"
      }
    }
  ],
  "total": "number",
  "hasMore": "boolean"
}
```

### 1.3 Update Post
```
PUT /api/posts/{postId}
```

**Request Body:** Same as Create Post

### 1.4 Delete Post
```
DELETE /api/posts/{postId}
```

### 1.5 Duplicate Post
```
POST /api/posts/{postId}/duplicate
```

### 1.6 Publish Post Now
```
POST /api/posts/{postId}/publish
```

## 2. Scheduling Endpoints

### 2.1 Create Schedule
```
POST /api/schedules
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "startDate": "ISO 8601 date",
  "endDate": "ISO 8601 date",
  "postsPerDay": "number",
  "platforms": ["string array"],
  "postingTimes": ["HH:MM array"],
  "isActive": "boolean",
  "contentSources": {
    "mediaLibrary": "boolean",
    "aiGenerated": "boolean",
    "templates": ["string array of template IDs"]
  },
  "rules": {
    "skipWeekends": "boolean",
    "skipHolidays": "boolean",
    "minimumInterval": "number (minutes)"
  }
}
```

### 2.2 Get Schedules
```
GET /api/schedules?active=true
```

### 2.3 Update Schedule
```
PUT /api/schedules/{scheduleId}
```

### 2.4 Delete Schedule
```
DELETE /api/schedules/{scheduleId}
```

### 2.5 Toggle Schedule Status
```
POST /api/schedules/{scheduleId}/toggle
```

### 2.6 Get Scheduled Posts Calendar
```
GET /api/schedules/calendar?start=2024-01-01&end=2024-01-31
```

**Response:**
```json
{
  "events": [
    {
      "date": "ISO 8601 date",
      "posts": [
        {
          "id": "string",
          "time": "HH:MM",
          "caption": "string",
          "platforms": ["string array"],
          "status": "scheduled|published|failed"
        }
      ]
    }
  ]
}
```

## 3. Media Processing Endpoints

### 3.1 Process Media with Instructions
```
POST /api/media/{mediaId}/process
```

**Request Body:**
```json
{
  "instructions": "string (natural language)",
  "outputFormat": "image|video",
  "platforms": ["string array"],
  "formatting": {
    "verticalOptimization": "boolean",
    "captionOverlay": "boolean",
    "overlayText": "string",
    "overlayPosition": "top|center|bottom",
    "overlayFontSize": "small|medium|large",
    "aspectRatio": "original|1:1|4:5|16:9|9:16"
  }
}
```

### 3.2 Generate Platform-Optimized Versions
```
POST /api/media/{mediaId}/optimize
```

**Request Body:**
```json
{
  "platforms": ["string array"],
  "variations": {
    "aspectRatios": ["1:1", "4:5", "16:9"],
    "sizes": ["thumbnail", "standard", "high-res"]
  }
}
```

## 4. AI Content Generation Endpoints

### 4.1 Generate Caption
```
POST /api/ai/caption
```

**Request Body:**
```json
{
  "mediaId": "string (optional)",
  "platforms": ["string array"],
  "tone": "professional|casual|friendly|formal|humorous|inspiring",
  "customInstructions": "string",
  "contextFiles": ["string array"],
  "includeHashtags": "boolean",
  "maxLength": "number (platform-specific)"
}
```

### 4.2 Generate Hashtags
```
POST /api/ai/hashtags
```

**Request Body:**
```json
{
  "content": "string",
  "platforms": ["string array"],
  "niche": "string",
  "count": "number"
}
```

### 4.3 Content Suggestions
```
POST /api/ai/suggestions
```

**Request Body:**
```json
{
  "mediaId": "string",
  "platforms": ["string array"],
  "contentType": "caption|story|description",
  "variations": "number"
}
```

## 5. Analytics Endpoints

### 5.1 Get Post Analytics
```
GET /api/analytics/posts/{postId}
```

### 5.2 Get Platform Analytics
```
GET /api/analytics/platforms?start=2024-01-01&end=2024-01-31
```

**Response:**
```json
{
  "platforms": [
    {
      "platform": "instagram",
      "posts": "number",
      "totalViews": "number",
      "totalLikes": "number",
      "totalComments": "number",
      "totalShares": "number",
      "engagementRate": "number",
      "topPerformingPost": {
        "id": "string",
        "caption": "string",
        "metrics": "object"
      }
    }
  ],
  "summary": {
    "totalPosts": "number",
    "totalEngagement": "number",
    "averageEngagementRate": "number",
    "bestPerformingPlatform": "string"
  }
}
```

### 5.3 Get Engagement Trends
```
GET /api/analytics/trends?period=7d&platform=instagram
```

## 6. Context Files Management

### 6.1 Upload Context File
```
POST /api/context-files
```

**Request Body:** Multipart form data with file

### 6.2 Get Context Files
```
GET /api/context-files
```

### 6.3 Delete Context File
```
DELETE /api/context-files/{fileId}
```

## 7. Platform Integration Endpoints

### 7.1 Connect Platform Account
```
POST /api/platforms/{platform}/connect
```

**Request Body:**
```json
{
  "accessToken": "string",
  "refreshToken": "string (optional)",
  "accountId": "string",
  "accountName": "string"
}
```

### 7.2 Get Connected Platforms
```
GET /api/platforms/connected
```

### 7.3 Disconnect Platform
```
DELETE /api/platforms/{platform}/disconnect
```

### 7.4 Validate Platform Connection
```
GET /api/platforms/{platform}/validate
```

## 8. Template Management

### 8.1 Create Template
```
POST /api/templates
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "platforms": ["string array"],
  "template": {
    "captionTemplate": "string with variables",
    "hashtagTemplate": "string",
    "formatting": "object"
  },
  "variables": [
    {
      "name": "string",
      "type": "text|number|date|select",
      "required": "boolean",
      "options": ["array for select type"]
    }
  ]
}
```

### 8.2 Get Templates
```
GET /api/templates?category=social&platform=instagram
```

### 8.3 Apply Template
```
POST /api/templates/{templateId}/apply
```

**Request Body:**
```json
{
  "variables": {
    "variableName": "value"
  },
  "mediaId": "string"
}
```

## 9. Bulk Operations

### 9.1 Bulk Schedule Posts
```
POST /api/posts/bulk-schedule
```

**Request Body:**
```json
{
  "posts": [
    {
      "mediaId": "string",
      "caption": "string",
      "platforms": ["string array"],
      "scheduledTime": "ISO 8601 datetime"
    }
  ],
  "scheduleSettings": {
    "distributeEvenly": "boolean",
    "timeRange": {
      "start": "HH:MM",
      "end": "HH:MM"
    },
    "skipWeekends": "boolean"
  }
}
```

### 9.2 Bulk Update Posts
```
PUT /api/posts/bulk-update
```

### 9.3 Bulk Delete Posts
```
DELETE /api/posts/bulk-delete
```

**Request Body:**
```json
{
  "postIds": ["string array"]
}
```

## 10. Webhook Endpoints (for real-time updates)

### 10.1 Post Status Updates
```
POST /api/webhooks/post-status
```

### 10.2 Platform Notifications
```
POST /api/webhooks/platform-notifications
```

## Error Handling

All endpoints should return appropriate HTTP status codes and error messages:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

## Rate Limiting

- Implement rate limiting per user/API key
- Return rate limit headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Authentication

Support both JWT tokens and API keys:

```
Authorization: Bearer <jwt_token>
```
or
```
X-API-Key: <api_key>
```

## Demo Mode

When no valid authentication is provided, return mock data for demonstration purposes. Include a header to indicate demo mode:

```
X-Demo-Mode: true
```

## Platform-Specific Considerations

### Instagram
- Support for Posts, Stories, Reels
- Image and video optimization
- Hashtag recommendations
- Story templates

### Facebook
- Page posting
- Event creation
- Group posting (if permissions allow)
- Link previews

### BlueSky
- AT Protocol integration
- Custom feeds
- Thread creation
- Decentralized identity

### Snapchat
- Snap creation
- Story posting
- Spotlight content
- AR lens integration

### Pinterest
- Pin creation
- Board management
- Story Pins
- Shopping integration

### TikTok
- Video posting
- Trend analysis
- Hashtag challenges
- Music integration

### YouTube
- Video uploads
- Shorts creation
- Community posts
- Premiere scheduling

This API specification provides the foundation for implementing all desktop application features in the web platform, ensuring feature parity and seamless user experience across both platforms. 