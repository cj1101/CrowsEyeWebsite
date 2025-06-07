# 🔍 Crow's Eye Marketing Suite - Troubleshooting Guide

This guide is designed for quick diagnosis of issues with yes/no answers. For each issue you encounter, answer the questions and I'll provide the appropriate fix.

## 🌐 Web Application Issues

### Authentication & Login Problems

**Q1: Can you access the website at all?**y
- **NO** → Check internet connection, try different browser, check if website is down
- **YES** → Continue to Q2

**Q2: Does the login page load without errors?**y
- **NO** → Browser compatibility issue or JavaScript errors
- **YES** → Continue to Q3

**Q3: Can you create an account with email/password?**y
- **NO** → Firebase authentication issue
- **YES** → Continue to Q4

**Q4: Do you receive a verification email after signup?**y
- **NO** → Email delivery issue or Firebase config problem
- **YES** → Continue to Q5

**Q5: Can you sign in after email verification?**y
- **NO** → Account verification issue
- **YES** → Authentication working correctly

### Marketing Tool Features

**Q6: Are all social media platforms (Facebook, Twitter, LinkedIn, TikTok, YouTube) visible in the platform selector?**y
- **NO** → Platform configuration issue
- **YES** → Continue to Q7

**Q7: Can you generate AI content for any platform?** n, failed to generate content. Please try again
- **NO** → AI service integration issue
- **YES** → Continue to Q8

**Q8: Do the generated posts respect character limits for each platform?**
- **NO** → Character limit validation issue
- **YES** → Continue to Q9

**Q9: Can you access all AI tools (Image Generator, Video Editor, Analytics, etc.)?**
- **NO** → Feature access control issue
- **YES** → Marketing tool working correctly

### Dashboard & UI Issues

**Q10: Does the dashboard load after successful login?**
- **NO** → Route protection or authentication state issue
- **YES** → Continue to Q11

**Q11: Are all navigation elements clickable and functional?**
- **NO** → JavaScript or React component issue
- **YES** → Continue to Q12

**Q12: Do real-time features (like live content preview) work?**
- **NO** → WebSocket or real-time sync issue
- **YES** → Dashboard working correctly

## 🖥️ Desktop Application Issues

### Installation & Startup

**Q13: Does the desktop app start when double-clicked?**
- **NO** → Installation or dependencies issue
- **YES** → Continue to Q14

**Q14: Can you see the login screen on startup?**
- **NO** → UI framework (tkinter) issue
- **YES** → Continue to Q15

**Q15: Can you create an account in the desktop app?**
- **NO** → Database connection issue
- **YES** → Continue to Q16

### Feature Access & Functionality

**Q16: Are all marketing features unlocked (no subscription restrictions)?**
- **NO** → Access control override not applied
- **YES** → Continue to Q17

**Q17: Can you generate AI content with OpenAI/Gemini APIs?**
- **NO** → API key configuration issue
- **YES** → Continue to Q18

**Q18: Can you save and schedule posts?**
- **NO** → Database write permissions issue
- **YES** → Continue to Q19

**Q19: Does the analytics section load data?**
- **NO** → Data visualization or database read issue
- **YES** → Desktop app working correctly

### Super User Features

**Q20: Is your email charlie@suarezhouse.net?**
- **NO** → Regular user permissions apply
- **YES** → You should have super user privileges

**Q21: Do you have access to advanced settings and admin features?**
- **NO** → Super user detection not working
- **YES** → Super user features working correctly

## 🔧 Common Fix Commands

### Firebase/Authentication Issues
```bash
# Reset Firebase cache
rm -rf .firebase/
firebase login
firebase deploy

# Check Firebase config
npm run dev
# Look for Firebase errors in console
```

### Marketing Tool Platform Issues
```bash
# Check platform configuration
grep -r "enabled.*false" src/lib/marketing-tool-constants.ts
# Should return nothing if all platforms enabled
```

### Desktop App Database Issues
```bash
# Check database permissions
ls -la desktop_app/data/
# Ensure write permissions

# Reset desktop app database
rm desktop_app/data/crow_eye.db
# App will recreate on next startup
```

### React/Frontend Issues
```bash
# Clear React cache
rm -rf .next/
rm -rf node_modules/
npm install
npm run dev
```

