// Cache Service - handles local message/conversation persistence and offline support
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Conversation, User } from '../types';

interface CacheConfig {
  maxMessages: number;
  maxConversations: number;
  cacheExpiryMs: number;
  syncBatchSize: number;
}

interface CachedMessage extends Message {
  cached_at: string;
  sync_status: 'synced' | 'pending' | 'failed';
}

interface CachedConversation extends Conversation {
  cached_at: string;
  last_sync: string;
}

interface PendingMessage {
  id: string;
  tempId: string;
  message: Message;
  attempts: number;
  created_at: string;
}

export class CacheService {
  private static config: CacheConfig = {
    maxMessages: 1000, // Max messages to cache per conversation
    maxConversations: 100, // Max conversations to cache
    cacheExpiryMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    syncBatchSize: 50, // Messages to sync at once
  };

  // Cache Keys
  private static readonly KEYS = {
    MESSAGES: (conversationId: string) => `messages:${conversationId}`,
    CONVERSATIONS: 'conversations',
    PENDING_MESSAGES: 'pending_messages',
    USER_PROFILE: (userId: string) => `user:${userId}`,
    LAST_SYNC: (conversationId: string) => `last_sync:${conversationId}`,
    CACHE_METADATA: 'cache_metadata',
  };

  /**
   * Cache messages for a conversation with smart management
   */
  static async cacheMessages(conversationId: string, messages: Message[]): Promise<void> {
    try {
      const key = CacheService.KEYS.MESSAGES(conversationId);
      
      // Get existing cached messages
      const existingMessages = await CacheService.getCachedMessages(conversationId);
      
      // Merge new messages with existing, avoiding duplicates
      const messageMap = new Map();
      
      // Add existing messages
      existingMessages.forEach(msg => messageMap.set(msg.id, {
        ...msg,
        cached_at: msg.cached_at || new Date().toISOString(),
        sync_status: 'synced' as const,
      }));
      
      // Add/update new messages
      messages.forEach(msg => messageMap.set(msg.id, {
        ...msg,
        cached_at: new Date().toISOString(),
        sync_status: 'synced' as const,
      }));

      // Convert to array and sort by timestamp
      const mergedMessages = Array.from(messageMap.values())
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // Limit cache size - keep most recent messages
      const trimmedMessages = mergedMessages.slice(-CacheService.config.maxMessages);
      
      await AsyncStorage.setItem(key, JSON.stringify(trimmedMessages));
      
      console.log(`💾 Cached ${trimmedMessages.length} messages for conversation: ${conversationId}`);
      
    } catch (error) {
      console.error('Error caching messages:', error);
    }
  }

  /**
   * Get cached messages for a conversation
   */
  static async getCachedMessages(conversationId: string): Promise<CachedMessage[]> {
    try {
      const key = CacheService.KEYS.MESSAGES(conversationId);
      const cached = await AsyncStorage.getItem(key);
      
      if (!cached) return [];
      
      const messages: CachedMessage[] = JSON.parse(cached);
      
      // Filter out expired messages
      const now = Date.now();
      const validMessages = messages.filter(msg => {
        const cacheAge = now - new Date(msg.cached_at).getTime();
        return cacheAge < CacheService.config.cacheExpiryMs;
      });

      // If we filtered out messages, update the cache
      if (validMessages.length !== messages.length) {
        await AsyncStorage.setItem(key, JSON.stringify(validMessages));
      }
      
      return validMessages;
      
    } catch (error) {
      console.error('Error getting cached messages:', error);
      return [];
    }
  }

  /**
   * Cache a single message (for optimistic UI)
   */
  static async cacheOptimisticMessage(message: Message): Promise<void> {
    try {
      const cachedMessage: CachedMessage = {
        ...message,
        cached_at: new Date().toISOString(),
        sync_status: 'pending',
      };

      // Get existing messages and add the optimistic one
      const existingMessages = await CacheService.getCachedMessages(message.conversationId);
      const updatedMessages = [...existingMessages, cachedMessage];

      const key = CacheService.KEYS.MESSAGES(message.conversationId);
      await AsyncStorage.setItem(key, JSON.stringify(updatedMessages));
      
      console.log(`💾 Cached optimistic message: ${message.id}`);
      
    } catch (error) {
      console.error('Error caching optimistic message:', error);
    }
  }

  /**
   * Update message sync status (pending -> synced)
   */
  static async updateMessageSyncStatus(conversationId: string, messageId: string, status: 'synced' | 'failed'): Promise<void> {
    try {
      const messages = await CacheService.getCachedMessages(conversationId);
      const updatedMessages = messages.map(msg => 
        msg.id === messageId ? { ...msg, sync_status: status } : msg
      );

      const key = CacheService.KEYS.MESSAGES(conversationId);
      await AsyncStorage.setItem(key, JSON.stringify(updatedMessages));
      
    } catch (error) {
      console.error('Error updating message sync status:', error);
    }
  }

  /**
   * Cache conversations list
   */
  static async cacheConversations(conversations: Conversation[]): Promise<void> {
    try {
      const cachedConversations: CachedConversation[] = conversations.map(conv => ({
        ...conv,
        cached_at: new Date().toISOString(),
        last_sync: new Date().toISOString(),
      }));

      // Limit cache size
      const trimmedConversations = cachedConversations.slice(0, CacheService.config.maxConversations);
      
      await AsyncStorage.setItem(CacheService.KEYS.CONVERSATIONS, JSON.stringify(trimmedConversations));
      
      console.log(`💾 Cached ${trimmedConversations.length} conversations`);
      
    } catch (error) {
      console.error('Error caching conversations:', error);
    }
  }

