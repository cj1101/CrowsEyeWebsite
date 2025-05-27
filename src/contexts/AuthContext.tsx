'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, Unsubscribe } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { getUserProfile, UserProfile } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  refreshUserProfile: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isConfigured: false,
  refreshUserProfile: async () => {},
  error: null,
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
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured] = useState(() => isFirebaseConfigured());

  // Refresh user profile function
  const refreshUserProfile = useCallback(async () => {
    console.log('🔄 Refreshing user profile...');
    
    if (!user) {
      console.log('👤 No user to refresh profile for');
      setUserProfile(null);
      return;
    }

    try {
      setError(null);
      console.log('📡 Fetching user profile for:', user.uid);
      const profile = await getUserProfile(user.uid);
      
      if (profile) {
        console.log('✅ User profile refreshed successfully');
        setUserProfile(profile);
      } else {
        console.warn('⚠️ User profile not found during refresh');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('❌ Error refreshing user profile:', error);
      setError('Failed to load user profile');
      setUserProfile(null);
    }
  }, [user]);

  // Handle auth state changes
  const handleAuthStateChange = useCallback(async (firebaseUser: User | null) => {
    console.log('🔄 Auth state changed:', firebaseUser ? `User: ${firebaseUser.uid}` : 'No user');
    
    try {
      setError(null);
      setUser(firebaseUser);
      
      if (firebaseUser) {
        console.log('👤 User authenticated, fetching profile...');
        console.log('📧 User email:', firebaseUser.email);
        console.log('🏷️ User display name:', firebaseUser.displayName);
        
        const profile = await getUserProfile(firebaseUser.uid);
        
        if (profile) {
          console.log('✅ User profile loaded successfully');
          setUserProfile(profile);
        } else {
          console.warn('⚠️ User profile not found, user may need to complete setup');
          setUserProfile(null);
        }
      } else {
        console.log('👤 User signed out, clearing profile');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('❌ Error handling auth state change:', error);
      setError('Authentication error occurred');
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up Firebase auth listener
  useEffect(() => {
    console.log('🔧 AuthContext: Initializing authentication listener');
    console.log('🔧 Firebase configured:', isConfigured);
    
    if (!isConfigured || !auth) {
      console.log('🎭 AuthContext: Firebase not configured, running in demo mode');
      setLoading(false);
      setError(null);
      
      // In demo mode, simulate a logged-out state
      setUser(null);
      setUserProfile(null);
      return;
    }

    let unsubscribe: Unsubscribe;

    try {
      console.log('🔧 Setting up Firebase auth state listener');
      unsubscribe = onAuthStateChanged(auth, handleAuthStateChange, (error) => {
        console.error('❌ Firebase auth state listener error:', error);
        setError('Authentication service error');
        setLoading(false);
      });

      console.log('✅ Firebase auth state listener established');
    } catch (error) {
      console.error('❌ Failed to set up auth state listener:', error);
      setError('Failed to initialize authentication');
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        console.log('🧹 Cleaning up Firebase auth state listener');
        unsubscribe();
      }
    };
  }, [isConfigured, handleAuthStateChange]);

  // Debug logging for auth state
  useEffect(() => {
    console.log('🔧 AuthContext State Update:', {
      hasUser: !!user,
      hasProfile: !!userProfile,
      loading,
      isConfigured,
      error,
      timestamp: new Date().toISOString()
    });
  }, [user, userProfile, loading, isConfigured, error]);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isConfigured,
    refreshUserProfile,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 