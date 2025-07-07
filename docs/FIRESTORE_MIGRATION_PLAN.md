# Firestore Migration Plan: SQLite to Google Cloud Firestore

## Overview
This document outlines the complete migration plan for transitioning Crow's Eye from SQLite to Google Cloud Firestore, eliminating the need for a separate API backend for data storage.

## Current Architecture
- **Backend**: FastAPI with SQLite database
- **Frontend**: Next.js with Firebase Auth
- **Storage**: Local SQLite file (crow_eye_local.db)

## Target Architecture
- **Backend**: Minimal FastAPI for AI services only
- **Frontend**: Next.js with direct Firestore integration
- **Database**: Google Cloud Firestore
- **Storage**: Firestore for all data + Cloud Storage for media files

## Data Models to Migrate

### 1. Users Collection
```
users/{userId}
├── email: string
├── username: string
├── fullName: string
├── isActive: boolean
├── subscriptionTier: string
├── createdAt: timestamp
├── updatedAt: timestamp
└── passwordHash: string (encrypted)
```

### 2. Media Items Collection
```
media/{mediaId}
├── userId: string (reference)
├── filename: string
├── originalFilename: string
├── gcsPath: string
├── thumbnailPath: string
├── mediaType: string
├── fileSize: number
├── width: number
├── height: number
├── duration: number
├── caption: string
├── description: string
├── aiTags: array
├── isPostReady: boolean
├── status: string
├── postMetadata: map
├── platforms: array
├── googlePhotosId: string
├── googlePhotosMetadata: map
├── importSource: string
├── importDate: timestamp
├── uploadDate: timestamp
└── updatedDate: timestamp
```

### 3. Galleries Collection
```
galleries/{galleryId}
├── userId: string (reference)
├── name: string
├── caption: string
├── mediaIds: array (references)
├── createdDate: timestamp
└── updatedDate: timestamp
```

### 4. Posts Collection
```
posts/{postId}
├── userId: string (reference)
├── title: string
├── content: string
├── imagePath: string
├── videoPath: string
├── description: string
├── tags: array
├── platforms: array
├── status: string
├── createdAt: timestamp
├── updatedAt: timestamp
└── publishedAt: timestamp
```

### 5. Finished Content Collection
```
finishedContent/{contentId}
├── userId: string (reference)
├── title: string
├── contentType: string
├── filePath: string
├── caption: string
├── hashtags: array
├── targetPlatforms: array
├── metadata: map
├── createdAt: timestamp
├── expiresAt: timestamp
├── isPublished: boolean
└── publishDate: timestamp
```

### 6. Schedules Collection
```
schedules/{scheduleId}
├── userId: string (reference)
├── postId: string (reference)
├── scheduledTime: timestamp
├── platforms: array
├── status: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

### 7. Templates Collection
```
templates/{templateId}
├── userId: string (reference)
├── name: string
├── content: string
├── platforms: array
├── metadata: map
├── createdAt: timestamp
└── updatedAt: timestamp
```

### 8. Analytics Collection
```
analytics/{analyticsId}
├── userId: string (reference)
├── postId: string (reference)
├── platform: string
├── metrics: map
├── recordedAt: timestamp
└── period: string
```

### 9. Google Photos Connections
```
googlePhotosConnections/{connectionId}
├── userId: string (reference)
├── googleUserId: string
├── googleEmail: string
├── connectionDate: timestamp
├── lastSyncDate: timestamp
├── isActive: boolean
└── tokenData: map (encrypted)
```

## Migration Steps

### Phase 1: Setup Firestore Structure
1. Create Firestore collections
2. Set up security rules
3. Create composite indexes
4. Set up Cloud Storage buckets

### Phase 2: Create Firestore Services
1. User management service
2. Media management service
3. Post management service
4. Gallery management service
5. Analytics service

### Phase 3: Update Frontend
1. Replace API calls with Firestore queries
2. Update authentication flow
3. Implement real-time listeners
4. Update media upload to use Cloud Storage

### Phase 4: Data Migration
1. Export SQLite data
2. Transform data to Firestore format
3. Import to Firestore
4. Verify data integrity

### Phase 5: Backend Simplification
1. Remove database-related endpoints
2. Keep only AI service endpoints
3. Update deployment configuration
4. Remove SQLAlchemy dependencies

## Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Media items belong to users
    match /media/{mediaId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Similar rules for other collections...
  }
}
```

## Benefits
1. **No API needed** for data operations
2. **Real-time updates** across all clients
3. **Automatic scaling** with Google Cloud
4. **Built-in offline support**
5. **Simplified architecture**
6. **Better performance** with direct database access
7. **Cost optimization** with pay-per-use model

## Timeline
- Phase 1: 1 day
- Phase 2: 2-3 days
- Phase 3: 2-3 days
- Phase 4: 1 day
- Phase 5: 1 day

Total: ~1 week for complete migration 