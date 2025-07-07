// Google Services Direct API Integration
// Replaces crow's eye API with direct Google API calls

export interface GooglePhotosAuth {
  isConnected: boolean;
  userEmail?: string;
  albumCount?: number;
  lastSync?: string;
}

export interface GooglePhotosAlbum {
  id: string;
  title: string;
  productUrl: string;
  coverPhotoUrl?: string;
  mediaItemsCount: number;
  isWriteable: boolean;
}

export interface GooglePhotosMediaItem {
  id: string;
  filename: string;
  mimeType: string;
  baseUrl: string;
  productUrl: string;
  description?: string;
  mediaMetadata: {
    creationTime: string;
    width: string;
    height: string;
    photo?: {
      cameraMake?: string;
      cameraModel?: string;
      focalLength?: number;
      apertureFNumber?: number;
      isoEquivalent?: number;
    };
    video?: {
      fps?: number;
      status?: string;
    };
  };
}

// Environment variable helpers
const getEnvVar = (key: string): string | undefined => {
  if (typeof window !== 'undefined') {
    return (window as any).process?.env?.[`NEXT_PUBLIC_${key}`] || process.env[`NEXT_PUBLIC_${key}`];
  }
  return process.env[key] || process.env[`NEXT_PUBLIC_${key}`];
};

export class GoogleServicesAPI {
  private accessToken: string | null = null;

