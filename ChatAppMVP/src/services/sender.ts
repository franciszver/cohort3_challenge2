// Sender Service - handles sender name resolution and user information for messages
import { User } from '../types';
import UserService from './user';
import CacheService from './cache';

interface SenderInfo {
  id: string;
  displayName: string;
  username: string;
  avatar?: string;
  status?: string;
}

class SenderService {
  private static senderCache: Map<string, SenderInfo> = new Map();
  private static pendingRequests: Map<string, Promise<SenderInfo | null>> = new Map();

  /**
   * Get sender information by user ID with caching
   */
  static async getSenderInfo(userId: string): Promise<SenderInfo> {
    // Check memory cache first
    const cached = SenderService.senderCache.get(userId);
    if (cached) {
      return cached;
    }

    // Check if there's already a pending request for this user
    const existingRequest = SenderService.pendingRequests.get(userId);
    if (existingRequest) {
      const result = await existingRequest;
      return result || SenderService.getDefaultSenderInfo(userId);
    }

    // Create new request
    const request = SenderService.fetchSenderInfo(userId);
    SenderService.pendingRequests.set(userId, request);

    try {
      const result = await request;
      SenderService.pendingRequests.delete(userId);
      
      if (result) {
        SenderService.senderCache.set(userId, result);
        return result;
      } else {
        const defaultInfo = SenderService.getDefaultSenderInfo(userId);
        SenderService.senderCache.set(userId, defaultInfo);
        return defaultInfo;
      }
    } catch (error) {
      SenderService.pendingRequests.delete(userId);
      console.error('Error fetching sender info:', error);
      
      const defaultInfo = SenderService.getDefaultSenderInfo(userId);
      SenderService.senderCache.set(userId, defaultInfo);
      return defaultInfo;
    }
  }

  /**
   * Fetch sender information from various sources
   */
  private static async fetchSenderInfo(userId: string): Promise<SenderInfo | null> {
    try {
      // First try to get from user cache
      const cachedUser = await CacheService.getCachedUserProfile(userId);
      if (cachedUser) {
        return SenderService.mapUserToSenderInfo(cachedUser);
      }

      // If not in cache, fetch from server
      const user = await UserService.getUserProfile(userId);
      if (user) {
        // Cache the user for future use
        await CacheService.cacheUserProfile(user);
        return SenderService.mapUserToSenderInfo(user);
      }

      return null;
    } catch (error) {
      console.error('Error in fetchSenderInfo:', error);
      return null;
    }
  }

  /**
   * Map User object to SenderInfo
   */
  private static mapUserToSenderInfo(user: User): SenderInfo {
    return {
      id: user.id,
      displayName: user.displayName || user.username || 'Unknown User',
      username: user.username,
      avatar: user.avatar,
      status: user.status,
    };
  }

  /**
   * Get default sender info when user data is not available
   */
  private static getDefaultSenderInfo(userId: string): SenderInfo {
    return {
      id: userId,
      displayName: 'Unknown User',
      username: userId,
      avatar: undefined,
      status: undefined,
    };
  }

  /**
   * Get sender display name (for quick access)
   */
  static async getSenderDisplayName(userId: string): Promise<string> {
    try {
      const senderInfo = await SenderService.getSenderInfo(userId);
      return senderInfo.displayName;
    } catch (error) {
      console.error('Error getting sender display name:', error);
      return 'Unknown User';
    }
  }

  /**
   * Batch fetch multiple sender infos (for message lists)
   */
  static async getBatchSenderInfos(userIds: string[]): Promise<Map<string, SenderInfo>> {
    const results = new Map<string, SenderInfo>();
    
    // Group by cached vs uncached
    const uncachedIds = userIds.filter(id => !SenderService.senderCache.has(id));
    const cachedIds = userIds.filter(id => SenderService.senderCache.has(id));
    
    // Add cached results
    cachedIds.forEach(id => {
      const cached = SenderService.senderCache.get(id);
      if (cached) {
        results.set(id, cached);
      }
    });

    // Fetch uncached in parallel
    if (uncachedIds.length > 0) {
      const fetchPromises = uncachedIds.map(id => 
        SenderService.getSenderInfo(id).then(info => ({ id, info }))
      );

      try {
        const fetchResults = await Promise.all(fetchPromises);
        fetchResults.forEach(({ id, info }) => {
          results.set(id, info);
        });
      } catch (error) {
        console.error('Error in batch fetch:', error);
        // Add default info for failed fetches
        uncachedIds.forEach(id => {
          if (!results.has(id)) {
            results.set(id, SenderService.getDefaultSenderInfo(id));
          }
        });
      }
    }

    return results;
  }

  /**
   * Prefetch sender information for a list of users (background task)
   */
  static async prefetchSenderInfos(userIds: string[]): Promise<void> {
    const uniqueIds = [...new Set(userIds)];
    const uncachedIds = uniqueIds.filter(id => 
      !SenderService.senderCache.has(id) && 
      !SenderService.pendingRequests.has(id)
    );

    if (uncachedIds.length === 0) {
      return;
    }

    console.log(`🔄 Prefetching sender info for ${uncachedIds.length} users`);

    // Start fetching in background (don't await)
    uncachedIds.forEach(id => {
      SenderService.getSenderInfo(id).catch(error => {
        console.error('Error prefetching sender info:', id, error);
      });
    });
  }

  /**
   * Update sender information when user profile changes
   */
  static updateSenderInfo(userId: string, user: User): void {
    const senderInfo = SenderService.mapUserToSenderInfo(user);
    SenderService.senderCache.set(userId, senderInfo);
    console.log('📝 Updated sender info for user:', userId);
  }

  /**
   * Clear sender cache (for logout or memory management)
   */
  static clearSenderCache(): void {
    SenderService.senderCache.clear();
    SenderService.pendingRequests.clear();
    console.log('🗑️ Cleared sender cache');
  }

  /**
   * Get cached sender info (sync, returns null if not cached)
   */
  static getCachedSenderInfo(userId: string): SenderInfo | null {
    return SenderService.senderCache.get(userId) || null;
  }

  /**
   * Check if sender info is cached
   */
  static isSenderCached(userId: string): boolean {
    return SenderService.senderCache.has(userId);
  }

  /**
   * Get sender avatar initial (first letter of name)
   */
  static getSenderInitial(senderInfo: SenderInfo): string {
    const name = senderInfo.displayName || senderInfo.username || '?';
    return name.charAt(0).toUpperCase();
  }

  /**
   * Get cache statistics for debugging
   */
  static getCacheStats(): {
    cachedUsers: number;
    pendingRequests: number;
    cacheSize: number;
  } {
    return {
      cachedUsers: SenderService.senderCache.size,
      pendingRequests: SenderService.pendingRequests.size,
      cacheSize: JSON.stringify(Array.from(SenderService.senderCache.entries())).length,
    };
  }

  /**
   * Trim cache to prevent memory issues
   */
  static trimCache(maxSize: number = 100): void {
    if (SenderService.senderCache.size <= maxSize) {
      return;
    }

    const entries = Array.from(SenderService.senderCache.entries());
    const toKeep = entries.slice(-maxSize); // Keep most recent
    
    SenderService.senderCache.clear();
    toKeep.forEach(([id, info]) => {
      SenderService.senderCache.set(id, info);
    });

    console.log(`🧹 Trimmed sender cache to ${toKeep.length} entries`);
  }
}

export default SenderService;
export type { SenderInfo };

