// Push Notification Service with Expo Go fallback
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
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

    try {
      // Detect if running in Expo Go
      this.isExpoGo = Constants.appOwnership === 'expo';

      if (this.isExpoGo) {
        console.log('📱 Running in Expo Go - Push notifications will be mocked');
        this.isInitialized = true;
        return;
      }

      // Configure how notifications are handled
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      console.log('📱 Notification service initialized for custom dev client/APK');
      this.isInitialized = true;

    } catch (error) {
      console.error('Error initializing notification service:', error);
      // Gracefully degrade to mock mode
      this.isExpoGo = true;
      this.isInitialized = true;
    }
  }

  /**
   * Request notification permissions and get push token
   * Returns a mock token if running in Expo Go
   */
  static async registerForPushNotifications(): Promise<PushNotificationToken | null> {
    try {
      await this.initialize();

      // Mock token for Expo Go
      if (this.isExpoGo) {
        const mockToken = `mock-expo-push-token-${Date.now()}`;
        this.pushToken = mockToken;
        console.log('📱 Mock push token (Expo Go):', mockToken);
        
        return {
          token: mockToken,
          type: 'expo',
        };
      }

      // Check if physical device
      if (!Device.isDevice) {
        console.warn('📱 Push notifications require a physical device');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('📱 Push notification permissions not granted');
        return null;
      }

      // Get Expo push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      
      if (!projectId) {
        console.warn('📱 No EAS project ID found, using device push token');
        // Fall back to device-specific token
        const deviceToken = await Notifications.getDevicePushTokenAsync();
        this.pushToken = deviceToken.data;
        
        return {
          token: deviceToken.data,
          type: Platform.OS === 'ios' ? 'apns' : 'fcm',
        };
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.pushToken = tokenData.data;
      console.log('📱 Expo push token:', tokenData.data);

      return {
        token: tokenData.data,
        type: 'expo',
      };

    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Send local notification (works in both Expo Go and APK)
   */
  static async sendLocalNotification(content: NotificationContent): Promise<void> {
    try {
      await this.initialize();

      if (this.isExpoGo) {
        // In Expo Go, just log the notification
        console.log('📱 Local notification (Expo Go - would show):', content);
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          data: content.data || {},
          sound: content.sound !== false,
        },
        trigger: null, // Show immediately
      });

      console.log('📱 Local notification sent:', content.title);

    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  /**
   * Schedule notification for later
   */
  static async scheduleNotification(
    content: NotificationContent,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string | null> {
    try {
      await this.initialize();

      if (this.isExpoGo) {
        console.log('📱 Scheduled notification (Expo Go - mock):', content, trigger);
        return `mock-notification-${Date.now()}`;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          data: content.data || {},
          sound: content.sound !== false,
        },
        trigger,
      });

      console.log('📱 Notification scheduled:', notificationId);
      return notificationId;

    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Cancel scheduled notification
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      if (this.isExpoGo) {
        console.log('📱 Cancel notification (Expo Go - mock):', notificationId);
        return;
      }

      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('📱 Notification cancelled:', notificationId);

    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      if (this.isExpoGo) {
        console.log('📱 Cancel all notifications (Expo Go - mock)');
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('📱 All notifications cancelled');

    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
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
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    if (this.isExpoGo) {
      console.log('📱 Notification listener added (Expo Go - mock)');
      // Return mock subscription
      return {
        remove: () => console.log('📱 Notification listener removed (Expo Go - mock)'),
      } as Notifications.Subscription;
    }

    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Add notification response listener (when user taps notification)
   */
  static addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    if (this.isExpoGo) {
      console.log('📱 Notification response listener added (Expo Go - mock)');
      // Return mock subscription
      return {
        remove: () => console.log('📱 Notification response listener removed (Expo Go - mock)'),
      } as Notifications.Subscription;
    }

    return Notifications.addNotificationResponseReceivedListener(callback);
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
        await Notifications.setBadgeCountAsync(count);
        console.log('📱 Badge count set:', count);
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

