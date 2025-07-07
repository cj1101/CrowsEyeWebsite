import { firebaseAuthBridge } from './firebase-auth-bridge';
import { API_CONFIG } from './config';
import { mockAuthService } from './mock-auth-service';

export interface BackendUser {
  id: string;
  email: string;
  name: string;
  subscription_tier: string;
  // Add other fields from your backend user model
}

export interface AuthResult {
  success: boolean;
  user?: BackendUser;
  error?: string;
  firebaseAuthenticated?: boolean;
  firebase_token?: string;
}

/**
 * Authentication Bridge Service
 * Connects your backend API authentication with Firebase Auth
 */
export class AuthBridgeService {
  private static instance: AuthBridgeService;
  private currentUser: BackendUser | null = null;
  private apiBaseUrl: string;

  private constructor() {
    // Use the centralized API configuration
    this.apiBaseUrl = API_CONFIG.baseURL;
  }

  static getInstance(): AuthBridgeService {
    if (!AuthBridgeService.instance) {
      AuthBridgeService.instance = new AuthBridgeService();
    }
    return AuthBridgeService.instance;
  }

  /**
   * Login with backend API and bridge to Firebase Auth
   */
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('🔐 Starting authentication process...');

      // Step 1: Authenticate with your backend API
      const backendResult = await this.authenticateWithBackend(email, password);
      
      if (backendResult.success && backendResult.user && backendResult.firebase_token) {
        this.currentUser = backendResult.user;
        console.log('✅ Backend authentication successful');

        // Step 2: Bridge to Firebase Auth using the custom token
        try {
          await firebaseAuthBridge.signInToFirebase(
            {
              id: backendResult.user.id,
              email: backendResult.user.email,
              name: backendResult.user.name
            },
            backendResult.firebase_token
          );
          
          console.log('✅ Firebase Auth bridge successful');
          
          return {
            success: true,
            user: backendResult.user,
            firebaseAuthenticated: true
          };
        } catch (firebaseError: any) {
          console.warn('⚠️ Firebase Auth bridge failed, but backend auth succeeded:', firebaseError.message);
          
          return {
            success: true,
            user: backendResult.user,
            firebaseAuthenticated: false,
            error: `Backend authentication successful, but Firebase authentication failed: ${firebaseError.message}`
          };
        }
      } else {
        // Fallback to mock auth if backend fails or doesn't provide a token
        console.warn('⚠️ Backend auth failed or no Firebase token, trying mock auth...');
        const mockResult = await mockAuthService.login(email, password);
        
        if (mockResult.success && mockResult.user) {
          this.currentUser = mockResult.user;
          console.log('✅ Mock authentication successful');
          
          return {
            success: true,
            user: mockResult.user,
            firebaseAuthenticated: mockResult.firebaseAuthenticated || false,
            error: mockResult.error || 'Using mock authentication (backend unavailable)'
          };
        }
        
        throw new Error(backendResult.error || 'Authentication failed and mock auth was unsuccessful.');
      }

    } catch (error: any) {
      console.error('❌ Authentication failed:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed'
      };
    }
  }

  /**
   * Authenticate with your backend API
   */
  private async authenticateWithBackend(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Backend authentication failed'
        };
      }

      // Store the access token for future API calls
      if (data.data?.access_token) {
        localStorage.setItem('auth_token', data.data.access_token);
        localStorage.setItem('refresh_token', data.data.refresh_token);
      }

      return {
        success: true,
        user: data.data?.user,
        firebase_token: data.data?.firebase_token
      };

    } catch (error: any) {
      console.error('❌ Backend authentication error:', error);
      return {
        success: false,
        error: error.message || 'Backend authentication failed'
      };
    }
  }

  /**
   * Logout from both systems
   */
  async logout(): Promise<void> {
    try {
      console.log('🚪 Logging out from both systems...');

      // Clear backend tokens
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');

      // Sign out from Firebase Auth
      await firebaseAuthBridge.signOutFromFirebase();

      // Sign out from mock auth if it was used
      await mockAuthService.logout();

      this.currentUser = null;
      console.log('✅ Logout successful');

    } catch (error) {
      console.error('❌ Logout error:', error);
      // Don't throw - we want to clear local state even if Firebase logout fails
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): BackendUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated with backend
   */
  isAuthenticatedWithBackend(): boolean {
    return this.currentUser !== null && localStorage.getItem('auth_token') !== null;
  }

  /**
   * Check if user is authenticated with Firebase
   */
  isAuthenticatedWithFirebase(): boolean {
    return firebaseAuthBridge.isAuthenticatedWithFirebase();
  }

  /**
   * Get backend authentication token
   */
  getBackendToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Refresh backend token
   */
  async refreshBackendToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${this.apiBaseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      });

      const data = await response.json();

      if (data.success && data.data?.access_token) {
        localStorage.setItem('auth_token', data.data.access_token);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Force refresh Firebase token
   */
  async refreshFirebaseToken(): Promise<boolean> {
    try {
      const token = await firebaseAuthBridge.refreshFirebaseToken();
      return token !== null;
    } catch (error) {
      console.error('❌ Firebase token refresh failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const authBridgeService = AuthBridgeService.getInstance(); 