### Python Dependencies Issues
```bash
# Reinstall desktop app dependencies
cd desktop_app/
pip install -r requirements.txt

# Check Python version compatibility
python --version
# Should be 3.8 or higher
```

## 🚀 Development Server Commands

### Start Web Application
```bash
npm run dev
# Access at http://localhost:3000
```

### Start Desktop Application
```bash
cd desktop_app/
python main.py
```

### Deploy to Firebase
```bash
npm run build
firebase deploy
```

## 📋 Quick Diagnostic Checklist

### Before Reporting Issues, Check:

**Environment Setup:**
- [ ] Node.js version 18.0+ installed
- [ ] Python 3.8+ installed
- [ ] Firebase CLI authenticated
- [ ] All dependencies installed (`npm install` and `pip install -r requirements.txt`)

**Configuration Files:**
- [ ] `.env.local` exists with proper Firebase config
- [ ] API keys properly set in desktop app settings
- [ ] No hardcoded URLs pointing to localhost in production

**Browser Compatibility:**
- [ ] Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- [ ] JavaScript enabled
- [ ] Local storage enabled
- [ ] No ad blockers interfering

**Network & Firewall:**
- [ ] Internet connection stable
- [ ] Firewall not blocking Firebase requests
- [ ] Corporate proxy not interfering (if applicable)

## 🆘 Emergency Reset Procedures

### Complete Web App Reset
```bash
# Stop all processes
pkill -f "npm"
pkill -f "next"

# Clear all caches
rm -rf .next/
rm -rf node_modules/
rm -rf .firebase/

# Reinstall everything
npm install
npm run build

# Redeploy
firebase login
firebase deploy
```

### Complete Desktop App Reset
```bash
# Stop desktop app
pkill -f "python main.py"

# Clear database and cache
rm -rf desktop_app/data/
rm -rf desktop_app/__pycache__/

# Reinstall dependencies
cd desktop_app/
pip install -r requirements.txt

# Restart
python main.py
```

### Firebase Project Reset
```bash
# Only if absolutely necessary
firebase projects:list
firebase use <project-id>
firebase functions:delete --all-functions
firebase deploy
```

## 📞 Support Information

If the troubleshooting guide doesn't resolve your issue:

1. **Gather Information:**
   - Operating system and version
   - Browser version (for web app)
   - Python version (for desktop app)
   - Exact error messages
   - Steps to reproduce

2. **Check Logs:**
   - Browser console (F12 → Console tab)
   - Desktop app terminal output
   - Firebase console for backend errors

3. **Provide Details:**
   - When did the issue start?
   - What changed recently?
   - Does it happen consistently?
   - Are other users affected?

Remember: Answer each question with a simple **YES** or **NO** when reporting issues for fastest resolution.

## Current Issues Identified (January 2025)

### 🚨 CRITICAL: Frontend buttons not working
**Status**: None of the website buttons are functional except dashboard menu items
**Root Cause**: API connection issues and deployment configuration problems

### 📊 Diagnosed Problems

1. **API URL Configuration Mismatch**
   - Frontend API base URL: `https://crow-eye-api-605899951231.us-central1.run.app`
   - Deployed service URL: Same (✅ This is correct)
   - Local fallback was: `http://127.0.0.1:8001` (❌ Wrong port)

2. **Deployment Issues**
   - API Docker container failing to build properly
   - Dockerfile CMD configuration was overly complex
   - Environment variable handling for Cloud Run PORT

3. **Working Reference Available**
   - Original working version exists at: `C:\Users\charl\CodingProjets\breadsmith_marketing\social_media_tool_v5_noMeta_final`
   - This version has working API configuration

## 🛠️ Quick Fix Steps

### Step 1: Test Current API Status
```bash
# Check if API is responding
Invoke-WebRequest -Uri "https://crow-eye-api-605899951231.us-central1.run.app/health" -UseBasicParsing

# Expected response: HTTP 200 with health status
```

### Step 2: Fix API Deployment
```bash
# Navigate to project directory
cd "C:\Users\charl\CodingProjets\Crow's Eye Website"

# Deploy API with fixed configuration
gcloud run deploy crow-eye-api --source ./crow_eye_api --region us-central1 --allow-unauthenticated
```

