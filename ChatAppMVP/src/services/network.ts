// Network Service - handles online/offline detection and connection management
import { useState, useEffect } from 'react';
import SyncService from './sync';
import { delay } from '../utils';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
  lastConnectedAt: string | null;
  disconnectedDuration: number; // milliseconds
}

export type NetworkListener = (state: NetworkState) => void;

class NetworkService {
  private static networkState: NetworkState = {
    isConnected: true,
    isInternetReachable: true,
    connectionType: 'wifi',
    connectionQuality: 'excellent',
    lastConnectedAt: new Date().toISOString(),
    disconnectedDuration: 0,
  };

  private static listeners: Set<NetworkListener> = new Set();
  private static checkInterval: NodeJS.Timeout | null = null;
  private static disconnectedAt: number | null = null;
  private static currentUserId: string | null = null;

  /**
   * Initialize network monitoring
   */
  static initialize(userId: string): void {
    NetworkService.currentUserId = userId;
    
    // Start periodic network checks
    NetworkService.startNetworkMonitoring();
    
    // Perform initial connectivity test
    NetworkService.checkConnectivity();
    
    console.log('🌐 Network monitoring initialized for user:', userId);
  }

  /**
   * Start monitoring network connectivity
   */
  private static startNetworkMonitoring(): void {
    // Check connectivity every 10 seconds
    NetworkService.checkInterval = setInterval(() => {
      NetworkService.checkConnectivity();
    }, 10000);

    console.log('📡 Started network monitoring');
  }

  /**
   * Stop network monitoring
   */
  static stopNetworkMonitoring(): void {
    if (NetworkService.checkInterval) {
      clearInterval(NetworkService.checkInterval);
      NetworkService.checkInterval = null;
    }
    console.log('🛑 Stopped network monitoring');
  }

  /**
   * Check internet connectivity by testing API endpoint
   */
  private static async checkConnectivity(): Promise<void> {
    try {
      // Try to reach a lightweight endpoint to test connectivity
      // In a real app, you might use a dedicated health check endpoint
      const testUrl = 'https://www.google.com/generate_204';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(testUrl, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);

      const isConnected = response.status === 204 || response.ok;
      await NetworkService.updateConnectionState(isConnected, 'good');

    } catch (error) {
      console.log('🔴 Network connectivity test failed:', error);
      await NetworkService.updateConnectionState(false, 'poor');
    }
  }

  /**
   * Update connection state and notify listeners
   */
  private static async updateConnectionState(
    isConnected: boolean, 
    quality: NetworkState['connectionQuality']
  ): Promise<void> {
    const wasConnected = NetworkService.networkState.isConnected;
    const now = Date.now();

    // Calculate disconnected duration
    let disconnectedDuration = 0;
    if (!wasConnected && NetworkService.disconnectedAt) {
      disconnectedDuration = now - NetworkService.disconnectedAt;
    }

    // Update state
    const newState: NetworkState = {
      ...NetworkService.networkState,
      isConnected,
      isInternetReachable: isConnected,
      connectionQuality: quality,
      lastConnectedAt: isConnected ? new Date().toISOString() : NetworkService.networkState.lastConnectedAt,
      disconnectedDuration,
    };

    NetworkService.networkState = newState;

    // Handle connection state changes
    if (!wasConnected && isConnected) {
      // Just came back online
      NetworkService.disconnectedAt = null;
      await NetworkService.handleConnectionRestored();
    } else if (wasConnected && !isConnected) {
      // Just went offline
      NetworkService.disconnectedAt = now;
      NetworkService.handleConnectionLost();
    }

    // Notify all listeners
    NetworkService.notifyListeners(newState);
  }

  /**
   * Handle connection restored (came back online)
   */
  private static async handleConnectionRestored(): Promise<void> {
    console.log('🟢 Connection restored - triggering sync');
    
    try {
      // Update sync service
      SyncService.setOnlineStatus(true);
      
      // Trigger sync after a short delay to let connection stabilize
      await delay(2000);
      
      if (NetworkService.currentUserId) {
        await SyncService.performFullSync(NetworkService.currentUserId);
      }
      
    } catch (error) {
      console.error('Error during connection restoration sync:', error);
    }
  }

