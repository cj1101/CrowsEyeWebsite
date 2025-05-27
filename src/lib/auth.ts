import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  User,
  UserCredential,
  AuthError,
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  createdAt: Date;
  lastLoginAt: Date;
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'cancelled';
    expiresAt?: Date;
  };
}

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date();
};

// Create user profile in Firestore
export const createUserProfile = async (
  user: User, 
  additionalData?: Record<string, unknown>
): Promise<void> => {
  console.log('👤 Creating user profile for:', user.uid);
  console.log('📧 User email:', user.email);
  console.log('🏷️ User display name:', user.displayName);

  if (!user) {
    console.error('❌ No user provided to createUserProfile');
    throw new Error('User is required to create profile');
  }

  // Handle demo mode
  if (!isFirebaseConfigured() || !db) {
    console.warn('🎭 Demo mode: Simulating user profile creation');
    const profileData = {
      uid: user.uid,
      displayName: user.displayName || 'Demo User',
      email: user.email || 'demo@example.com',
      photoURL: user.photoURL,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      subscription: {
        plan: 'free' as const,
        status: 'active' as const,
      },
      ...additionalData,
    };
    console.log('💾 Demo profile data:', profileData);
    console.log('✅ Demo user profile created successfully');
    return;
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    console.log('📄 Checking if user profile exists...');
    
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { displayName, email, photoURL } = user;
      const now = serverTimestamp();
      
      const profileData = {
        uid: user.uid,
        displayName: displayName || null,
        email: email || '',
        photoURL: photoURL || null,
        createdAt: now,
        lastLoginAt: now,
        subscription: {
          plan: 'free' as const,
          status: 'active' as const,
        },
        ...additionalData,
      };

      console.log('💾 Creating new user profile with data:', {
        ...profileData,
        createdAt: 'serverTimestamp()',
        lastLoginAt: 'serverTimestamp()'
      });

      await setDoc(userRef, profileData);
      console.log('✅ User profile created successfully in Firestore');
    } else {
      console.log('ℹ️ User profile already exists, skipping creation');
    }
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });
    }
    throw error;
  }
};

// Update user's last login time
export const updateLastLogin = async (uid: string): Promise<void> => {
  console.log('📝 Updating last login for user:', uid);

  if (!isFirebaseConfigured() || !db) {
    console.log('🎭 Demo mode: Simulating last login update');
    return;
  }

  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    });
    console.log('✅ Last login updated successfully');
  } catch (error) {
    console.error('❌ Error updating last login:', error);
    // Don't throw here as this is not critical for user experience
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  console.log('👤 Fetching user profile for:', uid);

  if (!isFirebaseConfigured() || !db) {
    console.log('🎭 Demo mode: Returning mock user profile');
    return {
      uid,
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: null,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      subscription: {
        plan: 'free',
        status: 'active',
      },
    };
  }

  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      console.log('✅ User profile fetched successfully');
      
      const profile: UserProfile = {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName || undefined,
        photoURL: data.photoURL || undefined,
        createdAt: convertTimestamp(data.createdAt),
        lastLoginAt: convertTimestamp(data.lastLoginAt),
        subscription: data.subscription,
      };

      return profile;
    } else {
      console.warn('⚠️ User profile not found in Firestore');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    return null;
  }
};

