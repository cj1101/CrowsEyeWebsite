import { where, QueryConstraint } from 'firebase/firestore';
import { FirestoreService } from '../base';
import { UserDocument, COLLECTIONS } from '../types';
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

export class UserService {
  private static collection = COLLECTIONS.USERS;

  // Create a new user (called after Firebase Auth registration)
  static async createUser(
    uid: string,
    data: Omit<UserDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<UserDocument> {
    return FirestoreService.create<UserDocument>(this.collection, { ...data } as UserDocument, uid);
  }

  // Get user by ID
  static async getUser(uid: string): Promise<UserDocument | null> {
    return FirestoreService.get<UserDocument>(this.collection, uid);
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<UserDocument | null> {
    const constraints: QueryConstraint[] = [where('email', '==', email)];
    const results = await FirestoreService.query<UserDocument>(this.collection, constraints);
    return results.length > 0 ? results[0] : null;
  }

  // Get user by username
  static async getUserByUsername(username: string): Promise<UserDocument | null> {
    const constraints: QueryConstraint[] = [where('username', '==', username)];
    const results = await FirestoreService.query<UserDocument>(this.collection, constraints);
    return results.length > 0 ? results[0] : null;
  }

  // Update user
  static async updateUser(uid: string, data: Partial<UserDocument>): Promise<void> {
    return FirestoreService.update(this.collection, uid, data);
  }

  // Check if username is available
  static async isUsernameAvailable(username: string, excludeUid?: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    if (!user) return true;
    return excludeUid ? user.id === excludeUid : false;
  }

  // Register a new user with email and password
  static async register(
    email: string,
    password: string,
    username: string,
    fullName?: string
  ): Promise<{ user: UserDocument; authUser: any }> {
    // Check if username is available
    const isAvailable = await this.isUsernameAvailable(username);
    if (!isAvailable) {
      throw new Error('Username is already taken');
    }

    // Create Firebase Auth user
    const authResult = await createUserWithEmailAndPassword(auth, email, password);
    const authUser = authResult.user;

    // Update display name
    if (fullName) {
      await updateProfile(authUser, { displayName: fullName });
    }

    // Create Firestore user document
    const userData: Omit<UserDocument, 'id' | 'createdAt' | 'updatedAt'> = {
      email,
      username,
      fullName,
      isActive: true,
      subscriptionTier: 'free',
    };

    const user = await this.createUser(authUser.uid, userData);

    return { user, authUser };
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<{ user: UserDocument; authUser: any }> {
    const authResult = await signInWithEmailAndPassword(auth, email, password);
    const authUser = authResult.user;

    const user = await this.getUser(authUser.uid);
    if (!user) {
      throw new Error('User profile not found');
    }

    return { user, authUser };
  }

  // Get current user
  static async getCurrentUser(): Promise<UserDocument | null> {
    const currentAuthUser = auth.currentUser;
    if (!currentAuthUser) return null;

    return this.getUser(currentAuthUser.uid);
  }

  // Update subscription tier
  static async updateSubscriptionTier(
    uid: string,
    tier: UserDocument['subscriptionTier']
  ): Promise<void> {
    return this.updateUser(uid, { subscriptionTier: tier });
  }

  // Update Stripe customer ID
  static async updateStripeCustomerId(uid: string, customerId: string): Promise<void> {
    return this.updateUser(uid, { stripeCustomerId: customerId });
  }

  // Deactivate user
  static async deactivateUser(uid: string): Promise<void> {
    return this.updateUser(uid, { isActive: false });
  }

  // Reactivate user
  static async reactivateUser(uid: string): Promise<void> {
    return this.updateUser(uid, { isActive: true });
  }
} 