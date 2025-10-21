// Push Notification Service (AWS-ready placeholder)
import { Platform } from 'react-native';

export interface NotificationContent {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
}

export interface PushNotificationToken {
  token: string;
  type: 'expo' | 'fcm' | 'apns';
}

class NotificationService {
  private static pushToken: string | null = null;
  private static isInitialized: boolean = false;
  private static isExpoGo: boolean = false;

  /**
   * Initialize notification service
   * Detects if running in Expo Go or custom dev client/APK
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('📱 Notification service already initialized');
      return;
    }

    // With AWS SNS/Pinpoint, initialization is app-specific.
    // Keep a lightweight initialization that always succeeds.
    this.isInitialized = true;
  }

  /**
   * Request notification permissions and get push token
   * Returns a mock token if running in Expo Go
   */
  static async registerForPushNotifications(): Promise<PushNotificationToken | null> {
    await this.initialize();
    // Implement AWS SNS/Pinpoint registration here.
    // For now, return null to indicate no local token retrieval.
    console.warn('📱 AWS push registration not implemented yet.');
    return null;
  }

  /**
   * Send local notification (works in both Expo Go and APK)
   */
  static async sendLocalNotification(content: NotificationContent): Promise<void> {
    await this.initialize();
    // Local notifications should be implemented with native FCM/APNs or AWS integrations.
    console.log('📱 Local notification not implemented (AWS path). Requested:', content);
  }

  /**
   * Schedule notification for later
   */
  static async scheduleNotification(
    content: NotificationContent,
    trigger: unknown
  ): Promise<string | null> {
    await this.initialize();
    console.log('📱 Schedule notification not implemented (AWS path). Requested:', content, trigger);
    return null;
  }

  /**
   * Cancel scheduled notification
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    console.log('📱 Cancel notification not implemented (AWS path):', notificationId);
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    console.log('📱 Cancel all notifications not implemented (AWS path)');
  }

  /**
   * Get current push token
   */
  static getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Check if running in Expo Go
   */
  static isRunningInExpoGo(): boolean {
    return this.isExpoGo;
  }

  /**
   * Add notification received listener
   */
  static addNotificationReceivedListener(
    _callback: (notification: unknown) => void
  ): { remove: () => void } {
    console.log('📱 Notification received listener not implemented (AWS path)');
    return { remove: () => {} };
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  static addNotificationResponseListener(
    _callback: (response: unknown) => void
  ): { remove: () => void } {
    console.log('📱 Notification response listener not implemented (AWS path)');
    return { remove: () => {} };
  }

  /**
   * Set notification badge count (iOS)
   */
  static async setBadgeCount(count: number): Promise<void> {
    try {
      if (this.isExpoGo) {
        console.log('📱 Set badge count (Expo Go - mock):', count);
        return;
      }

      if (Platform.OS === 'ios') {
        console.log('📱 iOS badge count not implemented (AWS path):', count);
      }

    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  /**
   * Get notification permissions status
   */
  static async getPermissionsStatus(): Promise<string> {
    try {
      if (this.isExpoGo) {
        return 'granted (Expo Go - mock)';
      }

      const { status } = await Notifications.getPermissionsAsync();
      return status;

    } catch (error) {
      console.error('Error getting permissions status:', error);
      return 'undetermined';
    }
  }

  /**
   * Demo notification for testing
   */
  static async sendTestNotification(): Promise<void> {
    await this.sendLocalNotification({
      title: '🎉 Test Notification',
      body: 'Push notifications are working!',
      data: { test: true },
      sound: true,
    });
  }
}

export default NotificationService;

