import { where, orderBy, QueryConstraint } from 'firebase/firestore';
import { FirestoreService } from '../base';
import { PostDocument, COLLECTIONS } from '../types';

export class PostService {
  private static collection = COLLECTIONS.POSTS;

  // Create a new post
  static async createPost(
    data: Omit<PostDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PostDocument> {
    return FirestoreService.create<PostDocument>(this.collection, { ...data } as PostDocument);
  }

  // Get post by ID
  static async getPost(postId: string): Promise<PostDocument | null> {
    return FirestoreService.get<PostDocument>(this.collection, postId);
  }

  // Update post
  static async updatePost(postId: string, data: Partial<PostDocument>): Promise<void> {
    return FirestoreService.update(this.collection, postId, data);
  }

  // Delete post
  static async deletePost(postId: string): Promise<void> {
    return FirestoreService.delete(this.collection, postId);
  }

  // List user's posts
  static async listUserPosts(
    userId: string,
    options: {
      status?: PostDocument['status'];
      platform?: string;
      limit?: number;
      startAfterId?: string;
    } = {}
  ): Promise<{ data: PostDocument[]; lastDoc: string | null }> {
    const constraints: QueryConstraint[] = [where('userId', '==', userId)];

    if (options.status) {
      constraints.push(where('status', '==', options.status));
    }

    if (options.platform) {
      constraints.push(where('platforms', 'array-contains', options.platform));
    }

    return FirestoreService.list<PostDocument>(this.collection, {
      userId,
      orderByField: 'createdAt',
      orderDirection: 'desc',
      limitCount: options.limit || 20,
      startAfterId: options.startAfterId,
    });
  }

  // Get posts by status
  static async getPostsByStatus(
    userId: string,
    status: PostDocument['status']
  ): Promise<PostDocument[]> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
    ];

    return FirestoreService.query<PostDocument>(this.collection, constraints);
  }

  // Publish post
  static async publishPost(postId: string): Promise<void> {
    return this.updatePost(postId, {
      status: 'published',
      publishedAt: new Date(),
    });
  }

  // Schedule post
  static async schedulePost(postId: string, scheduledDate: Date): Promise<void> {
    return this.updatePost(postId, {
      status: 'scheduled',
      publishedAt: scheduledDate,
    });
  }

  // Get scheduled posts
  static async getScheduledPosts(userId: string): Promise<PostDocument[]> {
    const now = new Date();
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('status', '==', 'scheduled'),
      where('publishedAt', '>', now),
      orderBy('publishedAt', 'asc'),
    ];

    return FirestoreService.query<PostDocument>(this.collection, constraints);
  }

  // Get posts ready to publish
  static async getPostsReadyToPublish(): Promise<PostDocument[]> {
    const now = new Date();
    const constraints: QueryConstraint[] = [
      where('status', '==', 'scheduled'),
      where('publishedAt', '<=', now),
      orderBy('publishedAt', 'asc'),
    ];

    return FirestoreService.query<PostDocument>(this.collection, constraints);
  }

  // Search posts by title or content
  static async searchPosts(
    userId: string,
    searchTerm: string
  ): Promise<PostDocument[]> {
    // Note: Firestore doesn't support full-text search natively
    // This is a simple implementation that searches by title prefix
    // For better search, consider using Algolia or Elasticsearch
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('title', '>=', searchTerm),
      where('title', '<=', searchTerm + '\uf8ff'),
      orderBy('title'),
    ];

    return FirestoreService.query<PostDocument>(this.collection, constraints);
  }

  // Get posts by platform
  static async getPostsByPlatform(
    userId: string,
    platform: string
  ): Promise<PostDocument[]> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('platforms', 'array-contains', platform),
      orderBy('createdAt', 'desc'),
    ];

    return FirestoreService.query<PostDocument>(this.collection, constraints);
  }

  // Get post statistics
  static async getPostStats(userId: string): Promise<{
    total: number;
    draft: number;
    published: number;
    scheduled: number;
  }> {
    const constraints: QueryConstraint[] = [where('userId', '==', userId)];
    const allPosts = await FirestoreService.query<PostDocument>(this.collection, constraints);

    return {
      total: allPosts.length,
      draft: allPosts.filter(p => p.status === 'draft').length,
      published: allPosts.filter(p => p.status === 'published').length,
      scheduled: allPosts.filter(p => p.status === 'scheduled').length,
    };
  }

  // Batch create posts
  static async batchCreatePosts(
    posts: Array<Omit<PostDocument, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const documents = posts.map(post => ({ ...post } as PostDocument));
    return FirestoreService.batchCreate(this.collection, documents);
  }

  // Duplicate post
  static async duplicatePost(postId: string): Promise<PostDocument> {
    const original = await this.getPost(postId);
    if (!original) {
      throw new Error('Post not found');
    }

    const { id, createdAt, updatedAt, publishedAt, ...postData } = original;
    const duplicate = {
      ...postData,
      title: `${postData.title} (Copy)`,
      status: 'draft' as const,
    };

    return this.createPost(duplicate);
  }
} 