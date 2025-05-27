# 🔥 Quick Firebase Setup Guide

## Current Status
✅ **Environment file created** - `.env.local` with demo values  
✅ **Hydration issue fixed** - Added `suppressHydrationWarning` to body tag  
✅ **GitHub Actions fixed** - Added fallback values for environment variables  
⚠️ **Firebase needs real configuration** - Currently using demo values  

## To Fix the "Firebase: Error (auth/api-key-not-valid)" Error

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" 
3. Enter project name: `crows-eye-website`
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication
1. In Firebase Console, go to **Authentication** → **Get started**
2. Go to **Sign-in method** tab
3. Enable **Email/Password** - Toggle "Enable"
4. Enable **Google** - Toggle "Enable" and configure

### Step 3: Create Web App
1. Go to **Project settings** (gear icon)
2. Scroll to **"Your apps"** section  
3. Click web icon (`</>`) to add web app
4. Enter app nickname: `Crow's Eye Website`
5. Click **"Register app"**

### Step 4: Get Configuration Values
Copy the configuration object that looks like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Step 5: Update Environment Variables
Replace the values in your `.env.local` file:

```env
# Firebase Configuration for Crow's Eye Website
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...  # Your real API key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Step 6: Set up Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **"Start in test mode"**
3. Select a location close to your users

### Step 7: Test the Setup
1. Restart your development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/signup`
3. Try creating an account - it should work now!

## Alternative: Use the Setup Script
Run the automated setup script:
```bash
npm run setup-firebase
```

## Issues Fixed in This Update

### 1. ✅ Hydration Mismatch Error
**Problem**: Grammarly browser extension was adding attributes to the body tag  
**Solution**: Added `suppressHydrationWarning={true}` to the body element in `layout.tsx`

### 2. ✅ Firebase API Key Error  
**Problem**: No environment variables configured  
**Solution**: Created `.env.local` with demo values (needs real Firebase config)

### 3. ✅ GitHub Actions Pylance Warnings
**Problem**: Environment variables not defined in workflow  
**Solution**: Added fallback values using `|| 'demo-value'` syntax

### 4. ✅ TypeScript Errors
**Problem**: Firebase auth and db could be null  
**Solution**: Added proper null checks in all auth functions

## Next Steps
1. **Set up real Firebase project** (follow steps above)
2. **Update `.env.local`** with real configuration values
3. **Test authentication** on signup/signin pages
4. **Deploy to GitHub** - environment variables will use demo values until you add GitHub secrets

## For Production Deployment
Add these secrets to your GitHub repository:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`  
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Go to: **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions** 