'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { UserService } from '@/lib/firestore';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { UserDocument } from '@/lib/firestore/types';

// Enhanced user profile interface that matches Firestore
interface UserProfile extends UserDocument {
  plan: 'free' | 'creator' | 'pro' | 'growth' | 'payg';
  subscription_tier: 'free' | 'creator' | 'pro' | 'growth' | 'payg';
  displayName: string;
  firstName: string;
  lastName: string;
  subscription_type?: 'monthly' | 'yearly' | 'lifetime';
  avatar_url?: string;
}

// Auth context interface
interface AuthContextType {
  user: { uid: string; email: string } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  refreshUserProfile: () => Promise<void>;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; isNewUser?: boolean }>;
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
  loginWithGoogle: async () => ({ success: false }),
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
  const [user, setUser] = useState<{ uid: string; email: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper function to transform Firestore user to UserProfile
  const transformUserToProfile = (firestoreUser: UserDocument): UserProfile => {
    const nameParts = (firestoreUser.fullName || '').split(' ');
    
    // Check for lifetime access based on promotional code usage
    const promoTier = localStorage.getItem('crowsEyePromoTier');
    const subscriptionType = promoTier === 'lifetime_pro' ? 'lifetime' : 'monthly';
    
    // Start with the backend's subscription_tier as the source of truth
    let actualPlan: 'free' | 'creator' | 'pro' | 'growth' | 'payg' = 'free';
    
    // Handle subscription tier mapping
    const tier = firestoreUser.subscriptionTier;
    if (tier && ['free', 'creator', 'pro', 'growth', 'payg'].includes(tier)) {
      actualPlan = tier as 'free' | 'creator' | 'pro' | 'growth' | 'payg';
    } else if (tier === 'spark') {
      actualPlan = 'creator'; // Map spark to creator tier
    }
    
    console.log('🔍 Plan Detection Debug:', {
      firestoreTier: firestoreUser.subscriptionTier,
      hasStripeCustomerId: !!firestoreUser.stripeCustomerId,
      promoTier,
      initialPlan: actualPlan,
      fullUserData: firestoreUser
    });

    // Enhanced plan detection logic
    if (promoTier === 'lifetime_pro') {
      console.log('🎁 Detected lifetime Pro user via promo code');
      actualPlan = 'pro';
    } else if ((actualPlan === 'free' || !actualPlan) && firestoreUser.stripeCustomerId) {
      console.log('🎯 User has Stripe customer ID but marked as free - likely PAYG user');
      actualPlan = 'payg';
    } else if (['creator', 'growth', 'pro'].includes(actualPlan)) {
      console.log('✅ User has subscription:', actualPlan);
    }
    
    console.log('✅ Final plan assigned:', actualPlan);
    
    return {
      ...firestoreUser,
      plan: actualPlan,
      subscription_tier: actualPlan,
      displayName: firestoreUser.fullName || firestoreUser.username || '',
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      subscription_type: subscriptionType,
    };
  };

  // Initialize auth state listener
  useEffect(() => {
    // If Firebase auth failed to initialize, avoid setting up a listener to prevent runtime errors
    if (!auth) {
      console.warn('⚠️ Firebase auth is not initialized. Skipping auth state listener.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userProfileData = await UserService.getUser(firebaseUser.uid);
          
          if (userProfileData) {
            const transformedProfile = transformUserToProfile(userProfileData);
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email || '' });
            setUserProfile(transformedProfile);
            setIsAuthenticated(true);
            setError(null);
            console.log('✅ User authenticated via Firebase Auth');
          } else {
            // This case can happen if a user is created in Auth but not in Firestore
            // For now, we'll treat it as a logged-out state
            console.warn('⚠️ Firebase user found but no Firestore profile. Logging out.');
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
            setIsAuthenticated(false);
          }
        } catch (error: any) {
          console.error('❌ Error fetching user profile:', error);
          setUser(null);
          setUserProfile(null);
          setIsAuthenticated(false);
          setError(error.message || 'Failed to load user profile');
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setIsAuthenticated(false);
        setError(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Refresh user profile
  const refreshUserProfile = useCallback(async () => {
    if (!auth.currentUser) return;
    
    try {
      const userProfileData = await UserService.getUser(auth.currentUser.uid);
      if (userProfileData) {
        const transformedProfile = transformUserToProfile(userProfileData);
        setUserProfile(transformedProfile);
      }
    } catch (error: any) {
      console.error('❌ Error refreshing user profile:', error);
      setError(error.message || 'Failed to refresh user profile');
    }
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the UserService to sign in directly with Firebase
      await UserService.signIn(email, password);
      
      // onAuthStateChanged will handle setting the user state
      console.log('✅ Login successful (Firebase direct)');
      return { success: true };
      
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      setError(error.message || 'Login failed');
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Login with Google function
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: firestoreUser, authUser, isNewUser } = await UserService.signInWithGoogle();
      const transformedProfile = transformUserToProfile(firestoreUser);
      
      setUser({ uid: authUser.uid, email: authUser.email || '' });
      setUserProfile(transformedProfile);
      setIsAuthenticated(true);
      
      console.log('✅ Login with Google successful', isNewUser ? '(New user)' : '(Existing user)');
      return { success: true, isNewUser };
    } catch (error: any) {
      console.error('❌ Login with Google failed:', error);
      const customErrorMessage = "Google is currently unavailable. Please sign up regularly for now";
      setError(customErrorMessage);
      return { success: false, error: customErrorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Signup function
  const signup = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    console.log(`[TEMP LOG] AuthContext.signup: Called with email: ${email}, firstName: ${firstName}, lastName: ${lastName}`);
    try {
      setLoading(true);
      setError(null);
      
      const username = email.split('@')[0]; // Generate username from email
      const fullName = `${firstName} ${lastName}`.trim();
      
      console.log(`[TEMP LOG] AuthContext.signup: Calling UserService.register with username: ${username}, fullName: ${fullName}`);
      const { user: firestoreUser, authUser } = await UserService.register(email, password, username, fullName);
      const transformedProfile = transformUserToProfile(firestoreUser);
      
      setUser({ uid: authUser.uid, email: authUser.email || '' });
      setUserProfile(transformedProfile);
      setIsAuthenticated(true);
      
      console.log('✅ [TEMP LOG] AuthContext.signup: Signup successful');
      return { success: true };
    } catch (error: any) {
      console.error('❌ [TEMP LOG] AuthContext.signup: Signup failed. Error:', error);
      setError(error.message || 'Signup failed');
      return { success: false, error: error.message || 'Signup failed' };
    } finally {
      setLoading(false);
      console.log(`[TEMP LOG] AuthContext.signup: Finished for email: ${email}`);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear local storage
      localStorage.removeItem('crowsEyePromoTier');
      
      setUser(null);
      setUserProfile(null);
      setIsAuthenticated(false);
      setError(null);
      
      console.log('✅ Logout successful');
    } catch (error: any) {
      console.error('❌ Logout failed:', error);
      setError(error.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user has valid subscription
  const hasValidSubscription = useCallback(() => {
    if (!userProfile) return false;
    
    // Pro tier users with lifetime access via promo
    const promoTier = localStorage.getItem('crowsEyePromoTier');
    if (promoTier === 'lifetime_pro') return true;
    
    // Paid subscription tiers
    return ['creator', 'pro', 'growth', 'payg'].includes(userProfile.plan);
  }, [userProfile]);

  // Async version for consistency
  const hasValidSubscriptionAsync = useCallback(async () => {
    return hasValidSubscription();
  }, [hasValidSubscription]);

  // Check if feature requires subscription
  const requiresSubscription = useCallback(() => {
    return !hasValidSubscription();
  }, [hasValidSubscription]);

  // Check if user needs PAYG setup
  const needsPAYGSetup = useCallback(() => {
    if (!userProfile) return false;
    return userProfile.plan === 'payg' && !userProfile.stripeCustomerId;
  }, [userProfile]);

  // Async version for consistency
  const needsPAYGSetupAsync = useCallback(async () => {
    return needsPAYGSetup();
  }, [needsPAYGSetup]);

  // Update user subscription (for Stripe integration)
  const updateUserSubscription = useCallback(async (stripeCustomerId: string, subscriptionId?: string) => {
    try {
      if (!auth.currentUser) throw new Error('User not authenticated');
      
      await UserService.updateStripeCustomerId(auth.currentUser.uid, stripeCustomerId);
      
      // Refresh user profile to get updated data
      await refreshUserProfile();
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Failed to update subscription:', error);
      return { success: false, error: error.message || 'Failed to update subscription' };
    }
  }, [refreshUserProfile]);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isConfigured: !!auth, // Firebase is configured if auth service is available
    refreshUserProfile,
    error,
    login,
    loginWithGoogle,
    signup,
    logout,
    isAuthenticated,
    hasValidSubscription,
    hasValidSubscriptionAsync,
    requiresSubscription,
    needsPAYGSetup,
    needsPAYGSetupAsync,
    updateUserSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 