  /**
   * Handle connection lost (went offline)
   */
  private static handleConnectionLost(): void {
    console.log('🔴 Connection lost - entering offline mode');
    
    // Update sync service
    SyncService.setOnlineStatus(false);
  }

  /**
   * Add network state listener
   */
  static addListener(listener: NetworkListener): void {
    NetworkService.listeners.add(listener);
    
    // Immediately call with current state
    listener(NetworkService.networkState);
  }

  /**
   * Remove network state listener
   */
  static removeListener(listener: NetworkListener): void {
    NetworkService.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state change
   */
  private static notifyListeners(state: NetworkState): void {
    NetworkService.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  /**
   * Get current network state
   */
  static getNetworkState(): NetworkState {
    return { ...NetworkService.networkState };
  }

  /**
   * Manual connectivity test (for user-triggered refresh)
   */
  static async testConnectivity(): Promise<boolean> {
    console.log('🔍 Manual connectivity test...');
    
    try {
      await NetworkService.checkConnectivity();
      return NetworkService.networkState.isConnected;
    } catch (error) {
      console.error('Manual connectivity test failed:', error);
      return false;
    }
  }

  /**
   * Force refresh/retry connection
   */
  static async forceRefresh(): Promise<void> {
    console.log('🔄 Force refreshing connection...');
    
    try {
      await NetworkService.checkConnectivity();
      
      if (NetworkService.networkState.isConnected && NetworkService.currentUserId) {
        await SyncService.performFullSync(NetworkService.currentUserId);
      }
    } catch (error) {
      console.error('Force refresh failed:', error);
    }
  }

  /**
   * Simulate offline mode (for testing)
   */
  static simulateOffline(): void {
    console.log('📴 Simulating offline mode');
    NetworkService.updateConnectionState(false, 'poor');
  }

  /**
   * Simulate online mode (for testing)
   */
  static simulateOnline(): void {
    console.log('📶 Simulating online mode');
    NetworkService.updateConnectionState(true, 'excellent');
  }

  /**
   * Get connection quality indicators
   */
  static getConnectionInfo(): {
    status: string;
    color: string;
    icon: string;
    description: string;
  } {
    const state = NetworkService.networkState;
    
    if (!state.isConnected) {
      return {
        status: 'offline',
        color: '#FF3B30',
        icon: 'cloud-offline-outline',
        description: 'No internet connection',
      };
    }

    switch (state.connectionQuality) {
      case 'excellent':
        return {
          status: 'online',
          color: '#34C759',
          icon: 'cloud-done-outline',
          description: 'Connected',
        };
      case 'good':
        return {
          status: 'online',
          color: '#34C759',
          icon: 'cloud-outline',
          description: 'Connected',
        };
      case 'poor':
        return {
          status: 'slow',
          color: '#FF9500',
          icon: 'cloud-outline',
          description: 'Slow connection',
        };
      default:
        return {
          status: 'unknown',
          color: '#8E8E93',
          icon: 'help-circle-outline',
          description: 'Connection unknown',
        };
    }
  }

  /**
   * Clean up resources
   */
  static cleanup(): void {
    NetworkService.stopNetworkMonitoring();
    NetworkService.listeners.clear();
    NetworkService.currentUserId = null;
    console.log('🧹 Network service cleaned up');
  }
}

/**
 * React hook for network state
 */
export function useNetworkState(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>(
    NetworkService.getNetworkState()
  );

  useEffect(() => {
    const listener: NetworkListener = (state) => {
      setNetworkState(state);
    };

    NetworkService.addListener(listener);

    return () => {
      NetworkService.removeListener(listener);
    };
  }, []);

  return networkState;
}

/**
 * React hook for connection info
 */
export function useConnectionInfo() {
  const networkState = useNetworkState();
  
  return {
    ...NetworkService.getConnectionInfo(),
    networkState,
  };
}

export default NetworkService;
