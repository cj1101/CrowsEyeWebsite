import { where, orderBy, QueryConstraint } from 'firebase/firestore';
import { FirestoreService } from '../base';
import { AnalyticsDocument, COLLECTIONS } from '../types';

export class AnalyticsService {
  private static collection = COLLECTIONS.ANALYTICS;

  // Record analytics data
  static async recordAnalytics(
    data: Omit<AnalyticsDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<AnalyticsDocument> {
    return FirestoreService.create<AnalyticsDocument>(this.collection, { ...data } as AnalyticsDocument);
  }

  // Get analytics by ID
  static async getAnalytics(analyticsId: string): Promise<AnalyticsDocument | null> {
    return FirestoreService.get<AnalyticsDocument>(this.collection, analyticsId);
  }

  // Update analytics
  static async updateAnalytics(analyticsId: string, data: Partial<AnalyticsDocument>): Promise<void> {
    return FirestoreService.update(this.collection, analyticsId, data);
  }

  // Get analytics for a specific post
  static async getPostAnalytics(
    userId: string,
    postId: string,
    platform?: string
  ): Promise<AnalyticsDocument[]> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('postId', '==', postId),
    ];

    if (platform) {
      constraints.push(where('platform', '==', platform));
    }

    constraints.push(orderBy('recordedAt', 'desc'));

    return FirestoreService.query<AnalyticsDocument>(this.collection, constraints);
  }

  // Get analytics by platform
  static async getPlatformAnalytics(
    userId: string,
    platform: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AnalyticsDocument[]> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('platform', '==', platform),
    ];

    if (startDate) {
      constraints.push(where('recordedAt', '>=', startDate));
    }

    if (endDate) {
      constraints.push(where('recordedAt', '<=', endDate));
    }

    constraints.push(orderBy('recordedAt', 'desc'));

    return FirestoreService.query<AnalyticsDocument>(this.collection, constraints);
  }

  // Get analytics summary for a user
  static async getUserAnalyticsSummary(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalEngagement: number;
    byPlatform: Record<string, {
      views: number;
      likes: number;
      comments: number;
      shares: number;
      engagement: number;
    }>;
  }> {
    const constraints: QueryConstraint[] = [where('userId', '==', userId)];

    if (startDate) {
      constraints.push(where('recordedAt', '>=', startDate));
    }

    if (endDate) {
      constraints.push(where('recordedAt', '<=', endDate));
    }

    const analytics = await FirestoreService.query<AnalyticsDocument>(this.collection, constraints);

    // Calculate totals
    const summary = {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalEngagement: 0,
      byPlatform: {} as Record<string, any>,
    };

    analytics.forEach(record => {
      const metrics = record.metrics;
      
      // Update totals
      summary.totalViews += metrics.views || 0;
      summary.totalLikes += metrics.likes || 0;
      summary.totalComments += metrics.comments || 0;
      summary.totalShares += metrics.shares || 0;
      summary.totalEngagement += metrics.engagement || 0;

      // Update platform-specific metrics
      if (!summary.byPlatform[record.platform]) {
        summary.byPlatform[record.platform] = {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          engagement: 0,
        };
      }

      const platformMetrics = summary.byPlatform[record.platform];
      platformMetrics.views += metrics.views || 0;
      platformMetrics.likes += metrics.likes || 0;
      platformMetrics.comments += metrics.comments || 0;
      platformMetrics.shares += metrics.shares || 0;
      platformMetrics.engagement += metrics.engagement || 0;
    });

    return summary;
  }

  // Get top performing posts
  static async getTopPerformingPosts(
    userId: string,
    metric: keyof AnalyticsDocument['metrics'],
    limit: number = 10
  ): Promise<Array<{ postId: string; platform: string; value: number }>> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('recordedAt', 'desc'),
    ];

    const analytics = await FirestoreService.query<AnalyticsDocument>(this.collection, constraints);

    // Group by post and platform, taking the latest metrics
    const postMetrics = new Map<string, { postId: string; platform: string; value: number }>();

    analytics.forEach(record => {
      if (record.postId) {
        const key = `${record.postId}-${record.platform}`;
        const value = record.metrics[metric] || 0;
        
        if (!postMetrics.has(key) || value > (postMetrics.get(key)?.value || 0)) {
          postMetrics.set(key, {
            postId: record.postId,
            platform: record.platform,
            value,
          });
        }
      }
    });

    // Sort by value and return top N
    return Array.from(postMetrics.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, limit);
  }

  // Batch record analytics
  static async batchRecordAnalytics(
    records: Array<Omit<AnalyticsDocument, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const documents = records.map(record => ({ ...record } as AnalyticsDocument));
    return FirestoreService.batchCreate(this.collection, documents);
  }

  // Get engagement rate over time
  static async getEngagementTrend(
    userId: string,
    platform?: string,
    days: number = 30
  ): Promise<Array<{ date: Date; engagementRate: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('recordedAt', '>=', startDate),
    ];

    if (platform) {
      constraints.push(where('platform', '==', platform));
    }

    constraints.push(orderBy('recordedAt', 'asc'));

    const analytics = await FirestoreService.query<AnalyticsDocument>(this.collection, constraints);

    // Group by date and calculate engagement rate
    const dailyEngagement = new Map<string, { impressions: number; engagement: number }>();

    analytics.forEach(record => {
      const date = new Date(record.recordedAt as Date);
      const dateKey = date.toISOString().split('T')[0];

      if (!dailyEngagement.has(dateKey)) {
        dailyEngagement.set(dateKey, { impressions: 0, engagement: 0 });
      }

      const daily = dailyEngagement.get(dateKey)!;
      daily.impressions += record.metrics.impressions || 0;
      daily.engagement += record.metrics.engagement || 0;
    });

    // Calculate engagement rates
    return Array.from(dailyEngagement.entries()).map(([dateStr, metrics]) => ({
      date: new Date(dateStr),
      engagementRate: metrics.impressions > 0 
        ? (metrics.engagement / metrics.impressions) * 100 
        : 0,
    }));
  }
} 