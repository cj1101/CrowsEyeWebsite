# Crow's Eye API Integration

This document outlines the complete API integration for the Crow's Eye website, connecting the React/Next.js frontend to the FastAPI backend.

## 🚀 Quick Setup

### 1. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```bash
# Crow's Eye API Configuration
NEXT_PUBLIC_API_URL=https://api.crowseye.tech

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration (Updated for new pricing)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Stripe Price IDs for new pricing structure
STRIPE_CREATOR_PRICE_ID=price_your_creator_price_id
STRIPE_CREATOR_BYOK_PRICE_ID=price_your_creator_byok_price_id
STRIPE_PRO_PRICE_ID=price_your_pro_price_id
STRIPE_PRO_BYOK_PRICE_ID=price_your_pro_byok_price_id

# Usage Tracking
USAGE_TRACKING_API_KEY=your_usage_tracking_api_key

# Development
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Generate API Types

```bash
npm run gen:api
```

### 4. Run Development Server

```bash
npm run dev
```

## 📋 Pricing Tiers

The application now supports the following pricing tiers:

- **Free** ($0/mo): Basic library, galleries, stories
- **Creator** ($9/mo): Everything in Free + highlight video, audio import
- **Pro** ($19/mo): Everything in Creator + analytics export, bulk reports
- **Enterprise** (Custom pricing): Multi-account, priority support, BYO-key discount

## 🏗️ Architecture

### API Layer (`src/lib/api.ts`)

- **`apiFetch`**: Core fetch wrapper with authentication
- **`useApiSWR`**: Custom SWR hook for API integration
- **Token management**: Handles JWT tokens and httpOnly cookies

### Authentication (`src/contexts/AuthContext.tsx`)

- **Dual authentication**: Supports both Firebase and API-based auth
- **Token management**: Automatic token refresh and storage
- **User profiles**: Integrated with subscription tiers

### API Hooks (`src/hooks/api/`)

- **`useMediaLibrary`**: Media upload, delete, and listing
- **`useGallery`**: AI-powered gallery generation
- **`useStoryFormatter`**: Story formatting from media
- **`useHighlightReel`**: Video highlight generation (Creator+)
- **`useAudioImport`**: Audio file import (Creator+)
- **`useAnalytics`**: Analytics data and CSV export (Pro+)

### Dashboard Components (`src/components/dashboard/`)

- **Feature gating**: Plan-based access control
- **Responsive design**: Mobile-first approach
- **Real-time updates**: SWR-powered data fetching

## 🔐 Authentication Flow

1. User logs in via API (`POST /auth/login`)
2. JWT token stored in httpOnly cookie (`ce_token`)
3. Token automatically included in API requests
4. Automatic logout on token expiration

## 🎯 Feature Access Control

Features are gated based on subscription tiers:

```typescript
// Example: Check if user can access highlights
const features = getSubscriptionFeatures(userTier);
if (features.highlightVideo) {
  // Show highlight reel generator
} else {
  // Show upgrade prompt
}
```

## 📊 Dashboard Features

### Library Tab (Free+)
- Upload media files (images, videos, audio)
- View media library with thumbnails
- Delete media files
- File size and type information

### Galleries Tab (Free+)
- Generate AI-curated galleries from prompts
- View gallery status (processing/completed/failed)
- Browse generated media collections

### Stories Tab (Free+)
- Format stories from media files and captions
- AI-powered content generation
- View formatted story content

### Highlights Tab (Creator+)
- Generate video highlight reels
- Configurable duration and style options
- Download generated highlights
- Audio inclusion toggle

### Analytics Tab (Pro+)
- View comprehensive analytics dashboard
- Storage usage tracking
- Export data to CSV
- Real-time metrics

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Test Coverage
- API hooks with mocked fetch calls
- Component rendering and interactions
- Feature gating logic

## 🚀 Deployment

### Build
```bash
npm run build
```

### Type Generation
```bash
npm run gen:api
```

### CI/CD Pipeline
The GitHub Actions workflow includes:
1. Install dependencies
2. Generate API types
3. Run tests
4. Build application
5. Deploy to Firebase/Vercel

## 📝 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh

### Media Management
- `GET /media` - List media files
- `POST /media/upload` - Upload media file
- `DELETE /media/{id}` - Delete media file

### AI Features
- `POST /gallery` - Generate gallery from prompt
- `POST /stories` - Format story from file and caption
- `POST /highlights` - Generate highlight reel (Creator+)
- `POST /audio/import` - Import audio file (Creator+)

### Analytics
- `GET /analytics` - Get analytics data (Pro+)
- `GET /analytics/export` - Export analytics CSV (Pro+)

## 🔧 Development

### File Structure
```
src/
├── lib/
│   ├── api.ts              # Core API functions
│   ├── subscription.ts     # Subscription management
│   └── stripe.ts          # Stripe integration
├── hooks/api/             # API hooks
├── components/dashboard/  # Dashboard components
├── contexts/             # React contexts
├── types/               # TypeScript types
└── app/(dashboard)/     # Dashboard pages
```

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Tailwind CSS for styling

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Verify API server is running
   - Check network connectivity

2. **Authentication Errors**
   - Verify JWT token is valid
   - Check cookie settings
   - Ensure API endpoints are correct

3. **Feature Access Denied**
   - Verify user subscription tier
   - Check feature gating logic
   - Ensure subscription is active

4. **Type Generation Fails**
   - Check API server OpenAPI endpoint
   - Verify network access to API
   - Run `npm run gen:api` manually

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [SWR Documentation](https://swr.vercel.app/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe Documentation](https://stripe.com/docs) 