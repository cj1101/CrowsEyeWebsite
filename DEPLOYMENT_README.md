# 🚀 Crow's Eye Website Deployment Guide

This guide will help you set up Firebase, run the website locally, and deploy it to GitHub Pages and Vercel.

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- Firebase account
- GitHub account
- (Optional) Vercel account

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

### GitHub Pages Deployment

#### 1. Enable GitHub Pages

1. Go to your GitHub repository
2. Go to **Settings** → **Pages**
3. Under **Source**, select **"GitHub Actions"**

#### 2. Add GitHub Secrets

Go to **Settings** → **Secrets and variables** → **Actions** and add:

**Required Firebase Secrets:**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

#### 3. Deploy

Push to your main branch:

```bash
git add .
git commit -m "Deploy Crow's Eye Website"
git push origin main
```

The GitHub Action will automatically build and deploy your site.

### Vercel Deployment (Optional)

#### 1. Install Vercel CLI

```bash
npm i -g vercel
```

#### 2. Deploy to Vercel

```bash
vercel
```

Follow the prompts to deploy.

#### 3. Add Environment Variables

In Vercel dashboard, go to your project → **Settings** → **Environment Variables** and add your Firebase configuration.

#### 4. Automatic Deployment

For automatic deployment, add these GitHub secrets:
- `VERCEL_TOKEN` - From Vercel dashboard
- `VERCEL_ORG_ID` - From Vercel project settings
- `VERCEL_PROJECT_ID` - From Vercel project settings

## 🔐 Security Configuration

### Firebase Security Rules

Update Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Firebase Auth Domains

Add your deployment domains to Firebase:
1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your domains:
   - `localhost` (for development)
   - `your-username.github.io` (for GitHub Pages)
   - `your-vercel-domain.vercel.app` (for Vercel)

## 🐛 Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to Firebase Auth authorized domains

2. **"Missing or insufficient permissions"**
   - Check Firestore security rules
   - Ensure user is authenticated

3. **Build fails on deployment**
   - Check that all environment variables are set in GitHub secrets
   - Verify Firebase configuration is correct

4. **Google Sign-In not working**
   - Configure OAuth in Google Cloud Console
   - Add authorized domains

### Getting Help

- Check the [Firebase Documentation](https://firebase.google.com/docs)
- Review [Next.js Documentation](https://nextjs.org/docs)
- Check GitHub Actions logs for deployment issues

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