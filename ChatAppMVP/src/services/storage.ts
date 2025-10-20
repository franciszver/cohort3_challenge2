// Local storage service for caching and offline persistence
import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  // Local storage methods will be implemented in Task 16
  private static readonly KEYS = {
    USER_PREFERENCES: 'user_preferences',
    CACHED_MESSAGES: 'cached_messages',
    OFFLINE_QUEUE: 'offline_queue',
  };

  static async setItem(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

