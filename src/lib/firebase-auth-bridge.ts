import { auth } from './firebase';
import { 
  signInWithCustomToken,
  signOut as firebaseSignOut,
  updateProfile,
  UserCredential,
  User
} from 'firebase/auth';

export interface AppUser {
  id: string;
  email: string;
  name?: string;
  // Add other fields from your app's user model
}

/**
 * Bridge service to connect your app's authentication with Firebase Auth
 * This ensures users are authenticated with Firebase when they use your app
 */
export class FirebaseAuthBridge {
  private static instance: FirebaseAuthBridge;
  private currentAppUser: AppUser | null = null;

  private constructor() {}

  static getInstance(): FirebaseAuthBridge {
    if (!FirebaseAuthBridge.instance) {
      FirebaseAuthBridge.instance = new FirebaseAuthBridge();
    }
    return FirebaseAuthBridge.instance;
  }

  /**
   * Sign in user to Firebase Auth using a custom token from your backend
   */
  async signInWithCustomToken(appUser: AppUser, token: string): Promise<UserCredential> {
    try {
      console.log('🔗 Authenticating with Firebase using custom token...');
      
      const credential = await signInWithCustomToken(auth, token);
      
      // If the user is new, update their profile
      if (credential.user && appUser.name) {
        const firebaseUser = credential.user;
        if (!firebaseUser.displayName) {
          await updateProfile(firebaseUser, {
            displayName: appUser.name
          });
          console.log('✅ Updated Firebase user profile');
        }
      }
      
      this.currentAppUser = appUser;
      console.log('✅ Successfully signed in to Firebase Auth with custom token');
      
      return credential;
    } catch (error: any) {
      console.error('❌ Failed to sign in with custom token:', error);
      throw error;
    }
  }

  /**
   * Sign in user to Firebase Auth using your app's credentials
   * This creates a Firebase Auth session that matches your app's user
   */
  async signInToFirebase(appUser: AppUser, token: string): Promise<UserCredential> {
    return this.signInWithCustomToken(appUser, token);
  }

  /**
   * Check if the current Firebase Auth user matches your app's user
   */
  isFirebaseUserMatchingAppUser(appUser: AppUser): boolean {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return false;
    
    return firebaseUser.email === appUser.email;
  }

  /**
   * Sign out from Firebase Auth
   */
  async signOutFromFirebase(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      this.currentAppUser = null;
      console.log('✅ Successfully signed out from Firebase Auth');
    } catch (error) {
      console.error('❌ Failed to sign out from Firebase Auth:', error);
      throw error;
    }
  }

  /**
   * Get the current Firebase Auth user
   */
  getCurrentFirebaseUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Check if user is authenticated with Firebase Auth
   */
  isAuthenticatedWithFirebase(): boolean {
    return auth.currentUser !== null;
  }

  /**
   * Force refresh the Firebase Auth token
   */
  async refreshFirebaseToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('⚠️ No Firebase user to refresh token for');
        return null;
      }

      const token = await currentUser.getIdToken(true); // Force refresh
      console.log('✅ Firebase token refreshed successfully');
      return token;
    } catch (error) {
      console.error('❌ Failed to refresh Firebase token:', error);
      return null;
    }
  }

  /**
   * Check if Firebase Auth is properly initialized
   */
  isFirebaseInitialized(): boolean {
    return auth !== null;
  }
}

// Export singleton instance
export const firebaseAuthBridge = FirebaseAuthBridge.getInstance(); 