// Sign up with email and password
export const signUpWithEmail = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  console.log('🔐 Starting email signup process');
  console.log('📧 Email:', email);
  console.log('🔒 Password length:', password.length);

  if (!isFirebaseConfigured() || !auth) {
    console.warn('🎭 Demo mode: Simulating email signup');
    
    if (process.env.NODE_ENV === 'development') {
      const mockUser = {
        uid: 'demo-user-' + Date.now(),
        email: email,
        displayName: null,
        photoURL: null,
        emailVerified: false,
      } as User;
      
      const mockCredential = {
        user: mockUser,
        providerId: 'password',
        operationType: 'signIn',
      } as UserCredential;
      
      console.log('✅ Demo signup successful');
      await createUserProfile(mockUser);
      return mockCredential;
    }
    
    throw new Error('Firebase Authentication is not configured. Please set up your Firebase environment variables.');
  }

  try {
    console.log('📝 Creating user with Firebase Auth...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Firebase user created successfully:', userCredential.user.uid);
    
    console.log('👤 Creating user profile in Firestore...');
    await createUserProfile(userCredential.user);
    console.log('✅ User profile created successfully');
    
    return userCredential;
  } catch (error) {
    console.error('❌ Email signup failed:', error);
    
    if (error instanceof Error) {
      const authError = error as AuthError;
      console.error('Firebase Auth Error Details:', {
        code: authError.code,
        message: authError.message,
        customData: authError.customData
      });
    }
    
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  console.log('🔐 Starting email signin process');
  console.log('📧 Email:', email);

  if (!isFirebaseConfigured() || !auth) {
    console.warn('🎭 Demo mode: Simulating email signin');
    
    if (process.env.NODE_ENV === 'development') {
      const mockUser = {
        uid: 'demo-user-signin-' + Date.now(),
        email: email,
        displayName: null,
        photoURL: null,
        emailVerified: true,
      } as User;
      
      const mockCredential = {
        user: mockUser,
        providerId: 'password',
        operationType: 'signIn',
      } as UserCredential;
      
      console.log('✅ Demo signin successful');
      return mockCredential;
    }
    
    throw new Error('Firebase Authentication is not configured. Please set up your Firebase environment variables.');
  }

  try {
    console.log('🔑 Signing in with Firebase Auth...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Firebase signin successful:', userCredential.user.uid);
    
    console.log('📝 Updating last login timestamp...');
    await updateLastLogin(userCredential.user.uid);
    console.log('✅ Last login updated');
    
    return userCredential;
  } catch (error) {
    console.error('❌ Email signin failed:', error);
    
    if (error instanceof Error) {
      const authError = error as AuthError;
      console.error('Firebase Auth Error Details:', {
        code: authError.code,
        message: authError.message,
        customData: authError.customData
      });
    }
    
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
  console.log('🔍 Starting Google signin process');

  if (!isFirebaseConfigured() || !auth) {
    console.warn('🎭 Demo mode: Simulating Google signin');
    
    if (process.env.NODE_ENV === 'development') {
      const mockUser = {
        uid: 'demo-google-user-' + Date.now(),
        email: 'demo@example.com',
        displayName: 'Demo User',
        photoURL: 'https://via.placeholder.com/150',
        emailVerified: true,
      } as User;
      
      const mockCredential = {
        user: mockUser,
        providerId: 'google.com',
        operationType: 'signIn',
      } as UserCredential;
      
      console.log('✅ Demo Google signin successful');
      await createUserProfile(mockUser);
      return mockCredential;
    }
    
    throw new Error('Firebase Authentication is not configured. Please set up your Firebase environment variables.');
  }

  try {
    console.log('🔍 Opening Google signin popup...');
    const userCredential = await signInWithPopup(auth, googleProvider);
    console.log('✅ Google signin successful:', userCredential.user.uid);
    console.log('📧 Google user email:', userCredential.user.email);
    console.log('🏷️ Google user name:', userCredential.user.displayName);
    
    console.log('👤 Creating/updating user profile...');
    await createUserProfile(userCredential.user);
    
    console.log('📝 Updating last login...');
    await updateLastLogin(userCredential.user.uid);
    
    console.log('✅ Google signin process completed');
    return userCredential;
  } catch (error) {
    console.error('❌ Google signin failed:', error);
    
    if (error instanceof Error) {
      const authError = error as AuthError;
      console.error('Google Auth Error Details:', {
        code: authError.code,
        message: authError.message,
        customData: authError.customData
      });
    }
    
    throw error;
  }
};

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<void> => {
  console.log('📧 Sending password reset email to:', email);

  if (!isFirebaseConfigured() || !auth) {
    console.warn('🎭 Demo mode: Simulating password reset email');
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Demo password reset email sent');
      return;
    }
    throw new Error('Firebase Authentication is not configured. Please set up your Firebase environment variables.');
  }

  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent successfully');
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  console.log('🚪 Starting signout process');

  if (!isFirebaseConfigured() || !auth) {
    console.log('🎭 Demo mode: Simulating signout');
    return;
  }

  try {
    await signOut(auth);
    console.log('✅ User signed out successfully');
  } catch (error) {
    console.error('❌ Error signing out:', error);
    throw error;
  }
};

// Get auth error message
export const getAuthErrorMessage = (errorCode: string): string => {
  console.log('🔍 Getting error message for code:', errorCode);
  
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email address. Please check your email or create a new account.',
    'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
    'auth/email-already-in-use': 'An account with this email already exists. Please sign in instead.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Invalid email address format.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later or reset your password.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completing.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/popup-blocked': 'Sign-in popup was blocked by the browser. Please allow popups and try again.',
    'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
    'auth/internal-error': 'An internal error occurred. Please try again later.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/requires-recent-login': 'Please sign in again to complete this action.',
  };

  const message = errorMessages[errorCode] || `An error occurred during authentication: ${errorCode}`;
  console.log('📝 Error message:', message);
  return message;
}; 