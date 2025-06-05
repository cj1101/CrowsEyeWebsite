# Crow's Eye API Integration

This document outlines the comprehensive integration of the Crow's Eye API with the web application, bringing all the functionality from the Python program to the web version.

## Overview

The web application now includes full integration with the `crow_eye_api` backend, providing:

- **Smart Media Organization**: AI-powered media search and categorization
- **Gallery Generation**: Automated gallery creation based on prompts
- **Caption Generation**: AI-generated captions with customizable tones
- **Highlight Reels**: Automated video highlight compilation
- **Audio Import & Enhancement**: Professional audio processing tools
- **Story Formatting**: Multi-platform content optimization
- **Advanced Analytics**: Comprehensive performance tracking

## API Client (`src/lib/api.ts`)

The main API client provides a comprehensive interface to all backend endpoints:

### Core Features
- **Authentication**: Login, registration, and user management
- **Media Management**: Upload, list, delete media files
- **Audio Processing**: Import, edit, analyze audio files
- **Analytics**: Performance metrics, exports, insights
- **Stories**: Multi-platform content creation
- **Highlights**: Video compilation and rendering
- **Galleries**: Smart media organization
- **Admin**: System management (for admin users)

### Configuration
Set the API URL via environment variable:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Enhanced Hooks

### Media Library (`src/hooks/api/useMediaLibrary.ts`)
- Real API integration with fallback to mock data
- Upload, delete, and list media files
- Error handling and loading states

### Analytics (`src/hooks/api/useAnalytics.ts`)
- Comprehensive analytics data from API
- Export functionality (CSV, JSON)
- Insights and competitor analysis
- Configurable time periods and platforms

### Audio Import (`src/hooks/api/useAudioImport.ts`)
- Professional audio file import
- Audio enhancement and editing
- Waveform analysis
- Audio effects library

### Story Formatter (`src/hooks/api/useStoryFormatter.ts`)
- Multi-platform story creation
- Platform-specific optimization
- Tone customization
- Media integration

### Highlight Reels (`src/hooks/api/useHighlightReel.ts`)
- Automated video compilation
- Rendering job management
- Style preferences
- Duration control

### Gallery Management (`src/hooks/api/useGallery.ts`)
- Smart gallery creation
- Media organization
- Thumbnail generation
- Batch operations

### Crow's Eye Core (`src/hooks/api/useCrowsEye.ts`)
- **NEW**: Main AI functionality from Python program
- Media search with AI tagging
- Gallery generation based on prompts
- Caption generation with tone control
- Media organization and management

## Enhanced AI Tools Component

The AI Tools section now includes comprehensive functionality:

### 1. Content Generation
- Multi-platform content creation
- Tone and style customization
- Draft saving and scheduling

### 2. Crow's Eye AI ⭐ **NEW**
- **Media Search**: AI-powered search across all media types
- **Smart Selection**: Checkbox interface for media selection
- **Gallery Generation**: Prompt-based gallery creation
- **Caption Generation**: AI captions with customizable tones
- **Save & Organize**: Persistent gallery management

### 3. Smart Gallery ⭐ **NEW**
- Create organized media collections
- Auto-selection based on criteria
- Gallery management interface
- Batch operations

### 4. Highlight Reels ⭐ **NEW**
- Automated video compilation
- Rendering job tracking
- Style and duration preferences
- Professional output quality

### 5. Voice & Audio ⭐ **ENHANCED**
- Audio file import with drag-and-drop
- Professional audio enhancement
- Audio library management
- Format conversion and optimization

### 6. Hashtag Generator
- Topic-based hashtag generation
- Platform optimization
- Trending hashtag suggestions

### 7. Templates
- Pre-built content templates
- Customizable placeholders
- Platform-specific formatting

### 8. Image Enhancement
- AI-powered image optimization
- Batch processing capabilities
- Quality enhancement

### 9. AI Settings
- API key management
- Preference configuration
- Default settings

## Key Features from Python Program

All major features from the Python desktop application are now available in the web version:

### ✅ Media Organization
- **Raw Photos**: Unprocessed image files
- **Raw Videos**: Unprocessed video files  
- **Finished Posts**: Ready-to-publish content
- **AI Tagging**: Automatic content categorization