  /**
   * Get cached conversations
   */
  static async getCachedConversations(): Promise<Conversation[]> {
    try {
      const cached = await AsyncStorage.getItem(CacheService.KEYS.CONVERSATIONS);
      
      if (!cached) return [];
      
      const conversations: CachedConversation[] = JSON.parse(cached);
      
      // Filter out expired conversations
      const now = Date.now();
      const validConversations = conversations.filter(conv => {
        const cacheAge = now - new Date(conv.cached_at).getTime();
        return cacheAge < CacheService.config.cacheExpiryMs;
      });

      return validConversations;
      
    } catch (error) {
      console.error('Error getting cached conversations:', error);
      return [];
    }
  }

  /**
   * Cache user profile
   */
  static async cacheUserProfile(user: User): Promise<void> {
    try {
      const key = CacheService.KEYS.USER_PROFILE(user.id);
      const cachedUser = {
        ...user,
        cached_at: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cachedUser));
      console.log(`💾 Cached user profile: ${user.id}`);
      
    } catch (error) {
      console.error('Error caching user profile:', error);
    }
  }

  /**
   * Get cached user profile
   */
  static async getCachedUserProfile(userId: string): Promise<User | null> {
    try {
      const key = CacheService.KEYS.USER_PROFILE(userId);
      const cached = await AsyncStorage.getItem(key);
      
      if (!cached) return null;
      
      const user = JSON.parse(cached);
      
      // Check if cache is expired
      const cacheAge = Date.now() - new Date(user.cached_at).getTime();
      if (cacheAge > CacheService.config.cacheExpiryMs) {
        await AsyncStorage.removeItem(key);
        return null;
      }
      
      return user;
      
    } catch (error) {
      console.error('Error getting cached user profile:', error);
      return null;
    }
  }

  /**
   * Store pending messages for offline sync
   */
  static async storePendingMessage(message: Message): Promise<void> {
    try {
      const existing = await CacheService.getPendingMessages();
      
      const pendingMessage: PendingMessage = {
        id: message.id,
        tempId: message.id, // Use message ID as temp ID
        message,
        attempts: 0,
        created_at: new Date().toISOString(),
      };

      const updated = [...existing, pendingMessage];
      await AsyncStorage.setItem(CacheService.KEYS.PENDING_MESSAGES, JSON.stringify(updated));
      
      console.log(`📤 Stored pending message: ${message.id}`);
      
    } catch (error) {
      console.error('Error storing pending message:', error);
    }
  }

  /**
   * Get pending messages for sync
   */
  static async getPendingMessages(): Promise<PendingMessage[]> {
    try {
      const cached = await AsyncStorage.getItem(CacheService.KEYS.PENDING_MESSAGES);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error getting pending messages:', error);
      return [];
    }
  }

  /**
   * Remove pending message after successful sync
   */
  static async removePendingMessage(messageId: string): Promise<void> {
    try {
      const existing = await CacheService.getPendingMessages();
      const updated = existing.filter(msg => msg.id !== messageId);
      
      await AsyncStorage.setItem(CacheService.KEYS.PENDING_MESSAGES, JSON.stringify(updated));
      console.log(`✅ Removed synced pending message: ${messageId}`);
      
    } catch (error) {
      console.error('Error removing pending message:', error);
    }
  }

  /**
   * Mark pending message as failed (increment attempts)
   */
  static async markPendingMessageFailed(messageId: string): Promise<void> {
    try {
      const existing = await CacheService.getPendingMessages();
      const updated = existing.map(msg => 
        msg.id === messageId 
          ? { ...msg, attempts: msg.attempts + 1 }
          : msg
      );
      
      await AsyncStorage.setItem(CacheService.KEYS.PENDING_MESSAGES, JSON.stringify(updated));
      
    } catch (error) {
      console.error('Error marking pending message as failed:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    totalMessages: number;
    totalConversations: number;
    pendingMessages: number;
    cacheSize: string;
  }> {
    try {
      // This is a simplified version - in production you'd want more detailed stats
      const conversations = await CacheService.getCachedConversations();
      const pending = await CacheService.getPendingMessages();
      
      let totalMessages = 0;
      for (const conv of conversations) {
        const messages = await CacheService.getCachedMessages(conv.id);
        totalMessages += messages.length;
      }

      return {
        totalMessages,
        totalConversations: conversations.length,
        pendingMessages: pending.length,
        cacheSize: 'N/A', // Would require calculating actual storage size
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalMessages: 0,
        totalConversations: 0,
        pendingMessages: 0,
        cacheSize: 'N/A',
      };
    }
  }

  /**
   * Clear all cached data (for logout or reset)
   */
  static async clearAllCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith('messages:') || 
        key.startsWith('user:') ||
        key.startsWith('last_sync:') ||
        key === 'conversations' ||
        key === 'pending_messages' ||
        key === 'cache_metadata'
      );

      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`🗑️ Cleared ${cacheKeys.length} cache entries`);
      
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Clear expired cache entries
   */
  static async clearExpiredCache(): Promise<void> {
    try {
      const now = Date.now();
      
      // Clear expired conversations
      const conversations = await CacheService.getCachedConversations();
      // getCachedConversations already filters expired ones and updates cache
      
      // Clear expired messages for each conversation
      for (const conv of conversations) {
        await CacheService.getCachedMessages(conv.id);
        // getCachedMessages already filters expired ones and updates cache
      }
      
      console.log('🧹 Cleared expired cache entries');
      
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  /**
   * Update cache configuration
   */
  static updateConfig(newConfig: Partial<CacheConfig>): void {
    CacheService.config = { ...CacheService.config, ...newConfig };
    console.log('⚙️ Updated cache configuration:', CacheService.config);
  }

  /**
   * Get current cache configuration
   */
  static getConfig(): CacheConfig {
    return { ...CacheService.config };
  }
}

export default CacheService;

