'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
  User
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

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

interface AuthContextType {
  user: any | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  refreshUserProfile: () => Promise<void>;
  error: string | null;
  login: (email?: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  signupWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}



const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: false,
  isConfigured: true,
  refreshUserProfile: async () => {},
  error: null,
  login: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  signupWithGoogle: async () => ({ success: false }),
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

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Start logged out

  // Firebase auth state listener
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setLoading(true);
      
      if (user) {
        // User is signed in
        const profile: UserProfile = {
          id: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          firstName: user.displayName?.split(' ')[0] || 'User',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          avatar: user.photoURL || undefined,
          plan: 'free', // Default plan, could be loaded from Firestore
          createdAt: user.metadata.creationTime || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        setUserProfile(profile);
        setIsAuthenticated(true);
        setError(null);
      } else {
        // User is signed out
        setUserProfile(null);
        setIsAuthenticated(false);
        setError(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Firebase login function
  const login = useCallback(async (email?: string, password?: string) => {
    if (!auth) {
      setError('Authentication service is not available');
      return { success: false, error: 'Authentication service is not available' };
    }

    if (!email || !password) {
      setError('Email and password are required');
      return { success: false, error: 'Email and password are required' };
    }

    try {
      setError(null);
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile from Firebase user
      const profile: UserProfile = {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        firstName: user.displayName?.split(' ')[0] || 'User',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        avatar: user.photoURL || undefined,
        plan: 'free', // Default plan
        createdAt: user.metadata.creationTime || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      setUserProfile(profile);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Login failed';
      
      // Handle Firebase Auth errors
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
        default:
          errorMessage = error.message || 'Login failed';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
      }, []);

  // Google login function
  const loginWithGoogle = useCallback(async () => {
    if (!auth || !googleProvider) {
      setError('Google authentication is not available');
      return { success: false, error: 'Google authentication is not available' };
    }

    try {
      setError(null);
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // User profile will be set by the auth state listener
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Google sign-in failed';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up was blocked by the browser';
      } else {
        errorMessage = error.message || 'Google sign-in failed';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Firebase signup function
  const signup = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    if (!auth) {
      setError('Authentication service is not available');
      return { success: false, error: 'Authentication service is not available' };
    }

    try {
      setError(null);
      setLoading(true);

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile with name
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      // Send email verification
      await sendEmailVerification(user);

      // User profile will be set by the auth state listener
      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Account creation failed';
      
      // Handle Firebase Auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email address already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use at least 6 characters';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support';
          break;
        default:
          errorMessage = error.message || 'Account creation failed';
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Google signup function
  const signupWithGoogle = useCallback(async () => {
    // Use the same logic as Google login since Google handles signup automatically
    return await loginWithGoogle();
  }, [loginWithGoogle]);

  // Firebase logout function
  const logout = useCallback(async () => {
    console.log('Logging out user...');
    setLoading(true);
    
    try {
      if (auth) {
        await signOut(auth);
      }
      
      // Clear all user data
      setIsAuthenticated(false);
      setUserProfile(null);
      setError(null);
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
    isConfigured: true,
    refreshUserProfile,
    error,
    login,
    loginWithGoogle,
    signup,
    signupWithGoogle,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 