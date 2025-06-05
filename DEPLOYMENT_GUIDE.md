# 🚀 Crow's Eye Marketing Suite - Deployment Guide

This guide covers all deployment options for the Crow's Eye Marketing Suite, including web application, API backend, and desktop applications.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Web Application Deployment](#web-application-deployment)
- [API Backend Deployment](#api-backend-deployment)
- [Desktop Application Distribution](#desktop-application-distribution)
- [Database Setup](#database-setup)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Required Accounts
- **Firebase**: For authentication, database, and hosting
- **Stripe**: For payment processing
- **Vercel/Netlify**: For web hosting (alternative to Firebase)
- **Railway/Heroku**: For API hosting
- **GitHub**: For repository and CI/CD

### Required Tools
- Node.js 20.x or higher
- Python 3.11+
- Firebase CLI
- Git

## 🌍 Environment Configuration

### 1. Firebase Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init

# Select the following services:
# - Hosting
# - Firestore
# - Authentication
# - Functions (optional)
```

### 2. Environment Variables

Create `.env.local` for development and configure production environment variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# API Configuration
NEXT_PUBLIC_API_URL=https://api.crowseye.tech
API_SECRET_KEY=your_production_secret_key

# AI API Keys (Optional - for BYOK)
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AI...
ANTHROPIC_API_KEY=sk-ant-...

# Social Media API Keys
INSTAGRAM_CLIENT_ID=your_client_id
FACEBOOK_APP_ID=your_app_id
TWITTER_API_KEY=your_api_key
LINKEDIN_CLIENT_ID=your_client_id
```

## 🌐 Web Application Deployment

### Option 1: Firebase Hosting (Recommended)

```bash
# Build the application
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Deploy with custom domain
firebase hosting:channel:deploy production --expires 30d
```

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
# Add all required environment variables
```

### Option 3: Netlify

```bash
# Build the application
npm run build

# Deploy to Netlify
# Upload the 'out' directory to Netlify
# Or connect GitHub repository for automatic deployments
```

### Custom Domain Setup

1. **Firebase Hosting**:
   ```bash
   firebase hosting:channel:deploy production
   # Follow Firebase console instructions for custom domain
   ```

2. **DNS Configuration**:
   ```
   Type: CNAME
   Name: www
   Value: your-project.web.app
   
   Type: A
   Name: @
   Value: Firebase hosting IP addresses
   ```

## 🔧 API Backend Deployment

### Option 1: Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy API
cd crow_eye_api
railway up
```

### Option 2: Heroku

```bash
# Install Heroku CLI
# Create Heroku app
heroku create crowseye-api

# Set environment variables
heroku config:set DATABASE_URL=your_database_url
heroku config:set SECRET_KEY=your_secret_key

# Deploy
git subtree push --prefix=crow_eye_api heroku main
```

### Option 3: Google Cloud Run

```bash
# Build and deploy
cd crow_eye_api
gcloud run deploy crowseye-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Option 4: Docker Deployment

```bash
# Build Docker image
cd crow_eye_api
docker build -t crowseye-api .

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL=your_database_url \
  -e SECRET_KEY=your_secret_key \
  crowseye-api
```

## 🖥️ Desktop Application Distribution

### Building Desktop Applications

```bash
# Install build dependencies
pip install pyinstaller

# Build for current platform
python scripts/build_desktop_apps.py

# Build for specific platform
python scripts/build_desktop_apps.py --platform windows
python scripts/build_desktop_apps.py --platform macos
python scripts/build_desktop_apps.py --platform linux
```

### Distribution Options

1. **GitHub Releases**:
   ```bash
   # Create release with built executables
   gh release create v1.0.0 \
     dist/CrowsEye-Windows.exe \
     dist/CrowsEye-macOS.dmg \
     dist/CrowsEye-Linux.AppImage
   ```

2. **Website Download**:
   - Upload built executables to your hosting provider
   - Update download links in the web application

3. **Package Managers**:
   - **Windows**: Microsoft Store, Chocolatey
   - **macOS**: Mac App Store, Homebrew
   - **Linux**: Snap Store, AppImage

## 🗄️ Database Setup

### Firebase Firestore

1. **Initialize Firestore**:
   ```bash
   firebase firestore:rules
   # Configure security rules
   ```

2. **Security Rules**:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /posts/{postId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### PostgreSQL (for API)

1. **Production Database**:
   ```bash
   # Railway PostgreSQL
   railway add postgresql
   
   # Or use external provider
   # Supabase, PlanetScale, etc.
   ```

2. **Database Migration**:
   ```bash
   cd crow_eye_api
   alembic upgrade head
   ```

## 📊 Monitoring and Maintenance

### Application Monitoring

1. **Firebase Analytics**:
   ```javascript
   // Add to your Next.js app
   import { analytics } from './lib/firebase';
   import { logEvent } from 'firebase/analytics';
   
   logEvent(analytics, 'page_view');
   ```

2. **Error Tracking**:
   ```bash
   # Install Sentry
   npm install @sentry/nextjs
   
   # Configure in next.config.js
   ```

3. **Performance Monitoring**:
   ```javascript
   // Web Vitals tracking
   export function reportWebVitals(metric) {
     console.log(metric);
     // Send to analytics service
   }
   ```

### API Monitoring

1. **Health Checks**:
   ```python
   # Add to FastAPI app
   @app.get("/health")
   async def health_check():
       return {"status": "healthy", "timestamp": datetime.utcnow()}
   ```

2. **Logging**:
   ```python
   import logging
   
   logging.basicConfig(level=logging.INFO)
   logger = logging.getLogger(__name__)
   ```

### Backup Strategy

1. **Database Backups**:
   ```bash
   # Firestore export
   gcloud firestore export gs://your-bucket/backups/$(date +%Y%m%d)
   
   # PostgreSQL backup
   pg_dump $DATABASE_URL > backup.sql
   ```

2. **Code Backups**:
   ```bash
   # Automated GitHub backups
   git push origin main
   
   # Tag releases
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id

  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r crow_eye_api/requirements.txt
      - run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Check Node.js version
   node --version  # Should be 20.x+
   ```

2. **Environment Variables**:
   ```bash
   # Verify environment variables are set
   echo $NEXT_PUBLIC_FIREBASE_API_KEY
   
   # Check .env.local file exists and is properly formatted
   ```

3. **Firebase Deployment Issues**:
   ```bash
   # Re-login to Firebase
   firebase logout
   firebase login
   
   # Check project configuration
   firebase projects:list
   firebase use your-project-id
   ```

4. **API Connection Issues**:
   ```bash
   # Test API endpoint
   curl https://your-api-url.com/health
   
   # Check CORS configuration
   # Verify API_URL environment variable
   ```

### Performance Optimization

1. **Web Application**:
   ```javascript
   // Enable compression
   // next.config.js
   module.exports = {
     compress: true,
     images: {
       domains: ['your-domain.com'],
       formats: ['image/webp', 'image/avif'],
     },
   };
   ```

2. **API Optimization**:
   ```python
   # Enable caching
   from fastapi_cache import FastAPICache
   from fastapi_cache.backends.redis import RedisBackend
   
   FastAPICache.init(RedisBackend(), prefix="crowseye-cache")
   ```

### Security Checklist

- [ ] HTTPS enabled for all domains
- [ ] Environment variables secured
- [ ] API rate limiting configured
- [ ] Database security rules implemented
- [ ] CORS properly configured
- [ ] Authentication tokens secured
- [ ] Regular security updates applied

## 📞 Support

For deployment support:
- **Email**: support@crowseye.tech
- **Documentation**: [docs.crowseye.tech](https://docs.crowseye.tech)
- **GitHub Issues**: [Report deployment issues](https://github.com/cj1101/CrowsEyeWebsite/issues)

---

**Happy Deploying! 🚀** 