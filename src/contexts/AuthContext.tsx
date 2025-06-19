'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CrowsEyeAPI, type User, type LoginCredentials, type RegisterData } from '@/services/api';

// Enhanced user profile interface that matches our API
interface UserProfile extends User {
  plan: 'free' | 'creator' | 'pro' | 'growth';
  displayName: string;
  firstName: string;
  lastName: string;
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
  const [api] = useState(() => new CrowsEyeAPI());
  const [user, setUser] = useState<{ uid: string; email: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper function to transform API user to UserProfile
  const transformUserToProfile = (apiUser: User): UserProfile => {
    const nameParts = apiUser.name.split(' ');
    return {
      ...apiUser,
      plan: apiUser.subscription_tier as 'free' | 'creator' | 'pro' | 'growth',
      displayName: apiUser.name,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
    };
  };

  // Initialize auth state from stored token
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Verify token is still valid by getting current user
          const response = await api.getCurrentUser();
          if (response.data) {
            const userProfile = transformUserToProfile(response.data);
            
            setUser({ uid: userProfile.id, email: userProfile.email });
            setUserProfile(userProfile);
            setIsAuthenticated(true);
            setError(null);
            
            console.log('✅ Authentication restored from stored token');
          }
        } catch (error: any) {
          console.warn('❌ Stored token is invalid, removing');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
          setUserProfile(null);
          setIsAuthenticated(false);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, [api]);

  // Refresh user profile
  const refreshUserProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.getCurrentUser();
      if (response.data) {
        const userProfile = transformUserToProfile(response.data);
        
        setUser({ uid: userProfile.id, email: userProfile.email });
        setUserProfile(userProfile);
      }
    } catch (error: any) {
      console.error('Failed to refresh user profile:', error);
      setError('Failed to refresh user profile');
    }
  }, [api, isAuthenticated]);

  // Enhanced API login function
  const login = useCallback(async (email?: string, password?: string) => {
    if (!email || !password) {
      const errorMsg = 'Email and password are required';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setError(null);
      setLoading(true);

      console.log('🔐 Attempting login with API...');
      
      const credentials: LoginCredentials = { email, password };
      const response = await api.login(credentials);
      
      console.log('🔍 Login response:', response);
      
      // Check if response indicates success
      if (response.success === false) {
        throw new Error(response.error || 'Login failed');
      }
      
      // Store tokens and set user state only if response.data exists
      if (response.data?.access_token && response.data?.user) {
        localStorage.setItem('auth_token', response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }
        
        // Set user state
        const userProfile = transformUserToProfile(response.data.user);
        setUser({ uid: userProfile.id, email: userProfile.email });
        setUserProfile(userProfile);
        setIsAuthenticated(true);
        
        console.log('✅ Login successful:', userProfile.email);
        return { success: true };
      } else {
        console.error('❌ Invalid response structure:', response);
        throw new Error('Invalid response from server');
      }
      
    } catch (error: any) {
      let errorMessage = 'Login failed';
      
      // Handle API errors with better messages
      const status = error?.response?.status;
      const apiError = error?.response?.data?.error;
      
      if (status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (status === 429) {
        errorMessage = 'Too many login attempts. Please try again later';
      } else if (status === 500) {
        errorMessage = 'Server error. Please try again later';
      } else if (status === 502) {
        errorMessage = 'Service temporarily unavailable. Please try again later';
      } else if (apiError) {
        errorMessage = apiError;
      } else if (error?.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please check your internet connection';
      } else if (error?.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      console.error('❌ Login failed:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Enhanced API signup function
  const signup = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    if (!email || !password || !firstName) {
      const errorMsg = 'Email, password, and first name are required';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setError(null);
      setLoading(true);

      console.log('📝 Attempting signup with API...');
      
      const userData: RegisterData = {
        email,
        password,
        name: `${firstName} ${lastName}`.trim(),
      };
      
      const response = await api.register(userData);
      
      console.log('🔍 Signup response:', response);
      
      // Check if response indicates success
      if (response.success === false) {
        throw new Error(response.error || 'Registration failed');
      }
      
      // Store tokens and set user state only if response.data exists
      if (response.data?.access_token && response.data?.user) {
        localStorage.setItem('auth_token', response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }
        
        // Set user state
        const userProfile = transformUserToProfile(response.data.user);
        setUser({ uid: userProfile.id, email: userProfile.email });
        setUserProfile(userProfile);
        setIsAuthenticated(true);
        
        console.log('✅ Signup successful:', userProfile.email);
        return { success: true };
      } else {
        console.error('❌ Invalid signup response structure:', response);
        throw new Error('Invalid response from server');
      }
      
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      
      // Handle API errors with better messages
      const status = error?.response?.status;
      const apiError = error?.response?.data?.error;
      
      if (status === 409) {
        errorMessage = 'An account with this email already exists';
      } else if (status === 400) {
        errorMessage = 'Invalid registration data. Please check your information';
      } else if (status === 500) {
        errorMessage = 'Server error. Please try again later';
      } else if (status === 502) {
        errorMessage = 'Service temporarily unavailable. Please try again later';
      } else if (apiError) {
        errorMessage = apiError;
      } else if (error?.code === 'ECONNABORTED') {
        errorMessage = 'Connection timeout. Please check your internet connection';
      } else if (error?.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      console.error('❌ Signup failed:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Enhanced logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Call API logout (best effort)
      try {
        await api.logout();
        console.log('✅ API logout successful');
      } catch (error) {
        console.warn('❌ API logout failed, but continuing with local logout');
      }
      
      // Clear local state and storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
      setError(null);
      
      console.log('✅ Local logout successful');
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      setError('Logout failed');
    } finally {
      setLoading(false);
    }
  }, [api]);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isConfigured: true, // API is always considered configured
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