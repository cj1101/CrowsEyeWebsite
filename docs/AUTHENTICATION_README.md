# Crow's Eye Authentication System

This document describes the comprehensive authentication system implemented for the Crow's Eye website and Python application integration.

## 🚀 Features

- **Email/Password Authentication**: Traditional sign-up and sign-in
- **Google OAuth**: One-click sign-in with Google
- **Password Reset**: Forgot password functionality
- **User Profiles**: Comprehensive user data management
- **Subscription Management**: Built-in subscription tracking
- **Cross-Platform**: Shared authentication between web and Python apps
- **Real-time State**: React context for authentication state
- **Protected Routes**: Middleware and component-level protection

## 📁 File Structure

```
src/
├── lib/
│   ├── firebase.ts          # Firebase configuration
│   └── auth.ts              # Authentication utilities
├── contexts/
│   └── AuthContext.tsx      # React authentication context
├── app/
│   ├── auth/
│   │   ├── signin/page.tsx  # Sign-in page
│   │   ├── signup/page.tsx  # Sign-up page
│   │   └── forgot-password/page.tsx # Password reset
│   └── account/page.tsx     # Account center
├── components/
│   └── Navigation.tsx       # Updated with auth links
└── middleware.ts            # Route protection middleware

python_auth_integration.py   # Python integration example
FIREBASE_SETUP.md           # Firebase setup guide
```

## 🔧 Setup Instructions

### 1. Install Dependencies

The following packages have been added to your project:

```bash
npm install firebase react-hook-form @hookform/resolvers zod
npm install @types/bcryptjs @types/jsonwebtoken
```

### 2. Firebase Configuration

1. Follow the detailed setup guide in `FIREBASE_SETUP.md`
2. Create a `.env.local` file with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Start Development Server

```bash
npm run dev
```

## 🎯 Usage

### Authentication Pages

- **Sign Up**: `/auth/signup` - Create new account with email/password or Google
- **Sign In**: `/auth/signin` - Sign in to existing account
- **Forgot Password**: `/auth/forgot-password` - Reset password via email
- **Account Center**: `/account` - Manage account and view profile

### Using Authentication in Components

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, userProfile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.displayName || user.email}!</h1>
      <p>Plan: {userProfile?.subscription?.plan}</p>
    </div>
  );
}
```

### Authentication Functions

```tsx
import { signUpWithEmail, signInWithEmail, signInWithGoogle, signOutUser } from '@/lib/auth';

// Sign up with email
await signUpWithEmail('user@example.com', 'password123');

// Sign in with email
await signInWithEmail('user@example.com', 'password123');

// Sign in with Google
await signInWithGoogle();

// Sign out
await signOutUser();
```

## 🔒 Security Features

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /user_activities/{activityId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
    }
  }
}
```

### Protected Routes

Routes under `/account` are automatically protected and will redirect unauthenticated users to the sign-in page.

## 📊 User Data Structure

### User Profile (Firestore)

```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled';
    expiresAt?: Date;
  };
}
```

### User Activities (Optional)

```typescript
interface UserActivity {
  uid: string;
  activity: string;
  timestamp: Date;
  metadata: Record<string, any>;
}
```

## 🐍 Python Integration

### Installation

```bash
pip install firebase-admin
```

### Basic Usage

```python
from python_auth_integration import CrowsEyeAuth

# Initialize
auth_handler = CrowsEyeAuth('path/to/serviceAccountKey.json')

# Verify token from web app
uid = auth_handler.verify_user_token(web_token)

# Get user profile
profile = auth_handler.get_user_profile(uid)

# Check subscription
has_pro = auth_handler.is_user_subscribed(uid, 'pro')
```

### Flask Integration

```python
from flask import Flask, request, jsonify

app = Flask(__name__)
auth_handler = CrowsEyeAuth('serviceAccountKey.json')

@app.route('/api/protected')
@require_auth
def protected_endpoint():
    profile = auth_handler.get_user_profile(request.user_uid)
    return jsonify(profile)
```

## 🎨 UI Components

### Authentication Forms

All authentication forms include:
- Form validation with Zod schemas
- Loading states
- Error handling
- Responsive design
- Accessibility features
- Password visibility toggles

### Navigation Integration

The navigation component automatically shows:
- Sign In/Sign Up buttons for unauthenticated users
- User avatar and Account link for authenticated users
- Proper mobile responsive behavior

## 🔄 State Management

### AuthContext

The `AuthContext` provides:
- `user`: Firebase User object
- `userProfile`: Extended user profile from Firestore
- `loading`: Authentication loading state
- `refreshUserProfile()`: Function to refresh user data

### Real-time Updates

User authentication state is automatically synchronized across all components using Firebase's `onAuthStateChanged` listener.

## 🚀 Deployment Considerations

### Environment Variables

Ensure all Firebase configuration variables are set in your production environment.

### Domain Configuration

Add your production domain to:
1. Firebase Authentication settings
2. Google OAuth configuration (if using)

### Security Rules

Review and update Firestore security rules for production use.

## 🛠️ Customization

### Styling

All components use Tailwind CSS and can be easily customized by modifying the class names.

### Additional Providers

To add more OAuth providers (Facebook, Twitter, etc.):

1. Enable the provider in Firebase Console
2. Add the provider to `src/lib/firebase.ts`
3. Create sign-in functions in `src/lib/auth.ts`
4. Add buttons to the authentication forms

### User Profile Fields

To add more user profile fields:

1. Update the `UserProfile` interface in `src/lib/auth.ts`
2. Modify the `createUserProfile` function
3. Update the account center UI

## 📝 API Endpoints

### Future API Routes

You can create API routes for server-side authentication:

```typescript
// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'firebase-admin';

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  
  try {
    const decodedToken = await auth().verifyIdToken(token);
    return NextResponse.json({ uid: decodedToken.uid });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **"Firebase app not initialized"**
   - Check environment variables
   - Ensure Firebase config is correct

2. **"Unauthorized domain"**
   - Add domain to Firebase Auth settings

3. **"Permission denied"**
   - Check Firestore security rules
   - Ensure user is authenticated

4. **Google Sign-In not working**
   - Verify OAuth configuration
   - Check domain settings

### Debug Mode

Enable Firebase debug mode in development:

```typescript
// Add to firebase.ts
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}
```

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

## 🤝 Contributing

When contributing to the authentication system:

1. Test all authentication flows
2. Update this documentation
3. Ensure security best practices
4. Test Python integration
5. Verify mobile responsiveness

## 📄 License

This authentication system is part of the Crow's Eye project and follows the same license terms. 