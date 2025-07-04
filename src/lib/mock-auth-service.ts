import { firebaseAuthBridge } from './firebase-auth-bridge';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  subscription_tier: string;
}

/**
 * Mock Authentication Service
 * Provides a fallback authentication method for testing when backend API is not available
 */
export class MockAuthService {
  private static instance: MockAuthService;
  private currentUser: MockUser | null = null;

  private constructor() {}

  static getInstance(): MockAuthService {
    if (!MockAuthService.instance) {
      MockAuthService.instance = new MockAuthService();
    }
    return MockAuthService.instance;
  }

  /**
   * Mock login - creates a test user and bridges to Firebase Auth
   */
  async login(email: string, password: string): Promise<{
    success: boolean;
    user?: MockUser;
    error?: string;
    firebaseAuthenticated?: boolean;
  }> {
    try {
      console.log('🔐 Starting mock authentication...');

      // Create a mock user
      const mockUser: MockUser = {
        id: `mock_${Date.now()}`,
        email: email,
        name: email.split('@')[0],
        subscription_tier: 'free'
      };

      this.currentUser = mockUser;
      console.log('✅ Mock authentication successful');

      // Try to bridge to Firebase Auth
      try {
        await firebaseAuthBridge.signInToFirebase(
          {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name
          },
          password
        );
        
        console.log('✅ Firebase Auth bridge successful');
        
        return {
          success: true,
          user: mockUser,
          firebaseAuthenticated: true
        };
      } catch (firebaseError: any) {
        console.warn('⚠️ Firebase Auth bridge failed, but mock auth succeeded:', firebaseError.message);
        
        return {
          success: true,
          user: mockUser,
          firebaseAuthenticated: false,
          error: `Mock authentication successful, but Firebase authentication failed: ${firebaseError.message}`
        };
      }

    } catch (error: any) {
      console.error('❌ Mock authentication failed:', error);
      return {
        success: false,
        error: error.message || 'Mock authentication failed'
      };
    }
  }

  /**
   * Logout from both systems
   */
  async logout(): Promise<void> {
    try {
      console.log('🚪 Logging out from mock auth...');

      // Sign out from Firebase Auth
      await firebaseAuthBridge.signOutFromFirebase();

      this.currentUser = null;
      console.log('✅ Mock logout successful');

    } catch (error) {
      console.error('❌ Mock logout error:', error);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Check if user is authenticated with Firebase
   */
  isAuthenticatedWithFirebase(): boolean {
    return firebaseAuthBridge.isAuthenticatedWithFirebase();
  }
}

// Export singleton instance
export const mockAuthService = MockAuthService.getInstance(); 