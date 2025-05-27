# Firebase Hosting Setup Guide

## Overview
This guide will help you deploy your Next.js app to Firebase Hosting with automatic GitHub integration.

## Prerequisites
- Firebase account (free)
- GitHub repository
- Firebase CLI installed globally

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "crows-eye-website")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Initialize Firebase in Your Project

```bash
# Login to Firebase (if not already logged in)
firebase login

# Initialize Firebase hosting
firebase init hosting
```

When prompted:
- Select "Use an existing project" and choose your project
- Set public directory to: `out`
- Configure as single-page app: `Yes`
- Set up automatic builds with GitHub: `Yes`
- Overwrite index.html: `No`

## Step 3: Set Up GitHub Integration

1. In Firebase Console, go to Hosting
2. Click "Get started" or "Add another site"
3. Choose "GitHub" as deployment method
4. Authorize Firebase to access your GitHub account
5. Select your repository
6. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `out`

## Step 4: Configure GitHub Secrets

In your GitHub repository settings:

1. Go to Settings → Secrets and variables → Actions
2. Add these secrets:
   - `FIREBASE_SERVICE_ACCOUNT`: Get from Firebase Console → Project Settings → Service Accounts
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID

## Step 5: Deploy

### Manual Deployment
```bash
npm run deploy
```

### Automatic Deployment
- Push to `main` branch for production deployment
- Create pull request for preview deployment

## Available Scripts

- `npm run deploy` - Build and deploy to Firebase
- `npm run firebase:serve` - Build and serve locally with Firebase
- `npm run firebase:init` - Initialize Firebase hosting

## Firebase Hosting Features

### Free Tier Includes:
- 10 GB storage
- 1 GB/month transfer
- Custom domain support
- SSL certificates
- Global CDN
- Preview channels for PRs

### Automatic Features:
- ✅ GitHub integration
- ✅ Preview deployments for PRs
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ Custom domains
- ✅ Rollback capabilities

## Custom Domain Setup

1. In Firebase Console → Hosting
2. Click "Add custom domain"
3. Enter your domain
4. Follow DNS configuration instructions
5. Firebase will automatically provision SSL

## Monitoring and Analytics

Firebase provides built-in analytics for:
- Page views
- User engagement
- Performance metrics
- Error tracking

## Troubleshooting

### Build Fails
- Check that `npm run build` works locally
- Verify all dependencies are in `package.json`
- Check Node.js version compatibility

### Deployment Fails
- Verify Firebase project ID is correct
- Check GitHub secrets are properly set
- Ensure service account has proper permissions

### 404 Errors
- Verify `firebase.json` rewrites configuration
- Check that `out` directory contains `index.html`

## Migration from Vercel

Your app is now configured for Firebase Hosting instead of Vercel:

1. ✅ Removed Vercel-specific configurations
2. ✅ Updated Next.js config for Firebase
3. ✅ Added Firebase hosting configuration
4. ✅ Set up GitHub Actions for deployment
5. ✅ Configured for static export

## Next Steps

1. Run `firebase login` and `firebase init hosting`
2. Deploy with `npm run deploy`
3. Set up custom domain (optional)
4. Configure GitHub secrets for automatic deployment

Your website will be available at: `https://your-project-id.web.app` 