### ✅ Gallery Generation
- **Prompt-based Selection**: Natural language media selection
- **Smart Filtering**: AI-powered content matching
- **Enhancement Options**: Automatic photo enhancement
- **Batch Processing**: Multiple media items at once

### ✅ Caption Generation
- **Tone Control**: Professional, casual, creative, promotional
- **Platform Optimization**: Platform-specific formatting
- **Context Awareness**: Media-aware caption generation
- **Multi-language Support**: Ready for internationalization

### ✅ Audio Processing
- **Import & Enhancement**: Professional audio processing
- **Format Support**: MP3, WAV, FLAC, AAC, OGG
- **Audio Effects**: Reverb, EQ, normalization
- **Waveform Analysis**: Visual audio representation

### ✅ Analytics & Insights
- **Performance Tracking**: Engagement metrics
- **Export Capabilities**: CSV, JSON, Excel formats
- **Competitor Analysis**: Market insights
- **Growth Metrics**: Trend analysis

### ✅ Story Formatting
- **Multi-platform**: Instagram, Facebook, Twitter, LinkedIn
- **Optimization**: Platform-specific formatting
- **Media Integration**: Rich media support
- **Scheduling**: Future publication planning

## Error Handling & Fallbacks

The integration includes comprehensive error handling:

1. **API Failures**: Graceful fallback to mock data
2. **Network Issues**: Retry mechanisms and user feedback
3. **Authentication**: Automatic token refresh
4. **Loading States**: User-friendly loading indicators
5. **Error Messages**: Clear, actionable error descriptions

## Performance Optimizations

- **Parallel Requests**: Multiple API calls executed simultaneously
- **Caching**: Intelligent data caching strategies
- **Lazy Loading**: Components loaded on demand
- **Debounced Search**: Optimized search performance
- **Pagination**: Efficient data loading

## Security Features

- **Token-based Authentication**: Secure API access
- **CORS Configuration**: Proper cross-origin setup
- **Input Validation**: Client-side validation
- **Error Sanitization**: Safe error message display

## Development Setup

1. **Start the API Server**:
   ```bash
   cd ../breadsmith_marketing/social_media_tool_v5_noMeta_final
   python -m crow_eye_api.main
   ```

2. **Configure Environment**:
   ```bash
   export NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Start Web Application**:
   ```bash
   npm run dev
   ```

## Production Deployment

For production deployment:

1. **Set Production API URL**:
   ```bash
   NEXT_PUBLIC_API_URL=https://api.crowseye.tech
   ```

2. **Build Application**:
   ```bash
   npm run build
   ```

3. **Deploy Static Files**:
   ```bash
   npm run export
   ```

## API Endpoints Used

The web application integrates with these API endpoints:

- `GET /health` - Health check
- `POST /auth/login` - User authentication
- `GET /auth/me` - Current user info
- `GET /media/` - List media files
- `POST /media/` - Upload media
- `DELETE /media/{id}` - Delete media
- `GET /audio/` - List audio files
- `POST /audio/import` - Import audio
- `POST /audio/edit` - Edit audio
- `GET /analytics/` - Get analytics
- `POST /analytics/export` - Export data
- `GET /stories/` - List stories
- `POST /stories/` - Create story
- `GET /highlights/` - List highlight reels
- `POST /highlights/` - Create highlight reel
- `GET /gallery/` - List galleries
- `POST /gallery/` - Create gallery

## Future Enhancements

Planned improvements:

1. **Real-time Updates**: WebSocket integration
2. **Offline Support**: Progressive Web App features
3. **Advanced AI**: More sophisticated AI models
4. **Collaboration**: Multi-user editing
5. **Mobile App**: React Native version
6. **Integrations**: Third-party platform connections

## Troubleshooting

Common issues and solutions:

### API Connection Issues
- Verify API server is running
- Check CORS configuration
- Validate API URL environment variable

### Authentication Problems
- Clear browser storage
- Check token expiration
- Verify API credentials

### Performance Issues
- Monitor network requests
- Check for memory leaks
- Optimize image sizes

### Feature Not Working
- Check browser console for errors
- Verify API endpoint availability
- Test with mock data fallback

## Support

For technical support:
- Check the browser console for errors
- Review API server logs
- Test individual API endpoints
- Verify environment configuration

The web application now provides feature parity with the Python desktop application while offering the convenience and accessibility of a web-based interface. 