# Crow's Eye Mobile App

AI-powered social media management mobile application built with React Native.

## Features

- **Multi-Platform Posting**: Support for Instagram, Facebook, Twitter, LinkedIn, TikTok, and YouTube
- **AI Content Generation**: Smart caption and hashtag generation
- **Smart Scheduling**: Advanced scheduling with optimal posting times
- **Analytics Dashboard**: Comprehensive engagement analytics
- **Media Processing**: AI-powered media optimization for different platforms
- **Cross-Platform**: Single codebase for both iOS and Android

## Prerequisites

- Node.js (>= 18.0.0)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Physical device or emulator/simulator

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Android Setup**
   - Ensure Android Studio is installed
   - Set up Android SDK and emulator
   - Configure environment variables (ANDROID_HOME, etc.)

## Running the App

### Development Mode

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

**Start Metro Bundler:**
```bash
npm start
```

### Building for Production

**Android:**
```bash
npm run build:android
```

**iOS:**
```bash
npm run build:ios
```

## Project Structure

```
mobile-app/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   ├── context/            # React Context providers
│   ├── services/           # API services and utilities
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── assets/             # Images, fonts, etc.
├── android/                # Android-specific files
├── ios/                    # iOS-specific files
├── App.tsx                 # Root component
└── package.json
```

## Key Features

### 1. Authentication
- JWT token-based authentication
- Secure storage with Keychain (iOS) / Keystore (Android)
- Demo mode for testing without authentication

### 2. Post Management
- Create posts with media upload
- AI-powered caption generation
- Multi-platform targeting
- Draft, schedule, and publish functionality
- Post analytics and performance tracking

### 3. Scheduling
- Calendar view for scheduled posts
- Bulk scheduling operations
- Recurring post patterns
- Optimal timing suggestions

### 4. Analytics
- Engagement metrics
- Platform-specific analytics
- Performance trends
- Export capabilities

### 5. AI Features
- Smart caption generation
- Hashtag recommendations
- Content optimization
- Platform-specific formatting

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
API_BASE_URL=https://crow-eye-api-605899951231.us-central1.run.app
DEMO_MODE=true
```

### API Configuration

The app connects to the Crow's Eye backend API. Update the base URL in `src/services/api.ts` if needed.

## Dependencies

### Core Dependencies
- **React Native**: Cross-platform mobile framework
- **React Navigation**: Navigation library
- **React Query**: Data fetching and caching
- **Axios**: HTTP client for API calls
- **AsyncStorage**: Local data persistence

### UI Components
- **React Native Vector Icons**: Icon library
- **React Native Fast Image**: Optimized image component
- **React Native Linear Gradient**: Gradient backgrounds
- **React Native Modal**: Modal components

### Device Features
- **React Native Image Picker**: Camera and gallery access
- **React Native Document Picker**: File selection
- **React Native Permissions**: Runtime permissions
- **React Native Camera Roll**: Photo library access

### Development Tools
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework

## API Integration

The mobile app integrates with the Crow's Eye backend API for:

- User authentication and management
- Post creation, scheduling, and publishing
- Media upload and processing
- Analytics data retrieval
- AI content generation
- Platform integrations

See `API_REQUIREMENTS.md` for complete API documentation.

## Platform-Specific Notes

### iOS
- Requires iOS 12.0+
- Uses native navigation animations
- Supports Face ID/Touch ID for authentication
- Camera and photo library permissions required

### Android
- Requires Android API level 21+
- Uses Material Design components
- Supports fingerprint authentication
- Storage and camera permissions required

## Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run on specific platform
npm run test:ios
npm run test:android
```

## Performance Optimization

- Image caching with FastImage
- Lazy loading for large lists
- React Query for efficient data fetching
- Native navigation for smooth transitions
- Background task handling for uploads

## Security Features

- JWT token storage in secure keychain
- API request encryption
- Biometric authentication support
- Secure file upload with validation
- Input sanitization and validation

## Deployment

### Android (Google Play Store)
1. Generate signed APK/AAB
2. Upload to Google Play Console
3. Configure store listing
4. Submit for review

### iOS (App Store)
1. Build and archive in Xcode
2. Upload to App Store Connect
3. Configure app metadata
4. Submit for review

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

2. **iOS build errors**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android build errors**
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

4. **Permission errors**
   - Check device permissions in settings
   - Ensure manifest permissions are correct

### Debug Mode

Enable debug mode for detailed logging:
```bash
npm run start -- --verbose
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

Copyright © 2024 Crow's Eye Marketing Suite. All rights reserved.

## Support

For support and questions:
- Email: help@crowseye.tech
- Documentation: [API Requirements](../API_REQUIREMENTS.md)
- Issues: GitHub Issues 