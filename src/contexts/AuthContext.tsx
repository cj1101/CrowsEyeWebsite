'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, Unsubscribe } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { getUserProfile, UserProfile } from '@/lib/auth';
import { apiFetch, setAuthToken, getAuthToken, API_ENDPOINTS } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  refreshUserProfile: () => Promise<void>;
  error: string | null;
  // New API auth methods
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isConfigured: false,
  refreshUserProfile: async () => {},
  error: null,
  login: async () => ({ success: false }),
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
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured] = useState(() => isFirebaseConfigured());
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // API login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      const response = await apiFetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data?.token) {
        // Set token in API client
        setAuthToken(response.data.token);
        
        // Set httpOnly cookie for token storage
        document.cookie = `ce_token=${response.data.token}; path=/; httpOnly; secure; samesite=strict`;
        
        setIsAuthenticated(true);
        
        // If user data is returned, update profile
        if (response.data.user) {
          setUserProfile(response.data.user);
        }

        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // API logout function
  const logout = useCallback(async () => {
    try {
      // Call API logout endpoint
      await apiFetch(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
      });
    } catch (error) {
      console.warn('API logout failed:', error);
    } finally {
      // Clear token regardless of API call success
      setAuthToken(null);
      
      // Clear cookie
      document.cookie = 'ce_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      setIsAuthenticated(false);
      setUserProfile(null);
      setUser(null);
    }
  }, []);

  // Refresh user profile function
  const refreshUserProfile = useCallback(async () => {
    console.log('🔄 Refreshing user profile...');
    
    if (!user && !isAuthenticated) {
      console.log('👤 No user to refresh profile for');
      setUserProfile(null);
      return;
    }

    try {
      setError(null);
      
      // If we have Firebase user, use existing logic
      if (user) {
        console.log('📡 Fetching Firebase user profile for:', user.uid);
        const profile = await getUserProfile(user.uid);
        
        if (profile) {
          console.log('✅ Firebase user profile refreshed successfully');
          setUserProfile(profile);
        } else {
          console.warn('⚠️ Firebase user profile not found during refresh');
          setUserProfile(null);
        }
      }
      // If we have API authentication, we could fetch profile from API here
      // For now, we'll rely on the profile data from login
      
    } catch (error) {
      console.error('❌ Error refreshing user profile:', error);
      setError('Failed to load user profile');
      setUserProfile(null);
    }
  }, [user, isAuthenticated]);

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
        // Only clear profile if we don't have API authentication
        if (!isAuthenticated) {
          setUserProfile(null);
        }
      }
    } catch (error) {
      console.error('❌ Error handling auth state change:', error);
      setError('Authentication error occurred');
      if (!isAuthenticated) {
        setUserProfile(null);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

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
      if (!isAuthenticated) {
        setUserProfile(null);
      }
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
      isAuthenticated,
      error,
      timestamp: new Date().toISOString()
    });
  }, [user, userProfile, loading, isConfigured, isAuthenticated, error]);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isConfigured,
    refreshUserProfile,
    error,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 