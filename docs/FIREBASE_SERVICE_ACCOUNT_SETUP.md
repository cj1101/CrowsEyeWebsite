# 🔑 Firebase Service Account Setup Guide

## Overview

The Firebase Service Account is needed for **GitHub Actions deployment only**. Your website's client-side functionality uses the regular Firebase web configuration (in `.env.local`).

## What You Need

1. **Client-side Firebase Config** (for website functionality)
2. **Service Account JSON** (for GitHub Actions deployment)

---

## 🌐 Client-Side Firebase Configuration

### Step 1: Get Your Firebase Web App Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `crows-eye-website`
3. Go to **Project Settings** (gear icon)
4. Scroll to **"Your apps"** section
5. Click on your web app or create one if it doesn't exist
6. Copy the configuration object

### Step 2: Update Your .env.local File

Replace the placeholder values in your `.env.local` file with your actual Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=crows-eye-website.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=crows-eye-website
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=crows-eye-website.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

---

## 🚀 Service Account for GitHub Actions

### Step 1: Generate Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `crows-eye-website`
3. Go to **Project Settings** → **Service Accounts** tab
4. Click **"Generate new private key"**
5. Click **"Generate key"** - this downloads a JSON file

### Step 2: Copy the ENTIRE JSON File Content

The downloaded JSON file looks like this:

```json
{
  "type": "service_account",
  "project_id": "crows-eye-website",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xyz@crows-eye-website.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xyz%40crows-eye-website.iam.gserviceaccount.com"
}
```

**⚠️ IMPORTANT**: Copy the **ENTIRE JSON content**, not just the private key!

### Step 3: Add to GitHub Secrets

1. Go to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `FIREBASE_SERVICE_ACCOUNT_CROWS_EYE_WEBSITE`
5. Value: Paste the **entire JSON file content**
6. Click **"Add secret"**

---

## 🔧 Testing Your Setup

### Test Client-Side Configuration

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000
3. Try to sign up/sign in - you should see proper Firebase authentication

### Test GitHub Actions Deployment

1. Push changes to your main branch:
   ```bash
   git add .
   git commit -m "Update Firebase configuration"
   git push origin main
   ```

2. Check the **Actions** tab in your GitHub repository
3. The deployment should succeed without Firebase errors

---

## 🛠️ Troubleshooting

### Client-Side Issues

**Error**: `Firebase: Error (auth/api-key-not-valid)`
- **Solution**: Update your `.env.local` with real Firebase configuration values

**Error**: `Firebase app not initialized`
- **Solution**: Check that all environment variables are set correctly

### GitHub Actions Issues

**Error**: `Error: Failed to parse service account key`
- **Solution**: Ensure you copied the entire JSON file, not just the private key

**Error**: `Error: Service account key is not valid`
- **Solution**: Regenerate the service account key and update the GitHub secret

### Firebase Console Issues

**Error**: `Permission denied`
- **Solution**: Ensure your Firebase project has the correct permissions and billing enabled

---

## 📋 Quick Checklist

### Client-Side Setup ✅
- [ ] `.env.local` file exists
- [ ] All Firebase config values are real (not placeholders)
- [ ] Website loads without Firebase errors
- [ ] Authentication works (sign up/sign in)

### GitHub Actions Setup ✅
- [ ] Service account JSON downloaded from Firebase
- [ ] Entire JSON content copied to GitHub secret
- [ ] Secret name is `FIREBASE_SERVICE_ACCOUNT_CROWS_EYE_WEBSITE`
- [ ] GitHub Actions deployment succeeds

---

## 🔒 Security Notes

1. **Never commit** the service account JSON to your repository
2. **Never share** the service account key publicly
3. **Regenerate** the key if it's ever compromised
4. **Use environment variables** for all sensitive configuration

---

## 📚 Additional Resources

- [Firebase Service Accounts Documentation](https://firebase.google.com/docs/admin/setup#initialize-sdk)
- [GitHub Actions Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Firebase Hosting GitHub Action](https://github.com/FirebaseExtended/action-hosting-deploy)

---

## 🆘 Need Help?

If you're still having issues:

1. Check the Firebase Console for any error messages
2. Review the GitHub Actions logs for deployment errors
3. Ensure your Firebase project has the necessary APIs enabled
4. Verify your billing settings in Firebase (some features require billing)

The key point is: **Client-side config goes in `.env.local`**, **Service account JSON goes in GitHub secrets**. 