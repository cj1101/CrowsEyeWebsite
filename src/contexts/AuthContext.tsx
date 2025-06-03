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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(mockUserProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Always authenticated in demo

  // Mock login function
  const login = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Always succeed in demo mode
      setIsAuthenticated(true);
      setUserProfile(mockUserProfile);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Mock logout function
  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    setUserProfile(null);
  }, []);

  // Mock refresh user profile function
  const refreshUserProfile = useCallback(async () => {
    // In demo mode, just update the last login time
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        lastLoginAt: new Date().toISOString(),
      });
    }
  }, [userProfile]);

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