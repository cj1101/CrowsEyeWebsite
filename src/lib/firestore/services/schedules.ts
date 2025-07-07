import { where, orderBy, QueryConstraint } from 'firebase/firestore';
import { FirestoreService } from '../base';
import { ScheduleDocument, COLLECTIONS } from '../types';

export class ScheduleService {
  private static collection = COLLECTIONS.SCHEDULES;

  // Create a new schedule
  static async createSchedule(
    data: Omit<ScheduleDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ScheduleDocument> {
    return FirestoreService.create<ScheduleDocument>(this.collection, { ...data } as ScheduleDocument);
  }

  // Get schedule by ID
  static async getSchedule(scheduleId: string): Promise<ScheduleDocument | null> {
    return FirestoreService.get<ScheduleDocument>(this.collection, scheduleId);
  }

  // Update schedule
  static async updateSchedule(scheduleId: string, data: Partial<ScheduleDocument>): Promise<void> {
    return FirestoreService.update(this.collection, scheduleId, data);
  }

  // Delete schedule
  static async deleteSchedule(scheduleId: string): Promise<void> {
    return FirestoreService.delete(this.collection, scheduleId);
  }

  // List user's schedules
  static async listUserSchedules(
    userId: string,
    options: {
      status?: ScheduleDocument['status'];
      platform?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      startAfterId?: string;
    } = {}
  ): Promise<{ data: ScheduleDocument[]; lastDoc: string | null }> {
    const constraints: QueryConstraint[] = [where('userId', '==', userId)];

    if (options.status) {
      constraints.push(where('status', '==', options.status));
    }

    if (options.platform) {
      constraints.push(where('platforms', 'array-contains', options.platform));
    }

    if (options.startDate) {
      constraints.push(where('scheduledTime', '>=', options.startDate));
    }

    if (options.endDate) {
      constraints.push(where('scheduledTime', '<=', options.endDate));
    }

    return FirestoreService.list<ScheduleDocument>(this.collection, {
      userId,
      orderByField: 'scheduledTime',
      orderDirection: 'asc',
      limitCount: options.limit || 20,
      startAfterId: options.startAfterId,
    });
  }

  // Get pending schedules
  static async getPendingSchedules(userId?: string): Promise<ScheduleDocument[]> {
    const now = new Date();
    const constraints: QueryConstraint[] = [
      where('status', '==', 'pending'),
      where('scheduledTime', '<=', now),
    ];

    if (userId) {
      constraints.push(where('userId', '==', userId));
    }

    constraints.push(orderBy('scheduledTime', 'asc'));

    return FirestoreService.query<ScheduleDocument>(this.collection, constraints);
  }

  // Get upcoming schedules
  static async getUpcomingSchedules(
    userId: string,
    days: number = 7
  ): Promise<ScheduleDocument[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('status', '==', 'pending'),
      where('scheduledTime', '>', now),
      where('scheduledTime', '<=', futureDate),
      orderBy('scheduledTime', 'asc'),
    ];

    return FirestoreService.query<ScheduleDocument>(this.collection, constraints);
  }

  // Update schedule status
  static async updateScheduleStatus(
    scheduleId: string,
    status: ScheduleDocument['status'],
    error?: string
  ): Promise<void> {
    const updateData: Partial<ScheduleDocument> = { status };
    
    if (error) {
      updateData.error = error;
    }

    return this.updateSchedule(scheduleId, updateData);
  }

  // Mark schedule as processing
  static async markAsProcessing(scheduleId: string): Promise<void> {
    return this.updateScheduleStatus(scheduleId, 'processing');
  }

  // Mark schedule as completed
  static async markAsCompleted(scheduleId: string): Promise<void> {
    return this.updateScheduleStatus(scheduleId, 'completed');
  }

  // Mark schedule as failed
  static async markAsFailed(scheduleId: string, error: string): Promise<void> {
    return this.updateScheduleStatus(scheduleId, 'failed', error);
  }

  // Reschedule
  static async reschedule(scheduleId: string, newTime: Date): Promise<void> {
    return this.updateSchedule(scheduleId, {
      scheduledTime: newTime,
      status: 'pending',
      error: undefined,
    });
  }

  // Get schedule conflicts
  static async getScheduleConflicts(
    userId: string,
    platform: string,
    scheduledTime: Date,
    windowMinutes: number = 5
  ): Promise<ScheduleDocument[]> {
    const startWindow = new Date(scheduledTime.getTime() - windowMinutes * 60000);
    const endWindow = new Date(scheduledTime.getTime() + windowMinutes * 60000);

    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('platforms', 'array-contains', platform),
      where('status', '==', 'pending'),
      where('scheduledTime', '>=', startWindow),
      where('scheduledTime', '<=', endWindow),
      orderBy('scheduledTime', 'asc'),
    ];

    return FirestoreService.query<ScheduleDocument>(this.collection, constraints);
  }

  // Batch create schedules
  static async batchCreateSchedules(
    schedules: Array<Omit<ScheduleDocument, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    const documents = schedules.map(schedule => ({ ...schedule } as ScheduleDocument));
    return FirestoreService.batchCreate(this.collection, documents);
  }

  // Get schedule statistics
  static async getScheduleStats(userId: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    byPlatform: Record<string, number>;
  }> {
    const constraints: QueryConstraint[] = [where('userId', '==', userId)];
    const allSchedules = await FirestoreService.query<ScheduleDocument>(this.collection, constraints);

    const stats = {
      total: allSchedules.length,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      byPlatform: {} as Record<string, number>,
    };

    allSchedules.forEach(schedule => {
      // Count by status
      stats[schedule.status]++;

      // Count by platform
      schedule.platforms.forEach(platform => {
        stats.byPlatform[platform] = (stats.byPlatform[platform] || 0) + 1;
      });
    });

    return stats;
  }

  // Cancel pending schedules
  static async cancelPendingSchedules(
    userId: string,
    postId?: string
  ): Promise<number> {
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      where('status', '==', 'pending'),
    ];

    if (postId) {
      constraints.push(where('postId', '==', postId));
    }

    const pendingSchedules = await FirestoreService.query<ScheduleDocument>(
      this.collection,
      constraints
    );

    // Update all to failed status
    const updates = pendingSchedules.map(schedule => ({
      id: schedule.id!,
      data: { status: 'failed' as const, error: 'Cancelled by user' } as Partial<ScheduleDocument>,
    }));

    if (updates.length > 0) {
      await FirestoreService.batchUpdate(this.collection, updates);
    }

    return updates.length;
  }
} 