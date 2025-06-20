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
  stripe_customer_id?: string;
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
  hasValidSubscriptionAsync: () => Promise<boolean>;
  requiresSubscription: () => boolean;
  needsPAYGSetup: () => boolean;
  needsPAYGSetupAsync: () => Promise<boolean>;
  updateUserSubscription: (stripeCustomerId: string, subscriptionId?: string) => Promise<{ success: boolean; error?: string }>;
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
  hasValidSubscriptionAsync: async () => false,
  requiresSubscription: () => false,
  needsPAYGSetup: () => false,
  needsPAYGSetupAsync: async () => false,
  updateUserSubscription: async () => ({ success: false }),
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
    
    // Start with the backend's subscription_tier as the source of truth
    let actualPlan: 'free' | 'creator' | 'pro' | 'growth' | 'payg' = apiUser.subscription_tier || 'free';
    
    console.log('🔍 Plan Detection Debug:', {
      backendTier: apiUser.subscription_tier,
      hasStripeCustomerId: !!apiUser.stripe_customer_id,
      subscriptionStatus: apiUser.subscription_status,
      promoTier,
      initialPlan: actualPlan,
      fullUserData: apiUser
    });

    // Enhanced plan detection logic
    if (promoTier === 'lifetime_pro') {
      console.log('🎁 Detected lifetime Pro user via promo code');
      actualPlan = 'pro';
    } else if ((actualPlan === 'free' || !actualPlan) && apiUser.stripe_customer_id) {
      console.log('🎯 User has Stripe customer ID but marked as free - likely PAYG user');
      actualPlan = 'payg';
    } else if (apiUser.subscription_status === 'active' && ['creator', 'growth', 'pro'].includes(actualPlan)) {
      console.log('✅ User has active subscription:', actualPlan);
    } else if (actualPlan === 'free' && apiUser.subscription_status === 'active') {
      console.log('⚠️ User marked as free but has active subscription - data mismatch');
      // This suggests the backend data is out of sync
    }
    
    console.log('✅ Final plan assigned:', actualPlan);
    
    return {
      ...apiUser,
      plan: actualPlan,
      subscription_tier: actualPlan as any,
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
            
            // Sync subscription status to ensure data is up to date
            try {
              await api.syncSubscriptionStatus();
              console.log('🔄 Subscription sync completed');
              // Refresh user profile after sync
              const updatedResponse = await api.getCurrentUser();
              if (updatedResponse.data) {
                const updatedProfile = transformUserToProfile(updatedResponse.data);
                setUserProfile(updatedProfile);
                console.log('✅ User profile refreshed after sync');
              }
            } catch (syncError) {
              console.warn('⚠️ Subscription sync failed (non-critical):', syncError);
            }
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

  // Sync subscription status with backend when data seems incorrect
  const syncSubscriptionStatus = useCallback(async () => {
    if (!userProfile || !isAuthenticated) return;
    
    try {
      console.log('🔄 Syncing subscription status with backend...');
      const response = await api.getSubscriptionStatus();
      
      if (response.data.success && response.data.data) {
        const backendData = response.data.data;
        
        console.log('📊 Backend subscription data:', backendData);
        
        // If backend data shows different plan than what we have locally
        if (backendData.plan !== userProfile.subscription_tier) {
          console.log('🔄 Plan mismatch detected, refreshing user profile...');
          await refreshUserProfile();
        }
      }
    } catch (error) {
      console.error('Failed to sync subscription status:', error);
    }
  }, [userProfile, isAuthenticated, api, refreshUserProfile]);

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

  // Check if user has valid subscription - sync version for backward compatibility
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
                        !!userProfile.stripe_customer_id;
    
    return isLifetimeUser || hasActiveSubscription || hasPAYGSetup;
  }, [userProfile]);

  // Check if user has valid subscription - async version using API
  const hasValidSubscriptionAsync = useCallback(async () => {
    if (!userProfile || !isAuthenticated) return false;
    
    try {
      // Use API to get real-time subscription status
      const response = await api.getSubscriptionStatus();
      
      if (response.data.success && response.data.data) {
        const subscriptionData = response.data.data;
        
        // Check various valid subscription states
        const isLifetimeUser = subscriptionData.plan === 'pro' && 
                              localStorage.getItem('crowsEyePromoTier') === 'lifetime_pro';
        
        const hasActiveSubscription = subscriptionData.subscriptionStatus === 'active' &&
                                     ['creator', 'growth', 'pro'].includes(subscriptionData.plan);
        
        const hasPAYGSetup = subscriptionData.plan === 'payg' && 
                            !!subscriptionData.stripeCustomerId;
        
        return isLifetimeUser || hasActiveSubscription || hasPAYGSetup;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      // Fallback to local check if API fails
      return hasValidSubscription();
    }
  }, [userProfile, isAuthenticated, api, hasValidSubscription]);

  // Check if user requires subscription setup - simplified
  const requiresSubscription = useCallback(() => {
    if (!userProfile) return true;
    
    // For PAYG users without stripe_customer_id, they need setup but not full subscription
    if (userProfile.subscription_tier === 'payg' && !userProfile.stripe_customer_id) {
      return false; // Allow access to setup PAYG
    }
    
    // All other free tier users need subscription
    return userProfile.subscription_tier === 'free';
  }, [userProfile]);

  // Check if user needs PAYG setup specifically - sync version
  const needsPAYGSetup = useCallback(() => {
    if (!userProfile) return false;
    
    return userProfile.subscription_tier === 'payg' && !userProfile.stripe_customer_id;
  }, [userProfile]);

  // Check if user needs PAYG setup specifically - async version using API
  const needsPAYGSetupAsync = useCallback(async () => {
    if (!userProfile || !isAuthenticated) return false;
    
    try {
      const response = await api.getSubscriptionStatus();
      
      if (response.data.success && response.data.data) {
        const subscriptionData = response.data.data;
        return subscriptionData.plan === 'payg' && !subscriptionData.stripeCustomerId;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check PAYG setup status:', error);
      // Fallback to local check
      return needsPAYGSetup();
    }
  }, [userProfile, isAuthenticated, api, needsPAYGSetup]);

  // Update user subscription after PAYG setup
  const updateUserSubscription = useCallback(async (stripeCustomerId: string, subscriptionId?: string) => {
    try {
      console.log('🔄 Updating user subscription with API...');
      
      const response = await api.updatePAYGCustomer(stripeCustomerId, subscriptionId);
      
      if (response.data.success) {
        // Refresh user profile to get updated subscription data
        await refreshUserProfile();
        
        console.log('✅ User subscription updated successfully');
        return { success: true };
      } else {
        throw new Error(response.data.error || 'Failed to update subscription');
      }
    } catch (error: any) {
      console.error('❌ Update user subscription failed:', error);
      return { 
        success: false, 
        error: error?.response?.data?.error || error.message || 'Failed to update subscription'
      };
    }
  }, [api, refreshUserProfile]);

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
    hasValidSubscriptionAsync: hasValidSubscriptionAsync,
    requiresSubscription,
    needsPAYGSetup,
    needsPAYGSetupAsync: needsPAYGSetupAsync,
    updateUserSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 