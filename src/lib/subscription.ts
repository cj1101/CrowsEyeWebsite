import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { SubscriptionStatus, SubscriptionTier } from './stripe';

export interface UserSubscription {
  tier: SubscriptionTier | 'spark' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing';
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  hasByok?: boolean;
  updatedAt: Date;
}

export const updateUserSubscription = async (
  userId: string,
  subscriptionData: Partial<UserSubscription>
): Promise<void> => {
  console.log('📝 Updating subscription for user:', userId, subscriptionData);

  if (!isFirebaseConfigured() || !db) {
    console.log('🎭 Demo mode: Simulating subscription update');
    return;
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.warn('⚠️ User document not found, creating new one');
      await setDoc(userRef, {
        uid: userId,
        subscription: {
          ...subscriptionData,
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });
    } else {
      await updateDoc(userRef, {
        subscription: {
          ...subscriptionData,
          updatedAt: new Date(),
        },
      });
    }

    console.log('✅ User subscription updated successfully');
  } catch (error) {
    console.error('❌ Error updating user subscription:', error);
    throw error;
  }
};

export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  console.log('👤 Fetching subscription for user:', userId);

  if (!isFirebaseConfigured() || !db) {
    console.log('🎭 Demo mode: Returning mock subscription');
    return {
      tier: 'spark',
      status: 'active',
      updatedAt: new Date(),
    };
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.subscription || null;
    }

    return null;
  } catch (error) {
    console.error('❌ Error fetching user subscription:', error);
    return null;
  }
};

export const cancelUserSubscription = async (
  userId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<void> => {
  console.log('❌ Cancelling subscription for user:', userId);

  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error('No subscription found for user');
  }

  await updateUserSubscription(userId, {
    ...subscription,
    status: cancelAtPeriodEnd ? 'active' : 'cancelled',
    cancelAtPeriodEnd,
  });
};

export const reactivateUserSubscription = async (userId: string): Promise<void> => {
  console.log('✅ Reactivating subscription for user:', userId);

  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error('No subscription found for user');
  }

  await updateUserSubscription(userId, {
    ...subscription,
    status: 'active',
    cancelAtPeriodEnd: false,
  });
};

export const getSubscriptionFeatures = (tier: string): {
  socialSets: number | string;
  aiCredits: number | string;
  aiEdits: number | string;
  videoSuite: string;
  storageGB: number | string;
  contextFiles: number | string;
  analytics: string;
  support: string;
  seats: number | string;
} => {
  const features = {
    spark: {
      socialSets: 1,
      aiCredits: 50,
      aiEdits: 5,
      videoSuite: 'Basic Image Analysis',
      storageGB: 1,
      contextFiles: 1,
      analytics: 'Basic',
      support: 'Community',
      seats: 1,
    },
    creator: {
      socialSets: 3,
      aiCredits: 300,
      aiEdits: 30,
      videoSuite: 'Basic Video Processing',
      storageGB: 10,
      contextFiles: 3,
      analytics: 'Basic',
      support: 'Email',
      seats: 1,
    },
    growth: {
      socialSets: 6,
      aiCredits: 600,
      aiEdits: 60,
      videoSuite: 'Basic Video Processing',
      storageGB: 50,
      contextFiles: 5,
      analytics: 'Advanced',
      support: 'Priority',
      seats: 3,
    },
    pro: {
      socialSets: 15,
      aiCredits: 1000,
      aiEdits: 120,
      videoSuite: 'Full Video Processing Suite',
      storageGB: 200,
      contextFiles: 10,
      analytics: 'Advanced',
      support: 'Priority',
      seats: 10,
    },
    enterprise: {
      socialSets: 'Unlimited',
      aiCredits: 'Custom',
      aiEdits: 'Custom',
      videoSuite: 'Full Video Processing Suite',
      storageGB: 'Custom',
      contextFiles: 'Custom',
      analytics: 'Custom',
      support: 'Dedicated Account Manager',
      seats: 'Unlimited',
    },
  };

  return features[tier as keyof typeof features] || features.spark;
};

export const hasFeatureAccess = (
  userTier: string,
  requiredTier: string
): boolean => {
  const tierHierarchy = ['spark', 'creator', 'growth', 'pro', 'enterprise'];
  const userIndex = tierHierarchy.indexOf(userTier);
  const requiredIndex = tierHierarchy.indexOf(requiredTier);
  
  return userIndex >= requiredIndex;
}; 