  // Initialize Google APIs
  private async initializeGoogleAPI(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    // Load Google API script
    return new Promise((resolve, reject) => {
      if ((window as any).gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        (window as any).gapi.load('auth2', () => {
          const clientId = getEnvVar('GOOGLE_CLIENT_ID');
          if (!clientId) {
            reject(new Error('Google Client ID not configured'));
            return;
          }

          (window as any).gapi.auth2.init({
            client_id: clientId,
            scope: 'https://www.googleapis.com/auth/photoslibrary.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/business.manage'
          }).then(resolve, reject);
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Connect to Google Photos
  async connectGooglePhotos(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.initializeGoogleAPI();
      
      const authInstance = (window as any).gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      if (user.isSignedIn()) {
        this.accessToken = user.getAuthResponse().access_token;
        
        // Store connection data
        const connectionData = {
          userEmail: user.getBasicProfile().getEmail(),
          connected: true,
          connectedAt: new Date().toISOString()
        };
        
        this.storeGoogleConnection('photos', connectionData);
        
        return { success: true };
      } else {
        return { success: false, error: 'User not signed in' };
      }
    } catch (error: any) {
      console.error('Google Photos connection error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get Google Photos status
  async getGooglePhotosStatus(): Promise<{ success: boolean; data?: GooglePhotosAuth; error?: string }> {
    try {
      const connection = this.getStoredGoogleConnection('photos');
      
      const status: GooglePhotosAuth = {
        isConnected: !!connection,
        userEmail: connection?.userEmail,
        lastSync: connection?.lastSync
      };

      if (connection) {
        // Get album count if connected
        const albumsResult = await this.listGooglePhotosAlbums();
        if (albumsResult.success && albumsResult.data) {
          status.albumCount = albumsResult.data.length;
        }
      }

      return { success: true, data: status };
    } catch (error: any) {
      console.error('Get Google Photos status error:', error);
      return { success: false, error: error.message };
    }
  }

  // List Google Photos albums
  async listGooglePhotosAlbums(): Promise<{ success: boolean; data?: GooglePhotosAlbum[]; error?: string }> {
    try {
      const connection = this.getStoredGoogleConnection('photos');
      if (!connection) {
        return { success: false, error: 'Not connected to Google Photos' };
      }

      // Use stored access token or get fresh one
      let accessToken = this.accessToken;
      if (!accessToken && typeof window !== 'undefined') {
        const authInstance = (window as any).gapi?.auth2?.getAuthInstance();
        if (authInstance?.isSignedIn?.get()) {
          accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
        }
      }

      if (!accessToken) {
        return { success: false, error: 'No valid access token' };
      }

      const response = await fetch('https://photoslibrary.googleapis.com/v1/albums', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Google Photos API error: ${response.status}`);
      }

      const data = await response.json();
      const albums: GooglePhotosAlbum[] = (data.albums || []).map((album: any) => ({
        id: album.id,
        title: album.title,
        productUrl: album.productUrl,
        coverPhotoUrl: album.coverPhotoBaseUrl,
        mediaItemsCount: parseInt(album.mediaItemsCount) || 0,
        isWriteable: album.isWriteable || false
      }));

      return { success: true, data: albums };
    } catch (error: any) {
      console.error('List Google Photos albums error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get album media items
  async getAlbumMedia(albumId: string, pageToken?: string): Promise<{ success: boolean; data?: { items: GooglePhotosMediaItem[]; nextPageToken?: string }; error?: string }> {
    try {
      const connection = this.getStoredGoogleConnection('photos');
      if (!connection) {
        return { success: false, error: 'Not connected to Google Photos' };
      }

      let accessToken = this.accessToken;
      if (!accessToken && typeof window !== 'undefined') {
        const authInstance = (window as any).gapi?.auth2?.getAuthInstance();
        if (authInstance?.isSignedIn?.get()) {
          accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
        }
      }

      if (!accessToken) {
        return { success: false, error: 'No valid access token' };
      }

      const url = new URL('https://photoslibrary.googleapis.com/v1/mediaItems:search');
      const requestBody = {
        albumId,
        pageSize: 50,
        ...(pageToken && { pageToken })
      };

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Google Photos API error: ${response.status}`);
      }

      const data = await response.json();
      const items: GooglePhotosMediaItem[] = (data.mediaItems || []).map((item: any) => ({
        id: item.id,
        filename: item.filename,
        mimeType: item.mimeType,
        baseUrl: item.baseUrl,
        productUrl: item.productUrl,
        description: item.description,
        mediaMetadata: {
          creationTime: item.mediaMetadata.creationTime,
          width: item.mediaMetadata.width,
          height: item.mediaMetadata.height,
          photo: item.mediaMetadata.photo,
          video: item.mediaMetadata.video
        }
      }));

      return {
        success: true,
        data: {
          items,
          nextPageToken: data.nextPageToken
        }
      };
    } catch (error: any) {
      console.error('Get album media error:', error);
      return { success: false, error: error.message };
    }
  }

  // Import from Google Photos
  async importFromGooglePhotos(albumId: string, mediaIds: string[]): Promise<{ success: boolean; imported_count?: number; error?: string }> {
    try {
      // This would download the media items and import them into Firebase Storage
      // For now, this is a placeholder implementation
      
      const albumMediaResult = await this.getAlbumMedia(albumId);
      if (!albumMediaResult.success || !albumMediaResult.data) {
        return { success: false, error: 'Failed to get album media' };
      }

      const mediaToImport = albumMediaResult.data.items.filter(item => 
        mediaIds.includes(item.id)
      );

      // In a real implementation, this would:
      // 1. Download each media item from Google Photos
      // 2. Upload to Firebase Storage
      // 3. Create media records in Firestore
      
      return { 
        success: true, 
        imported_count: mediaToImport.length 
      };
    } catch (error: any) {
      console.error('Import from Google Photos error:', error);
      return { success: false, error: error.message };
    }
  }

  // Search Google Photos
  async searchGooglePhotos(searchQuery: string): Promise<{ success: boolean; data?: GooglePhotosMediaItem[]; error?: string }> {
    try {
      const connection = this.getStoredGoogleConnection('photos');
      if (!connection) {
        return { success: false, error: 'Not connected to Google Photos' };
      }

      let accessToken = this.accessToken;
      if (!accessToken && typeof window !== 'undefined') {
        const authInstance = (window as any).gapi?.auth2?.getAuthInstance();
        if (authInstance?.isSignedIn?.get()) {
          accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
        }
      }

      if (!accessToken) {
        return { success: false, error: 'No valid access token' };
      }

      const response = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems:search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageSize: 50,
          filters: {
            contentFilter: {
              includedContentCategories: searchQuery ? [] : ['PEOPLE', 'PETS', 'LANDMARKS', 'FOOD']
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Google Photos API error: ${response.status}`);
      }

      const data = await response.json();
      const items: GooglePhotosMediaItem[] = (data.mediaItems || [])
        .filter((item: any) => 
          !searchQuery || 
          item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .map((item: any) => ({
          id: item.id,
          filename: item.filename,
          mimeType: item.mimeType,
          baseUrl: item.baseUrl,
          productUrl: item.productUrl,
          description: item.description,
          mediaMetadata: {
            creationTime: item.mediaMetadata.creationTime,
            width: item.mediaMetadata.width,
            height: item.mediaMetadata.height,
            photo: item.mediaMetadata.photo,
            video: item.mediaMetadata.video
          }
        }));

      return { success: true, data: items };
    } catch (error: any) {
      console.error('Search Google Photos error:', error);
      return { success: false, error: error.message };
    }
  }

  // Sync Google Photos
  async syncGooglePhotos(): Promise<{ success: boolean; synced_count?: number; error?: string }> {
    try {
      const connection = this.getStoredGoogleConnection('photos');
      if (!connection) {
        return { success: false, error: 'Not connected to Google Photos' };
      }

      // Update last sync time
      connection.lastSync = new Date().toISOString();
      this.storeGoogleConnection('photos', connection);

      // This would perform a full sync of albums and media
      // For now, just return success
      return { success: true, synced_count: 0 };
    } catch (error: any) {
      console.error('Sync Google Photos error:', error);
      return { success: false, error: error.message };
    }
  }

  // Google My Business integration (placeholder)
  async connectGoogleBusiness(): Promise<{ success: boolean; error?: string }> {
    try {
      // Google My Business API integration would go here
      return { success: false, error: 'Google My Business API integration requires additional setup' };
    } catch (error: any) {
      console.error('Google Business connection error:', error);
      return { success: false, error: error.message };
    }
  }

  // Storage helpers
  private getStoredGoogleConnection(service: string): any {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(`google_${service}_connection`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private storeGoogleConnection(service: string, connectionData: any): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`google_${service}_connection`, JSON.stringify(connectionData));
    } catch (error) {
      console.error('Failed to store Google connection:', error);
    }
  }

  // Disconnect from Google service
  async disconnectGoogleService(service: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`google_${service}_connection`);
        
        // Sign out from Google if this was the last service
        const authInstance = (window as any).gapi?.auth2?.getAuthInstance();
        if (authInstance?.isSignedIn?.get()) {
          await authInstance.signOut();
        }
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Disconnect Google service error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const googleServicesAPI = new GoogleServicesAPI(); 