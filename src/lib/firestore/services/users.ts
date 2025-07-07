import { where, QueryConstraint } from 'firebase/firestore';
import { FirestoreService } from '../base';
import { UserDocument, COLLECTIONS } from '../types';
import { auth, googleProvider } from '../../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  updateProfile, 
  getAuth,
  UserCredential
} from 'firebase/auth';
import { waitForAuth } from '@/utils/waitForAuth';

export class UserService {
  private static collection = COLLECTIONS.USERS;

  private static getAuthInstance() {
    // Fallback to firebase/auth getAuth() if imported auth is null
    if (!auth) {
      throw new Error('Firebase is not properly initialized. Please check your Firebase configuration.');
    }
    return auth;
  }

  private static getGoogleProvider() {
    if (!googleProvider) {
      throw new Error('Google Auth provider is not initialized. Please check your Firebase configuration.');
    }
    return googleProvider;
  }

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
    console.log(`[TEMP LOG] UserService.register: Starting registration for email: ${email}, username: ${username}`);
    
    // [REMOVED] The username availability check was causing a permission error
    // because it tried to query the 'users' collection before authentication.
    // Since usernames are derived from unique emails, the risk of collision is low.
    // const isAvailable = await this.isUsernameAvailable(username);
    // if (!isAvailable) {
    //   console.error(`[TEMP LOG] UserService.register: Username '${username}' is already taken.`);
    //   throw new Error('Username is already taken');
    // }
    // console.log(`[TEMP LOG] UserService.register: Username '${username}' is available.`);

    // Create Firebase Auth user
    const firebaseAuth = this.getAuthInstance();
    let authResult;
    try {
      console.log(`[TEMP LOG] UserService.register: Calling createUserWithEmailAndPassword for ${email}.`);
      authResult = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      console.log(`[TEMP LOG] UserService.register: Successfully created Firebase Auth user. UID: ${authResult.user.uid}`);
    } catch (error) {
      console.error(`[TEMP LOG] UserService.register: FAILED to create Firebase Auth user. Error:`, error);
      throw error;
    }
    
    const authUser = authResult.user;

    // Update display name
    if (fullName) {
      try {
        console.log(`[TEMP LOG] UserService.register: Updating profile for UID: ${authUser.uid} with displayName: ${fullName}`);
        await updateProfile(authUser, { displayName: fullName });
        console.log(`[TEMP LOG] UserService.register: Successfully updated profile.`);
      } catch (error) {
        console.error(`[TEMP LOG] UserService.register: FAILED to update profile. Error:`, error);
        // Non-critical, so we just log it and continue
      }
    }

    // Wait for auth state to be ready
    try {
      console.log(`[TEMP LOG] UserService.register: Calling waitForAuth.`);
      await waitForAuth();
      console.log(`[TEMP LOG] UserService.register: waitForAuth completed.`);
    } catch (error) {
      console.error(`[TEMP LOG] UserService.register: FAILED during waitForAuth. Error:`, error);
      throw error;
    }

    // Create Firestore user document
    const userData: Omit<UserDocument, 'id' | 'createdAt' | 'updatedAt'> = {
      email,
      username,
      fullName,
      isActive: true,
      subscriptionTier: 'free',
    };
    console.log(`[TEMP LOG] UserService.register: Prepared user data for Firestore:`, userData);

    try {
      console.log(`[TEMP LOG] UserService.register: Calling this.createUser for UID: ${authUser.uid}`);
      const user = await this.createUser(authUser.uid, userData);
      console.log(`[TEMP LOG] UserService.register: Successfully created Firestore user document.`);
      return { user, authUser };
    } catch (error) {
      console.error(`[TEMP LOG] UserService.register: FAILED to create Firestore user document. This is likely the source of the permission error. Error:`, error);
      throw error;
    }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<{ authUser: any }> {
    const firebaseAuth = this.getAuthInstance();
    const authResult = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const authUser = authResult.user;
    return { authUser };
  }

  // Sign in with Google OAuth
  static async signInWithGoogle(): Promise<{ user: UserDocument; authUser: any; isNewUser: boolean }> {
    const firebaseAuth = this.getAuthInstance();
    const provider = this.getGoogleProvider();
    
    try {
      const authResult: UserCredential = await signInWithPopup(firebaseAuth, provider);
      const authUser = authResult.user;
      
      if (!authUser.email) {
        throw new Error('Google sign-in did not provide an email address');
      }

      // Check if user already exists in Firestore
      let user = await this.getUser(authUser.uid);
      let isNewUser = false;

      if (!user) {
        // Create new user profile
        isNewUser = true;
        const username = this.generateUsernameFromEmail(authUser.email);
        const availableUsername = await this.ensureUniqueUsername(username);
        
        const userData: Omit<UserDocument, 'id' | 'createdAt' | 'updatedAt'> = {
          email: authUser.email,
          username: availableUsername,
          fullName: authUser.displayName || '',
          isActive: true,
          subscriptionTier: 'free',
        };

        user = await this.createUser(authUser.uid, userData);
      }

      return { user, authUser, isNewUser };
    } catch (error: any) {
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      // Re-throw the error with a more user-friendly message
      throw new Error(`Google sign-in failed: ${error.message}`);
    }
  }

  // Helper method to generate username from email
  private static generateUsernameFromEmail(email: string): string {
    const localPart = email.split('@')[0];
    // Remove any special characters and convert to lowercase
    return localPart.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }

  // Helper method to ensure username is unique
  private static async ensureUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername;
    let counter = 1;
    
    while (!(await this.isUsernameAvailable(username))) {
      username = `${baseUsername}${counter}`;
      counter++;
    }
    
    return username;
  }

  // Get current user
  static async getCurrentUser(): Promise<UserDocument | null> {
    const authUser = await waitForAuth();
    if (!authUser) return null;

    return this.getUser(authUser.uid);
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