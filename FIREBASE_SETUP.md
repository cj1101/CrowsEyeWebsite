# Firebase Setup Guide for Crow's Eye Authentication

This guide will help you set up Firebase Authentication and Firestore for the Crow's Eye website.

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "crows-eye-website")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click on it and toggle "Enable"
   - **Google**: Click on it, toggle "Enable", and add your project's domain

## 3. Set up Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (you can secure it later)
4. Select a location for your database (choose one close to your users)

## 4. Configure Web App

1. Go to "Project settings" (gear icon in the left sidebar)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Enter an app nickname (e.g., "Crow's Eye Website")
5. Check "Also set up Firebase Hosting" if you plan to use it
6. Click "Register app"

## 5. Get Configuration Values

After registering your web app, you'll see a configuration object like this:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 6. Set Environment Variables

Create a `.env.local` file in your project root and add these variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## 7. Configure Google OAuth (Optional)

If you want to use Google Sign-In:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add your domain to "Authorized JavaScript origins"
7. Add your domain + `/auth/callback` to "Authorized redirect URIs"

## 8. Security Rules for Firestore

Replace the default Firestore rules with these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add other collection rules as needed
  }
}
```

## 9. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/auth/signup` to test account creation
3. Navigate to `/auth/signin` to test sign-in
4. Check the Firebase Console to see if users are being created

## 10. Python Application Integration

To access the same user data from your Python application, you'll need:

1. **Firebase Admin SDK for Python**:
   ```bash
   pip install firebase-admin
   ```

2. **Service Account Key**:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file and keep it secure

3. **Python Code Example**:
   ```python
   import firebase_admin
   from firebase_admin import credentials, firestore, auth
   
   # Initialize Firebase Admin
   cred = credentials.Certificate("path/to/serviceAccountKey.json")
   firebase_admin.initialize_app(cred)
   
   # Get Firestore client
   db = firestore.client()
   
   # Example: Get user profile
   def get_user_profile(uid):
       doc_ref = db.collection('users').document(uid)
       doc = doc_ref.get()
       if doc.exists:
           return doc.to_dict()
       return None
   
   # Example: Verify ID token from web app
   def verify_token(id_token):
       try:
           decoded_token = auth.verify_id_token(id_token)
           return decoded_token['uid']
       except:
           return None
   ```

## 11. Production Considerations

1. **Environment Variables**: Use your hosting platform's environment variable system
2. **Security Rules**: Review and tighten Firestore security rules
3. **Domain Configuration**: Add your production domain to Firebase Auth settings
4. **Monitoring**: Enable Firebase Analytics and Performance Monitoring

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to Firebase Auth settings under "Authorized domains"

2. **"Missing or insufficient permissions"**
   - Check your Firestore security rules
   - Ensure the user is authenticated

3. **Google Sign-In not working**
   - Verify OAuth configuration in Google Cloud Console
   - Check that domains are properly configured

### Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore) 