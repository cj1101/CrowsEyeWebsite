import { where, orderBy, QueryConstraint } from 'firebase/firestore';
import { FirestoreService } from '../base';
import { GalleryDocument, MediaDocument, COLLECTIONS } from '../types';
import { MediaService } from './media';

export class GalleryService {
  private static collection = COLLECTIONS.GALLERIES;

  // Create a new gallery
  static async createGallery(
    data: Omit<GalleryDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<GalleryDocument> {
    return FirestoreService.create<GalleryDocument>(this.collection, { ...data } as GalleryDocument);
  }

  // Get gallery by ID
  static async getGallery(galleryId: string): Promise<GalleryDocument | null> {
    return FirestoreService.get<GalleryDocument>(this.collection, galleryId);
  }

  // Update gallery
  static async updateGallery(galleryId: string, data: Partial<GalleryDocument>): Promise<void> {
    return FirestoreService.update(this.collection, galleryId, data);
  }

  // Delete gallery
  static async deleteGallery(galleryId: string): Promise<void> {
    return FirestoreService.delete(this.collection, galleryId);
  }

  // List user's galleries
  static async listUserGalleries(
    userId: string,
    options: {
      limit?: number;
      startAfterId?: string;
    } = {}
  ): Promise<{ data: GalleryDocument[]; lastDoc: string | null }> {
    return FirestoreService.list<GalleryDocument>(this.collection, {
      userId,
      orderByField: 'createdDate',
      orderDirection: 'desc',
      limitCount: options.limit || 20,
      startAfterId: options.startAfterId,
    });
  }

  // Add media to gallery
  static async addMediaToGallery(galleryId: string, mediaId: string): Promise<void> {
    const gallery = await this.getGallery(galleryId);
    if (!gallery) {
      throw new Error('Gallery not found');
    }

    // Check if media already exists in gallery
    if (gallery.mediaIds.includes(mediaId)) {
      return; // Already in gallery
    }

    const updatedMediaIds = [...gallery.mediaIds, mediaId];
    return this.updateGallery(galleryId, { mediaIds: updatedMediaIds });
  }

  // Remove media from gallery
  static async removeMediaFromGallery(galleryId: string, mediaId: string): Promise<void> {
    const gallery = await this.getGallery(galleryId);
    if (!gallery) {
      throw new Error('Gallery not found');
    }

    const updatedMediaIds = gallery.mediaIds.filter(id => id !== mediaId);
    return this.updateGallery(galleryId, { mediaIds: updatedMediaIds });
  }

  // Get gallery with media items
  static async getGalleryWithMedia(galleryId: string): Promise<{
    gallery: GalleryDocument;
    media: MediaDocument[];
  } | null> {
    const gallery = await this.getGallery(galleryId);
    if (!gallery) {
      return null;
    }

    // Fetch all media items in the gallery
    const mediaPromises = gallery.mediaIds.map(mediaId => MediaService.getMedia(mediaId));
    const mediaResults = await Promise.all(mediaPromises);
    const media = mediaResults.filter((item): item is MediaDocument => item !== null);

    return { gallery, media };
  }

  // Create gallery from media selection
  static async createGalleryFromMedia(
    userId: string,
    name: string,
    mediaIds: string[],
    caption?: string
  ): Promise<GalleryDocument> {
    const galleryData: Omit<GalleryDocument, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      name,
      caption,
      mediaIds,
      createdDate: new Date(),
    };

    return this.createGallery(galleryData);
  }

  // Reorder media in gallery
  static async reorderGalleryMedia(galleryId: string, mediaIds: string[]): Promise<void> {
    const gallery = await this.getGallery(galleryId);
    if (!gallery) {
      throw new Error('Gallery not found');
    }

    // Verify all media IDs are in the gallery
    const existingIds = new Set(gallery.mediaIds);
    const newIds = new Set(mediaIds);
    
    if (existingIds.size !== newIds.size || 
        !mediaIds.every(id => existingIds.has(id))) {
      throw new Error('Media IDs do not match gallery contents');
    }

    return this.updateGallery(galleryId, { mediaIds });
  }

  // Get galleries containing specific media
  static async getGalleriesContainingMedia(
    userId: string,
    mediaId: string
  ): Promise<GalleryDocument[]> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('mediaIds', 'array-contains', mediaId),
      orderBy('createdDate', 'desc'),
    ];

    return FirestoreService.query<GalleryDocument>(this.collection, constraints);
  }

  // Merge galleries
  static async mergeGalleries(
    sourceGalleryIds: string[],
    targetName: string,
    userId: string
  ): Promise<GalleryDocument> {
    // Fetch all source galleries
    const galleryPromises = sourceGalleryIds.map(id => this.getGallery(id));
    const galleries = await Promise.all(galleryPromises);
    
    // Collect all unique media IDs
    const allMediaIds = new Set<string>();
    galleries.forEach(gallery => {
      if (gallery) {
        gallery.mediaIds.forEach(id => allMediaIds.add(id));
      }
    });

    // Create new gallery with merged media
    const mergedGallery = await this.createGalleryFromMedia(
      userId,
      targetName,
      Array.from(allMediaIds)
    );

    // Optionally delete source galleries
    // await Promise.all(sourceGalleryIds.map(id => this.deleteGallery(id)));

    return mergedGallery;
  }

  // Duplicate gallery
  static async duplicateGallery(galleryId: string): Promise<GalleryDocument> {
    const original = await this.getGallery(galleryId);
    if (!original) {
      throw new Error('Gallery not found');
    }

    const { id, createdAt, updatedAt, ...galleryData } = original;
    const duplicate = {
      ...galleryData,
      name: `${galleryData.name} (Copy)`,
      createdDate: new Date(),
    };

    return this.createGallery(duplicate);
  }
} 