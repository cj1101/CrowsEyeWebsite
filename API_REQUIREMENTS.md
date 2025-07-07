# Crow's Eye Web Application - Direct API Integration

## Overview
The Crow's Eye Web Application has been refactored to eliminate the need for a custom backend API. Instead, it now uses direct integrations with third-party services, providing better performance, reliability, and reduced technical debt.

## Architecture Change
**Previous Architecture:**
- Frontend → Crow's Eye API Backend → Third-Party APIs

**New Architecture:**
- Frontend → Direct Third-Party APIs

## Direct API Integrations

### 1. Authentication & User Management
- **Service**: Firebase Authentication
- **Features**: User registration, login, password reset, profile management
- **Configuration**: Uses Firebase Auth SDK

### 2. Media Storage & Management
- **Service**: Firebase Storage + Firestore
- **Features**: File upload, storage, metadata management, galleries
- **Configuration**: Direct Firebase SDK integration

### 3. AI Content Generation
- **Service**: Google Gemini AI
- **Features**: Caption generation, hashtag suggestions, content optimization, compliance checking
- **Configuration**: Direct Gemini API calls with `GEMINI_API_KEY`

### 4. Social Platform Integrations
- **Instagram/Facebook**: Facebook Graph API
- **TikTok**: TikTok Business API
- **LinkedIn, Twitter, Pinterest**: Direct platform APIs
- **Configuration**: Platform-specific OAuth flows

### 5. Google Services
- **Google Photos**: Google Photos Library API
- **Google My Business**: Google My Business API
- **Configuration**: Google API credentials

## Environment Variables Required

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcd1234

# AI Content Generation
GEMINI_API_KEY=your-gemini-api-key
# OR
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key

# Social Platform APIs
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret

# Google APIs
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth Configuration
NEXT_PUBLIC_OAUTH_REDIRECT_BASE_URL=https://your-domain.com
```

## Key Benefits of Direct Integration

### 1. **Reduced Technical Debt**
- Eliminates custom backend maintenance
- Reduces infrastructure complexity
- No API versioning issues

### 2. **Better Performance**
- Direct API calls reduce latency
- No intermediate API layer
- Optimized for each platform

### 3. **Improved Reliability**
- Leverages platform SLAs
- Reduces single points of failure
- Better error handling

### 4. **Cost Optimization**
- No backend hosting costs
- Pay-per-use model for AI services
- Reduced operational overhead

### 5. **Enhanced Security**
- Direct OAuth flows
- Platform-native security
- Reduced attack surface

## Service Implementations

### Firebase Auth Service (`src/services/firebase-auth.ts`)
- User registration and login
- Profile management
- Subscription tier handling
- Promo code application

### Firebase Storage Service (`src/services/firebase-storage.ts`)
- Media upload with progress tracking
- Media library management
- Gallery creation and management
- File search and organization

### Gemini AI Service (`src/services/gemini-ai.ts`)
- Caption generation
- Hashtag suggestions
- Content optimization
- Compliance checking
- Platform-specific content adaptation

### Social Platforms Service (`src/services/social-platforms.ts`)
- OAuth connection flows
- Post publishing to multiple platforms
- Scheduling management
- Platform status tracking

### Google Services API (`src/services/google-services.ts`)
- Google Photos integration
- Album and media browsing
- Media import functionality
- Google My Business integration

### Unified API Service (`src/services/unified-api.ts`)
- Centralized interface for all services
- Backward compatibility with existing frontend code
- Consistent error handling
- Type-safe API calls

## Migration Notes

### Removed Dependencies
- Custom crow's eye API backend
- Backend-specific authentication
- API proxy endpoints
- Database migrations

### Maintained Compatibility
- All existing frontend components work unchanged
- Same interface patterns
- Consistent data structures
- Preserved user experience

### New Capabilities
- Real-time AI content generation
- Direct platform integrations
- Enhanced media management
- Improved error handling

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp env.template .env.local
   # Fill in your API keys and configuration
   ```

3. **Initialize Firebase**
   ```bash
   firebase init
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Deployment

The application is now purely frontend-focused and can be deployed to:
- Firebase Hosting
- Vercel
- Netlify
- Any static hosting service

No backend deployment required!

## Support

For questions about the new architecture:
- Check service-specific documentation in `src/services/`
- Review Firebase documentation for authentication and storage
- Consult Google AI documentation for Gemini integration
- Reference platform-specific API documentation for social integrations 