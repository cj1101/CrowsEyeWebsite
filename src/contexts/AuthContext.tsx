'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
  User
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

// Mock user profile interface
interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  plan: 'free' | 'creator' | 'pro';
  createdAt: string;
  lastLoginAt: string;
}

// Auth context interface
interface AuthContextType {
  user: { uid: string; email: string } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  refreshUserProfile: () => Promise<void>;
  error: string | null;
  login: (email?: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: false,
  isConfigured: true,
  refreshUserProfile: async () => {},
  error: null,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: async () => {},
  isAuthenticated: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firebaseConfigured, setFirebaseConfigured] = useState(true);

  // Check Firebase configuration status
  useEffect(() => {
    const checkFirebaseConfig = () => {
      const configured = isFirebaseConfigured();
      setFirebaseConfigured(configured);
      
      if (!configured) {
        console.warn('🚨 Firebase not properly configured. Authentication will work in demo mode.');
        setError('Authentication service is running in demo mode. Some features may be limited.');
      }
    };

    checkFirebaseConfig();
  }, []);

  // Initialize auth state listener with better error handling
  useEffect(() => {
    if (!auth || !firebaseConfigured) {
      console.log('🎭 Firebase not available, skipping auth state listener');
      return;
    }

    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
        setLoading(true);
        
        try {
          if (user) {
            // Create mock user profile from Firebase user
            const profile: UserProfile = {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              firstName: user.displayName?.split(' ')[0] || '',
              lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
              avatar: user.photoURL || undefined,
              plan: 'free',
              createdAt: user.metadata.creationTime || new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };
            
            setUserProfile(profile);
            setIsAuthenticated(true);
            setError(null);
          } else {
            setUserProfile(null);
            setIsAuthenticated(false);
          }
        } catch (profileError) {
          console.error('Error processing user profile:', profileError);
          setError('Error processing user information');
        }
        
        setLoading(false);
      });
    } catch (listenerError) {
      console.error('Error setting up auth state listener:', listenerError);
      setError('Authentication service initialization failed');
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from auth state:', error);
        }
      }
    };
  }, [firebaseConfigured]);

  // Enhanced Firebase login function
  const login = useCallback(async (email?: string, password?: string) => {
    if (!email || !password) {
      const errorMsg = 'Email and password are required';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    if (!auth || !firebaseConfigured) {
      const errorMsg = 'Authentication service is not available. Please check your internet connection and try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setError(null);
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // User profile will be set by the auth state listener
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Login failed';
      
      // Handle Firebase Auth errors with better messages
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        default:
          errorMessage = error.message || 'Login failed. Please try again.';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [firebaseConfigured]);

  // Enhanced Firebase signup function
  const signup = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    if (!auth || !firebaseConfigured) {
      const errorMsg = 'Account creation service is not available. Please check your internet connection and try again.';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setError(null);
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's display name
      const displayName = `${firstName} ${lastName}`.trim();
      if (displayName) {
        try {
          await updateProfile(user, { displayName });
        } catch (updateError) {
          console.warn('Failed to update user profile:', updateError);
          // Don't fail the signup for this
        }
      }

      // Send email verification (optional - don't fail if it doesn't work)
      try {
        await sendEmailVerification(user);
      } catch (emailError) {
        console.warn('Failed to send verification email:', emailError);
        // Don't fail the signup for this
      }

      // User profile will be set by the auth state listener
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Account creation failed';
      
      // Handle Firebase Auth errors with better messages
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Account creation is currently disabled. Please contact support.';
          break;
        default:
          errorMessage = error.message || 'Account creation failed. Please try again.';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [firebaseConfigured]);

  // Enhanced Firebase logout function
  const logout = useCallback(async () => {
    console.log('Logging out user...');
    setLoading(true);
    
    try {
      if (auth && firebaseConfigured) {
        await signOut(auth);
      }
      
      // Clear all user data regardless of Firebase state
      setIsAuthenticated(false);
      setUserProfile(null);
      setError(null);
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear local state even if Firebase logout fails
      setIsAuthenticated(false);
      setUserProfile(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [firebaseConfigured]);

  // Mock refresh user profile function
  const refreshUserProfile = useCallback(async () => {
    // Only refresh if user is authenticated
    if (isAuthenticated && userProfile) {
      setUserProfile({
        ...userProfile,
        lastLoginAt: new Date().toISOString(),
      });
    }
  }, [userProfile, isAuthenticated]);

  const value: AuthContextType = {
    user: userProfile ? { uid: userProfile.id, email: userProfile.email } : null,
    userProfile,
    loading,
    isConfigured: firebaseConfigured,
    refreshUserProfile,
    error,
    login,
    signup,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 