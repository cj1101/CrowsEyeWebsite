# 🚀 Crow's Eye Website Deployment Guide

This guide will help you set up Firebase, run the website locally, and deploy it to Firebase Hosting.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase account
- GitHub account (for automatic deployment)

## 🔧 Quick Setup

### Option 1: Automated Setup (Recommended)

Run the automated setup script:

```bash
npm run setup
```

This will:
- Install all dependencies
- Guide you through Firebase configuration
- Create your `.env.local` file
- Provide deployment instructions
- Optionally start the development server

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   ```bash
   npm run setup-firebase
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `crows-eye-website`
4. Enable/disable Google Analytics as desired
5. Click "Create project"

### 2. Enable Authentication

1. Go to **Authentication** → **Get started**
2. Go to **Sign-in method** tab
3. Enable:
   - **Email/Password**: Toggle "Enable"
   - **Google**: Toggle "Enable" and configure

### 3. Set up Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **"Start in test mode"**
3. Select a location close to your users

### 4. Configure Web App

1. Go to **Project settings** (gear icon)
2. Scroll to **"Your apps"** section
3. Click web icon (`</>`) to add web app
4. Enter app nickname: `Crow's Eye Website`
5. Click **"Register app"**
6. Copy the configuration values

### 5. Environment Variables

Create `.env.local` file with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 🖥️ Local Development

### Start Development Server

```bash
npm run dev
```

The website will be available at `http://localhost:3000`

### Available Pages

- `/` - Home page
- `/auth/signin` - Sign in page
- `/auth/signup` - Sign up page
- `/account` - User account center
- `/features` - Features page
- `/pricing` - Pricing page
- `/download` - Download page

### Testing Authentication

1. Navigate to `/auth/signup` to create an account
2. Check Firebase Console to see user creation
3. Test sign-in at `/auth/signin`
4. Access account center at `/account`

## 🌐 Deployment

### Firebase Deployment

The website is configured for automatic deployment to Firebase Hosting via GitHub Actions.

#### Manual Deployment

If you need to deploy manually:

```bash
# Build and deploy
npm run deploy

# Or step by step
npm run clean-build
firebase deploy --only hosting
```

#### Automatic Deployment

The website automatically deploys to Firebase Hosting when you push to the main branch via GitHub Actions.

**Required GitHub Secrets:**
- `FIREBASE_SERVICE_ACCOUNT_CROWS_EYE_WEBSITE` - Firebase service account JSON

**Required GitHub Variables:**
- `NEXT_PUBLIC_FIREBASE_API_KEY` - From Firebase project settings
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - From Firebase project settings  
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - From Firebase project settings
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - From Firebase project settings
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - From Firebase project settings
- `NEXT_PUBLIC_FIREBASE_APP_ID` - From Firebase project settings

## Deployment URLs

After successful deployment, your website will be available at:
- `https://crows-eye-website.web.app` (Firebase Hosting)
- `https://crows-eye-website.firebaseapp.com` (Firebase Hosting alternative)

## 🔐 Security Configuration

### Firebase Security Rules

Make sure your Firestore security rules are properly configured:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Add your security rules here
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Environment Variables

Keep your environment variables secure:
- Never commit `.env.local` to version control
- Use GitHub secrets for deployment
- Regularly rotate your Firebase API keys

## 📱 Testing

Before deploying, test your application:

```bash
# Run tests
npm test

# Build and test locally
npm run build
npm start
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**: Check your environment variables
2. **Firebase Connection**: Verify your Firebase configuration
3. **Deployment Errors**: Check GitHub Actions logs

### Getting Help

- Check the [Firebase Documentation](https://firebase.google.com/docs)
- Review GitHub Actions logs for deployment issues
- Ensure all required secrets and variables are set in GitHub

## 📱 Python Integration

For integrating with Python applications, see `python_auth_integration.py` and `AUTHENTICATION_README.md`.

## 🎯 Production Checklist

- [ ] Firebase project created and configured
- [ ] Authentication methods enabled
- [ ] Firestore database set up with security rules
- [ ] Environment variables configured
- [ ] GitHub secrets added
- [ ] Authorized domains configured
- [ ] Local testing completed
- [ ] Deployment successful
- [ ] Authentication flow tested in production

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review Firebase Console for errors
3. Check GitHub Actions logs
4. Verify environment variable configuration 