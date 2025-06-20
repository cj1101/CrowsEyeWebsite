'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CrowsEyeAPI, type User, type LoginCredentials, type RegisterData } from '@/services/api';

// Enhanced user profile interface that matches our API
interface UserProfile extends User {
  plan: 'free' | 'creator' | 'pro' | 'growth' | 'payg';
  displayName: string;
  firstName: string;
  lastName: string;
  subscription_type?: 'monthly' | 'yearly' | 'lifetime';
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
  hasValidSubscription: () => boolean;
  requiresSubscription: () => boolean;
  needsPAYGSetup: () => boolean;
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
  hasValidSubscription: () => false,
  requiresSubscription: () => false,
  needsPAYGSetup: () => false,
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
    
    // Check for lifetime access based on promotional code usage
    const promoTier = localStorage.getItem('crowsEyePromoTier');
    const subscriptionType = promoTier === 'lifetime_pro' ? 'lifetime' : 'monthly';
    
    // Default to Pro plan for better demo experience
    const actualPlan = apiUser.subscription_tier || 'pro';
    
    return {
      ...apiUser,
      plan: actualPlan as 'free' | 'creator' | 'pro' | 'growth' | 'payg',
      subscription_tier: actualPlan as any, // Allow payg to be added to subscription_tier
      displayName: apiUser.name,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      subscription_type: subscriptionType,
    };
  };

  // Initialize auth state from stored token with enhanced persistence
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      const lastLoginTime = localStorage.getItem('last_login_time');
      const userEmail = localStorage.getItem('user_email');
      
      if (token) {
        // Check if token is recent (within 7 days) for better UX
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const isRecentLogin = lastLoginTime && parseInt(lastLoginTime) > sevenDaysAgo;
        
        try {
          // Verify token is still valid by getting current user
          const response = await api.getCurrentUser();
          if (response.data) {
            const userProfile = transformUserToProfile(response.data);
            
            setUser({ uid: userProfile.id, email: userProfile.email });
            setUserProfile(userProfile);
            setIsAuthenticated(true);
            setError(null);
            
            // Update last login time for persistence tracking
            localStorage.setItem('last_login_time', Date.now().toString());
            localStorage.setItem('user_email', userProfile.email);
            
            console.log('✅ Authentication restored from stored token');
          } else {
            throw new Error('No user data in response');
          }
        } catch (error: any) {
          console.warn('❌ Token validation failed:', error.message);
          
          // Only clear auth if it's actually an auth error, not a network error
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            // Clear all auth-related storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('last_login_time');
            localStorage.removeItem('user_email');
            setUser(null);
            setUserProfile(null);
            setIsAuthenticated(false);
            setError(null);
            console.log('🔐 Token expired, cleared authentication');
          } else if (isRecentLogin && userEmail) {
            // For network errors with recent login, keep user logged in but show offline state
            console.log('🌐 Network error but keeping user authenticated (recent login)');
            setUser({ uid: 'offline', email: userEmail });
            setIsAuthenticated(true);
            // Don't set error state to avoid confusing users
          } else {
            // Network error with old token - clear auth
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('last_login_time');
            localStorage.removeItem('user_email');
            setUser(null);
            setUserProfile(null);
            setIsAuthenticated(false);
            console.log('🌐 Network error with old token, cleared authentication');
          }
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, [api]);

  // Add periodic token validation
  useEffect(() => {
    if (!isAuthenticated) return;

    const validateToken = async () => {
      try {
        await api.getCurrentUser();
        console.log('🔄 Token validation successful');
      } catch (error: any) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          console.warn('❌ Token expired, logging out');
          logout();
        }
      }
    };

    // Validate token every 15 minutes (reduced frequency for better UX)
    const interval = setInterval(validateToken, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, api]);

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
        
        // Set user state and persistence data
        const userProfile = transformUserToProfile(response.data.user);
        setUser({ uid: userProfile.id, email: userProfile.email });
        setUserProfile(userProfile);
        setIsAuthenticated(true);
        setError(null);
        
        // Store persistence data for better session management
        localStorage.setItem('last_login_time', Date.now().toString());
        localStorage.setItem('user_email', userProfile.email);
        
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
      
      // Check for promotional codes
      const promoCode = localStorage.getItem('crowsEyePromoCode');
      const promoTier = localStorage.getItem('crowsEyePromoTier');
      
      let subscriptionTier: 'free' | 'creator' | 'growth' | 'pro' | 'payg' = 'free';
      
      // Check if user selected PAYG plan from URL
      const urlParams = new URLSearchParams(window.location.search);
      const planParam = urlParams.get('plan');
      
      // Set subscription tier based on promo code or plan selection
      if (promoTier === 'lifetime_pro') {
        subscriptionTier = 'pro'; // Lifetime Pro access
      } else if (promoCode) {
        subscriptionTier = 'creator'; // Default promo code access
      } else if (planParam === 'payg') {
        subscriptionTier = 'payg'; // Pay-as-you-go plan
      }
      
      const userData: RegisterData = {
        email,
        password,
        name: `${firstName} ${lastName}`.trim(),
        subscription_tier: subscriptionTier as any, // Allow PAYG to be set
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
        
        // Clear promotional codes after successful signup
        localStorage.removeItem('crowsEyePromoCode');
        localStorage.removeItem('crowsEyePromoTier');
        
        console.log('✅ Signup successful:', userProfile.email);
        console.log('📊 Subscription tier:', subscriptionTier);
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

  // Check if user has valid subscription
  const hasValidSubscription = useCallback(() => {
    if (!userProfile) return false;
    
    // Check if user has lifetime access
    const isLifetimeUser = userProfile.subscription_tier === 'pro' && 
                          userProfile.subscription_type === 'lifetime';
    
    // Check if user has any valid subscription (active monthly/yearly plans)
    const hasActiveSubscription = userProfile.subscription_status === 'active' &&
                                 ['creator', 'growth', 'pro'].includes(userProfile.subscription_tier);
    
    // For PAYG, check if they have completed payment setup (has stripe_customer_id)
    const hasPAYGSetup = (userProfile.subscription_tier as string) === 'payg' && 
                        userProfile.subscription_status === 'active';
    
    return isLifetimeUser || hasActiveSubscription || hasPAYGSetup;
  }, [userProfile]);

  // Check if user requires subscription setup
  const requiresSubscription = useCallback(() => {
    if (!userProfile) return true;
    
    // If user has valid subscription, no setup required
    if (hasValidSubscription()) return false;
    
    // If user is on 'free' tier, they need to choose a plan
    if ((userProfile.subscription_tier as string) === 'free') return true;
    
    // If user selected PAYG but hasn't completed setup, they need PAYG setup (not full subscription)
    if ((userProfile.subscription_tier as string) === 'payg' && userProfile.subscription_status !== 'active') {
      return false; // Allow access to setup PAYG, don't block completely
    }
    
    // Other cases require subscription
    return true;
  }, [userProfile, hasValidSubscription]);

  // Check if user needs PAYG setup specifically
  const needsPAYGSetup = useCallback(() => {
    if (!userProfile) return false;
    
    return (userProfile.subscription_tier as string) === 'payg' && 
           userProfile.subscription_status !== 'active';
  }, [userProfile]);

  // Enhanced logout function
  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('last_login_time');
      localStorage.removeItem('user_email');
      localStorage.removeItem('crowsEyePromoCode');
      localStorage.removeItem('crowsEyePromoTier');
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
      setError(null);
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
    hasValidSubscription,
    requiresSubscription,
    needsPAYGSetup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 