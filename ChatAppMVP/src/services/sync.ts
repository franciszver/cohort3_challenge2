// Sync Service - handles offline message queuing and background sync
import MessageService from './message';
import ConversationService from './conversation';
import CacheService from './cache';
import { delay } from '../utils';

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: string | null;
  pendingMessages: number;
  syncInProgress: boolean;
  cacheStats: any;
}

class SyncService {
  private static isOnline: boolean = true; // Assume online by default
  private static lastSyncTime: string | null = null;
  private static syncInProgress: boolean = false;

  /**
   * Perform a full sync - messages and conversations
   */
  static async performFullSync(userId: string): Promise<void> {
    if (SyncService.syncInProgress) {
      console.log('🔄 Sync already in progress, skipping...');
      return;
    }

    SyncService.syncInProgress = true;
    
    try {
      console.log('🚀 Starting full sync...');
      
      // 1. Sync pending messages first
      await MessageService.syncPendingMessages();
      
      // 2. Refresh conversations from server
      await ConversationService.fetchConversationsFromServer(userId);
      
      // 3. Clean up expired cache entries
      await CacheService.clearExpiredCache();
      
      SyncService.lastSyncTime = new Date().toISOString();
      console.log('✅ Full sync completed successfully');
      
    } catch (error) {
      console.error('❌ Full sync failed:', error);
      throw error;
    } finally {
      SyncService.syncInProgress = false;
    }
  }

  /**
   * Quick sync for pending messages only
   */
  static async quickSync(): Promise<void> {
    if (SyncService.syncInProgress) {
      console.log('🔄 Sync already in progress, skipping...');
      return;
    }

    try {
      console.log('⚡ Starting quick sync...');
      await MessageService.syncPendingMessages();
      console.log('✅ Quick sync completed');
    } catch (error) {
      console.error('❌ Quick sync failed:', error);
    }
  }

  /**
   * Get current sync status
   */
  static async getSyncStatus(): Promise<SyncStatus> {
    try {
      const messageStatus = await MessageService.getSyncStatus();
      
      return {
        isOnline: SyncService.isOnline,
        lastSyncTime: SyncService.lastSyncTime,
        pendingMessages: messageStatus.pendingMessages,
        syncInProgress: SyncService.syncInProgress,
        cacheStats: messageStatus.cacheStats,
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        isOnline: false,
        lastSyncTime: null,
        pendingMessages: 0,
        syncInProgress: false,
        cacheStats: null,
      };
    }
  }

  /**
   * Simulate going offline (for testing)
   */
  static goOffline(): void {
    SyncService.isOnline = false;
    console.log('📴 Simulated offline mode');
  }

  /**
   * Simulate coming back online and trigger sync
   */
  static async comeOnline(userId: string): Promise<void> {
    SyncService.isOnline = true;
    console.log('📶 Simulated back online - triggering sync');
    
    // Small delay to simulate reconnection
    await delay(1000);
    
    try {
      await SyncService.performFullSync(userId);
    } catch (error) {
      console.error('Error during online sync:', error);
    }
  }

  /**
   * Start background sync interval (for regular sync while online)
   */
  static startBackgroundSync(userId: string, intervalMs: number = 60000): NodeJS.Timeout | null {
    if (!SyncService.isOnline) {
      console.log('📴 Offline - skipping background sync');
      return null;
    }

    console.log(`🔄 Starting background sync every ${intervalMs / 1000}s`);
    
    const interval = setInterval(async () => {
      if (SyncService.isOnline && !SyncService.syncInProgress) {
        try {
          await SyncService.quickSync();
        } catch (error) {
          console.error('Background sync error:', error);
        }
      }
    }, intervalMs);

    return interval;
  }

  /**
   * Stop background sync
   */
  static stopBackgroundSync(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    console.log('🛑 Stopped background sync');
  }

  /**
   * Clear all cached data (for logout)
   */
  static async clearAllData(): Promise<void> {
    try {
      await CacheService.clearAllCache();
      SyncService.lastSyncTime = null;
      console.log('🗑️ All cached data cleared');
    } catch (error) {
      console.error('Error clearing cached data:', error);
    }
  }

  /**
   * Get cache statistics for debugging
   */
  static async getCacheInfo(): Promise<any> {
    try {
      return await CacheService.getCacheStats();
    } catch (error) {
      console.error('Error getting cache info:', error);
      return null;
    }
  }

  /**
   * Manual retry for failed messages
   */
  static async retryFailedMessages(): Promise<void> {
    try {
      console.log('🔄 Manually retrying failed messages...');
      await MessageService.syncPendingMessages();
    } catch (error) {
      console.error('Error retrying failed messages:', error);
    }
  }

  /**
   * Check if device is online (placeholder for real network detection)
   */
  static getOnlineStatus(): boolean {
    return SyncService.isOnline;
  }

  /**
   * Set online status (for testing and manual control)
   */
  static setOnlineStatus(isOnline: boolean): void {
    const wasOnline = SyncService.isOnline;
    SyncService.isOnline = isOnline;
    
    if (!wasOnline && isOnline) {
      console.log('📶 Network connection restored');
    } else if (wasOnline && !isOnline) {
      console.log('📴 Network connection lost');
    }
  }
}

export default SyncService;

