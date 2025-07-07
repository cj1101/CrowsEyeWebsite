import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_tier: 'free' | 'creator' | 'growth' | 'pro' | 'payg';
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  stripe_customer_id?: string;
  subscription_expires?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  email_verified?: boolean;
  usage_limits: {
    linked_accounts: number;
    max_linked_accounts: number;
    ai_credits: number;
    max_ai_credits: number;
    scheduled_posts: number;
    max_scheduled_posts: number;
    media_storage_mb: number;
    max_media_storage_mb: number;
  };
  plan_features: {
    basic_content_tools: boolean;
    media_library: boolean;
    smart_gallery: boolean;
    post_formatting: boolean;
    basic_video_tools: boolean;
    advanced_content: boolean;
    analytics: 'none' | 'basic' | 'enhanced' | 'advanced';
    team_collaboration: boolean;
    custom_branding: boolean;
    api_access: boolean;
    priority_support: boolean;
  };
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  data?: {
    access_token: string;
    refresh_token: string;
    user: User;
    expires_in?: number;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  subscription_tier?: 'free' | 'creator' | 'growth' | 'pro';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

const auth = getAuth(app);
const db = getFirestore(app);

// Default plan features based on subscription tier
const getDefaultPlanFeatures = (tier: string) => {
  switch (tier) {
    case 'pro':
      return {
        basic_content_tools: true,
        media_library: true,
        smart_gallery: true,
        post_formatting: true,
        basic_video_tools: true,
        advanced_content: true,
        analytics: 'advanced' as const,
        team_collaboration: true,
        custom_branding: true,
        api_access: true,
        priority_support: true,
      };
    case 'creator':
      return {
        basic_content_tools: true,
        media_library: true,
        smart_gallery: true,
        post_formatting: true,
        basic_video_tools: true,
        advanced_content: false,
        analytics: 'enhanced' as const,
        team_collaboration: false,
        custom_branding: false,
        api_access: true,
        priority_support: false,
      };
    default: // free
      return {
        basic_content_tools: true,
        media_library: true,
        smart_gallery: false,
        post_formatting: true,
        basic_video_tools: true,
        advanced_content: false,
        analytics: 'basic' as const,
        team_collaboration: false,
        custom_branding: false,
        api_access: false,
        priority_support: false,
      };
  }
};

// Default usage limits based on subscription tier
const getDefaultUsageLimits = (tier: string) => {
  switch (tier) {
    case 'pro':
      return {
        linked_accounts: 0,
        max_linked_accounts: 10,
        ai_credits: 1000,
        max_ai_credits: 1000,
        scheduled_posts: 0,
        max_scheduled_posts: 100,
        media_storage_mb: 0,
        max_media_storage_mb: 10000,
      };
    case 'creator':
      return {
        linked_accounts: 0,
        max_linked_accounts: 5,
        ai_credits: 500,
        max_ai_credits: 500,
        scheduled_posts: 0,
        max_scheduled_posts: 50,
        media_storage_mb: 0,
        max_media_storage_mb: 5000,
      };
    default: // free
      return {
        linked_accounts: 0,
        max_linked_accounts: 3,
        ai_credits: 100,
        max_ai_credits: 100,
        scheduled_posts: 0,
        max_scheduled_posts: 10,
        media_storage_mb: 0,
        max_media_storage_mb: 1000,
      };
  }
};

// Transform Firebase user to our User interface
const transformFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  // Get additional user data from Firestore
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  const userData = userDoc.exists() ? userDoc.data() : {};

  const subscription_tier = userData.subscription_tier || 'free';
  
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || userData.name || '',
    avatar_url: firebaseUser.photoURL || userData.avatar_url,
    subscription_tier: subscription_tier as 'free' | 'creator' | 'growth' | 'pro' | 'payg',
    subscription_status: userData.subscription_status || 'active',
    stripe_customer_id: userData.stripe_customer_id,
    subscription_expires: userData.subscription_expires,
    created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
    updated_at: userData.updated_at || new Date().toISOString(),
    last_login: firebaseUser.metadata.lastSignInTime,
    email_verified: firebaseUser.emailVerified,
    usage_limits: userData.usage_limits || getDefaultUsageLimits(subscription_tier),
    plan_features: userData.plan_features || getDefaultPlanFeatures(subscription_tier),
  };
};

export class FirebaseAuthService {
  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // Update display name
      await updateProfile(userCredential.user, {
        displayName: userData.name
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: userData.name,
        subscription_tier: userData.subscription_tier || 'free',
        subscription_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_limits: getDefaultUsageLimits(userData.subscription_tier || 'free'),
        plan_features: getDefaultPlanFeatures(userData.subscription_tier || 'free'),
      });

      const user = await transformFirebaseUser(userCredential.user);
      const token = await userCredential.user.getIdToken();

      return {
        success: true,
        data: {
          access_token: token,
          refresh_token: '', // Firebase handles refresh tokens automatically
          user,
        }
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Update last login time in Firestore
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const user = await transformFirebaseUser(userCredential.user);
      const token = await userCredential.user.getIdToken();

      return {
        success: true,
        data: {
          access_token: token,
          refresh_token: '', // Firebase handles refresh tokens automatically
          user,
        }
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    return await transformFirebaseUser(currentUser);
  }

  // Logout user
  async logout(): Promise<void> {
    await signOut(auth);
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user profile
  async updateProfile(profileData: Partial<User>): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'No user logged in' };
      }

      // Update Firebase profile
      if (profileData.name) {
        await updateProfile(currentUser, {
          displayName: profileData.name
        });
      }

      // Update Firestore data
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (profileData.name) updateData.name = profileData.name;
      if (profileData.avatar_url) updateData.avatar_url = profileData.avatar_url;
      if (profileData.subscription_tier) updateData.subscription_tier = profileData.subscription_tier;
      if (profileData.subscription_status) updateData.subscription_status = profileData.subscription_status;
      if (profileData.stripe_customer_id) updateData.stripe_customer_id = profileData.stripe_customer_id;
      if (profileData.subscription_expires) updateData.subscription_expires = profileData.subscription_expires;
      if (profileData.usage_limits) updateData.usage_limits = profileData.usage_limits;
      if (profileData.plan_features) updateData.plan_features = profileData.plan_features;

      await updateDoc(doc(db, 'users', currentUser.uid), updateData);

      const user = await transformFirebaseUser(currentUser);
      return { success: true, user };
    } catch (error: any) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  }

  // Apply promo code (updates subscription tier)
  async applyPromoCode(promoCode: string): Promise<{ success: boolean; error?: string; user?: User }> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'No user logged in' };
      }

      // Simple promo code logic - you can expand this
      let newTier = 'free';
      if (promoCode === 'TESTER_CROW_2024_LIFETIME_$7d91f3a8') {
        newTier = 'pro';
      }

      await updateDoc(doc(db, 'users', currentUser.uid), {
        subscription_tier: newTier,
        subscription_status: 'active',
        updated_at: new Date().toISOString(),
        usage_limits: getDefaultUsageLimits(newTier),
        plan_features: getDefaultPlanFeatures(newTier),
      });

      const user = await transformFirebaseUser(currentUser);
      return { success: true, user };
    } catch (error: any) {
      console.error('Promo code error:', error);
      return { success: false, error: error.message };
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await transformFirebaseUser(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  // Get current ID token
  async getIdToken(): Promise<string | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    return await currentUser.getIdToken();
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService(); 