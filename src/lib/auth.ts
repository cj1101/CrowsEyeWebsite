import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

export interface UserProfile {
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

// Create user profile in Firestore
export const createUserProfile = async (user: User, additionalData?: Record<string, unknown>) => {
  console.log('👤 Creating user profile for:', user.uid);
  
  if (!user || !db) {
    console.error('❌ Missing user or database:', { hasUser: !!user, hasDb: !!db });
    
    // In demo mode, simulate profile creation
    if (process.env.NODE_ENV === 'development' && user) {
      console.log('🎭 Demo mode: Simulating user profile creation');
      const profileData = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
        lastLoginAt: new Date(),
        subscription: {
          plan: 'free',
          status: 'active',
        },
        ...additionalData,
      };
      console.log('💾 Demo profile data:', profileData);
      console.log('✅ Demo user profile created successfully');
      return null;
    }
    
    return;
  }

  const userRef = doc(db, 'users', user.uid);
  console.log('📄 Checking if user profile exists...');
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = new Date();
    
    const profileData = {
      uid: user.uid,
      displayName,
      email,
      photoURL,
      createdAt,
      lastLoginAt: createdAt,
      subscription: {
        plan: 'free',
        status: 'active',
      },
      ...additionalData,
    };

    console.log('💾 Creating new user profile with data:', profileData);

    try {
      await setDoc(userRef, profileData);
      console.log('✅ User profile created successfully');
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      throw error;
    }
  } else {
    console.log('ℹ️ User profile already exists');
  }

  return userRef;
};

// Update user's last login time
export const updateLastLogin = async (uid: string) => {
  if (!db) return;
  
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastLoginAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!db) return null;
  
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        lastLoginAt: data.lastLoginAt.toDate(),
      } as UserProfile;
    }

    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  console.log('🔐 Attempting to sign up with email:', email);
  
  if (!auth) {
    const error = new Error('Firebase Authentication is not configured. Please set up your Firebase environment variables.');
    console.error('❌ Auth not available:', error);
    
    // In demo mode, simulate a successful signup
    if (process.env.NODE_ENV === 'development') {
      console.log('🎭 Demo mode: Simulating successful signup');
      const mockUser = {
        uid: 'demo-user-' + Date.now(),
        email: email,
        displayName: null,
        photoURL: null
      } as User;
      
      const mockCredential = {
        user: mockUser,
        providerId: 'password',
        operationType: 'signIn'
      } as UserCredential;
      
      console.log('✅ Demo signup successful');
      return mockCredential;
    }
    
    throw error;
  }
  
  try {
    console.log('📝 Creating user with email and password...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ User created successfully:', userCredential.user.uid);
    
    console.log('👤 Creating user profile...');
    await createUserProfile(userCredential.user);
    console.log('✅ User profile created successfully');
    
    return userCredential;
  } catch (error: any) {
    console.error('❌ Error signing up with email:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  console.log('🔐 Attempting to sign in with email:', email);
  
  if (!auth) {
    const error = new Error('Firebase Authentication is not configured. Please set up your Firebase environment variables.');
    console.error('❌ Auth not available for sign in:', error);
    
    // In demo mode, simulate a successful signin
    if (process.env.NODE_ENV === 'development') {
      console.log('🎭 Demo mode: Simulating successful signin');
      const mockUser = {
        uid: 'demo-user-signin-' + Date.now(),
        email: email,
        displayName: null,
        photoURL: null
      } as User;
      
      const mockCredential = {
        user: mockUser,
        providerId: 'password',
        operationType: 'signIn'
      } as UserCredential;
      
      console.log('✅ Demo signin successful');
      return mockCredential;
    }
    
    throw error;
  }
  
  try {
    console.log('🔑 Signing in with email and password...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ User signed in successfully:', userCredential.user.uid);
    
    console.log('📝 Updating last login...');
    await updateLastLogin(userCredential.user.uid);
    console.log('✅ Last login updated successfully');
    
    return userCredential;
  } catch (error: any) {
    console.error('❌ Error signing in with email:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
  if (!auth) {
    const error = new Error('Firebase Authentication is not configured. Please set up your Firebase environment variables.');
    console.error('❌ Auth not available for Google sign-in:', error);
    
    // In demo mode, simulate a successful Google signup
    if (process.env.NODE_ENV === 'development') {
      console.log('🎭 Demo mode: Simulating successful Google signup');
      const mockUser = {
        uid: 'demo-google-user-' + Date.now(),
        email: 'demo@example.com',
        displayName: 'Demo User',
        photoURL: 'https://via.placeholder.com/150'
      } as User;
      
      const mockCredential = {
        user: mockUser,
        providerId: 'google.com',
        operationType: 'signIn'
      } as UserCredential;
      
      console.log('✅ Demo Google signup successful');
      return mockCredential;
    }
    
    throw error;
  }
  
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    await createUserProfile(userCredential.user);
    await updateLastLogin(userCredential.user.uid);
    return userCredential;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured. Please set up your Firebase environment variables.');
  }
  
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Get auth error message
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address. Please check your email or create a new account.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again or reset your password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later or reset your password.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/internal-error':
      return 'An internal error occurred. Please try again later.';
    default:
      return `An error occurred during authentication: ${errorCode}`;
  }
}; 