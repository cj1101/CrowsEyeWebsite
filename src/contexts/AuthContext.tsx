'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

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
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Mock user data for demo
const mockUserProfile: UserProfile = {
  id: 'demo-user-123',
  email: 'demo@crowseye.com',
  displayName: 'Demo User',
  firstName: 'Demo',
  lastName: 'User',
  avatar: '/images/avatar-placeholder.png',
  plan: 'creator',
  createdAt: '2024-01-01T00:00:00Z',
  lastLoginAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: false,
  isConfigured: true,
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Start logged out

  // Mock login function
  const login = useCallback(async (email?: string, _password?: string) => {
    try {
      setError(null);
      setLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Set user as authenticated with mock profile
      setIsAuthenticated(true);
      setUserProfile({
        ...mockUserProfile,
        email: email || mockUserProfile.email,
        lastLoginAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function - properly clears all user data
  const logout = useCallback(async () => {
    console.log('Logging out user...');
    setLoading(true);
    
    try {
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
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 