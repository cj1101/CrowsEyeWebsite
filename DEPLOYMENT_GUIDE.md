# Crow's Eye Complete Deployment Guide

This guide walks you through deploying both the API and web application for your Crow's Eye marketing tool.

## Overview

We'll deploy:
1. **API**: Python FastAPI backend on Google Cloud Run (free tier)
2. **Web App**: Next.js frontend on Firebase Hosting (free tier)

## Prerequisites

- [Google Cloud Account](https://cloud.google.com) (free tier)
- [Firebase Account](https://firebase.google.com) (free tier)
- [Git](https://git-scm.com/) installed
- [Node.js](https://nodejs.org/) installed
- [Docker](https://www.docker.com/) installed

## Step 1: Deploy the API

### Option A: Automated Deployment (Recommended)

```bash
# Navigate to the API directory
cd ../breadsmith_marketing/social_media_tool_v5_noMeta_final

# Make the script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

### Option B: Manual API Deployment

```bash
# 1. Install Google Cloud CLI
# Visit: https://cloud.google.com/sdk/docs/install

# 2. Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 3. Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 4. Deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/crow-eye-api
gcloud run deploy crow-eye-api \
  --image gcr.io/YOUR_PROJECT_ID/crow-eye-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8000
```

**Save the API URL** - you'll need it for the web app!

## Step 2: Deploy the Web App

### Option A: Automated Deployment (Recommended)

```bash
# Make the script executable
chmod +x deploy-web.sh

# Run the deployment (it will ask for your API URL)
./deploy-web.sh
```

### Option B: Manual Web App Deployment

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize Firebase (if not done already)
firebase init

# 4. Set your API URL
export NEXT_PUBLIC_API_URL="https://your-api-url-here"

# 5. Build and deploy
npm run build
firebase deploy --only hosting
```

## Step 3: Push to Git

```bash
# Add all changes
git add .

# Commit changes
git commit -m "Deploy: Add API hosting configuration and deployment scripts"

# Push to repository
git push origin main
```

## Step 4: Set Up Continuous Deployment (Optional)

### GitHub Actions for API

Create `.github/workflows/deploy-api.yml` in your API repository:

```yaml
name: Deploy API to Cloud Run

on:
  push:
    branches: [ main ]
    paths: [ 'api/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - uses: google-github-actions/setup-gcloud@v0
      with:
        project_id: ${{ secrets.GCP_PROJECT_ID }}
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        export_default_credentials: true
    
    - name: Deploy to Cloud Run
      run: |
        gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/crow-eye-api
        gcloud run deploy crow-eye-api \
          --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/crow-eye-api \
          --platform managed \
          --region us-central1 \
          --allow-unauthenticated
```

### GitHub Actions for Web App

Create `.github/workflows/deploy-web.yml`:

```yaml
name: Deploy Web App to Firebase

on:
  push:
    branches: [ main ]
    paths: [ 'src/**', 'public/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        projectId: your-firebase-project-id
```

## Free Tier Limits

### Google Cloud Run
- 2 million requests/month
- 360,000 GB-seconds/month
- 180,000 vCPU-seconds/month
- 1 GB network egress/month

### Firebase Hosting
- 10 GB storage
- 360 MB/day transfer
- Custom domain support

## Alternative Free Hosting Options

If you prefer not to use Google Cloud:

### Railway (API Alternative)
1. Visit [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Set environment variables
4. Deploy with one click

### Vercel (Web App Alternative)
1. Visit [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Set `NEXT_PUBLIC_API_URL` environment variable
4. Deploy automatically

## Monitoring & Maintenance

### API Monitoring
```bash
# View API logs
gcloud run services logs read crow-eye-api --region us-central1

# Check API status
curl https://your-api-url/health
```

### Web App Monitoring
```bash
# View Firebase hosting logs
firebase hosting:channel:list

# Check deployment status
firebase projects:list
```

## Troubleshooting

### Common Issues

1. **API not responding**: Check Cloud Run logs and container health
2. **Web app can't connect to API**: Verify `NEXT_PUBLIC_API_URL` is correct
3. **Build failures**: Check Node.js version and dependencies
4. **CORS issues**: API should already be configured for CORS

### Getting Help

- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Firebase Console](https://console.firebase.google.com)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

## Security Considerations

1. **API Security**: Consider adding authentication for production
2. **Environment Variables**: Never commit sensitive data to Git
3. **HTTPS**: Both services use HTTPS by default
4. **Rate Limiting**: Consider implementing API rate limiting

## Final URLs

After deployment, you'll have:
- **API**: `https://crow-eye-api-xxxxx-uc.a.run.app`
- **Web App**: `https://your-project-id.web.app`

Both services will automatically scale based on usage and scale to zero when idle, keeping costs minimal.

## Next Steps

1. Test all functionality in production
2. Set up monitoring and alerts
3. Consider adding analytics
4. Plan for scaling if needed

Your Crow's Eye marketing tool is now fully deployed and accessible from anywhere! 🚀 