### Step 3: Update Frontend Environment
```bash
# Set environment variable for production
$env:NEXT_PUBLIC_API_URL = "https://crow-eye-api-605899951231.us-central1.run.app"

# Rebuild and deploy frontend
npm run build
```

### Step 4: Deploy Frontend
```bash
# Deploy to Firebase hosting
firebase deploy --only hosting
```

## 🔍 Debugging Commands

### Check Google Cloud Status
```bash
# Check authentication
gcloud auth list

# Check active project
gcloud config get-value project

# List all Cloud Run services
gcloud run services list

# Get specific service details
gcloud run services describe crow-eye-api --region=us-central1
```

### Test API Endpoints
```bash
# Health check
curl https://crow-eye-api-605899951231.us-central1.run.app/health

# Test with PowerShell
Invoke-WebRequest -Uri "https://crow-eye-api-605899951231.us-central1.run.app/health"
```

### Frontend Development Testing
```bash
# Run frontend locally with correct API
$env:NEXT_PUBLIC_API_URL = "https://crow-eye-api-605899951231.us-central1.run.app"
npm run dev
```

## 📋 Information I Need to Help You

When asking for help, please provide:

### 1. Current Error Messages
- Copy exact error messages from browser console (F12 → Console)
- Copy any terminal error outputs
- Screenshot of any error pages

### 2. Environment Status
```bash
# Run these commands and share output:
gcloud config get-value project
gcloud run services list
gcloud auth list
```

### 3. API Testing Results
```bash
# Test API and share results:
Invoke-WebRequest -Uri "https://crow-eye-api-605899951231.us-central1.run.app/health" -UseBasicParsing
```

### 4. Browser Network Tab
- Open F12 → Network tab
- Try clicking a button that doesn't work
- Share screenshot of failed network requests

### 5. Frontend Console Errors
- Open F12 → Console tab
- Share any red error messages
- Look specifically for CORS or fetch errors

## 🚀 Complete Rebuild Process

If quick fixes don't work, here's the complete rebuild process:

### 1. Copy Working Configuration
```bash
# Copy working API from original project
xcopy "C:\Users\charl\CodingProjets\breadsmith_marketing\social_media_tool_v5_noMeta_final\crow_eye_api\*" ".\crow_eye_api\" /E /Y
```

### 2. Update Dependencies
```bash
# Update API dependencies
cd crow_eye_api
pip install -r requirements.txt

# Update frontend dependencies
cd ..
npm install
```

### 3. Fix Environment Configuration
```bash
# Create .env.local file with:
NEXT_PUBLIC_API_URL=https://crow-eye-api-605899951231.us-central1.run.app
```

### 4. Deploy Everything
```bash
# Deploy API
python deploy.py api --platform gcp

# Deploy frontend
python deploy.py web --platform firebase
```

## 🔧 Common Issues & Solutions

### Issue: "Build failed" during API deployment
**Solution**: Check Dockerfile CMD line format
```dockerfile
# Wrong (complex):
CMD ["python", "-c", "import os; import uvicorn; uvicorn.run('main:app', host='0.0.0.0', port=int(os.environ.get('PORT', 8000)))"]

# Correct (simple):
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Issue: CORS errors in browser
**Solution**: Ensure API allows frontend domain
```python
# In main.py, add CORS middleware:
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: API returns 404 for all endpoints
**Solution**: Check API routing configuration and deployment

### Issue: Frontend builds but buttons don't work
**Solution**: Check browser console for JavaScript errors and API connection issues

## 📞 Getting Help Checklist

Before asking for help, please:
- [ ] Run the debugging commands above
- [ ] Check browser console for errors
- [ ] Test API endpoints manually
- [ ] Verify environment variables
- [ ] Check both local and deployed versions

## 🎯 Expected Working State

When everything is working correctly:
- ✅ API health endpoint returns HTTP 200
- ✅ Frontend loads without console errors
- ✅ All buttons trigger network requests
- ✅ Dashboard shows real data
- ✅ File uploads work
- ✅ Authentication functions properly

---

**Last Updated**: January 2025
**Current Status**: 🔴 API connection issues, buttons not functional
**Priority**: 🚨 CRITICAL - Core functionality broken 