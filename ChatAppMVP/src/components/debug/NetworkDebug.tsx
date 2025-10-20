// Network Debug Component - for testing network features during development
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNetworkState, useConnectionInfo } from '../../services/network';
import NetworkService from '../../services/network';
import SyncService from '../../services/sync';
import CacheService from '../../services/cache';

export const NetworkDebug: React.FC = () => {
  const networkState = useNetworkState();
  const connectionInfo = useConnectionInfo();
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);

  const handleSimulateOffline = () => {
    NetworkService.simulateOffline();
    Alert.alert('Debug', 'Simulated offline mode');
  };

  const handleSimulateOnline = () => {
    NetworkService.simulateOnline();
    Alert.alert('Debug', 'Simulated online mode');
  };

  const handleForceSync = async () => {
    try {
      await NetworkService.forceRefresh();
      Alert.alert('Debug', 'Force sync completed');
    } catch (error) {
      Alert.alert('Debug', 'Force sync failed: ' + error);
    }
  };

  const handleGetSyncStatus = async () => {
    try {
      const status = await SyncService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      Alert.alert('Debug', 'Failed to get sync status: ' + error);
    }
  };

  const handleGetCacheStats = async () => {
    try {
      const stats = await CacheService.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      Alert.alert('Debug', 'Failed to get cache stats: ' + error);
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached messages and conversations. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await CacheService.clearAllCache();
            Alert.alert('Debug', 'Cache cleared');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🌐 Network Debug</Text>
      
      {/* Network State */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network State</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Connected:</Text>
          <Text style={[styles.value, { color: networkState.isConnected ? '#34C759' : '#FF3B30' }]}>
            {networkState.isConnected ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Quality:</Text>
          <Text style={styles.value}>{networkState.connectionQuality}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.value, { color: connectionInfo.color }]}>
            {connectionInfo.description}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Last Connected:</Text>
          <Text style={styles.value}>
            {networkState.lastConnectedAt 
              ? new Date(networkState.lastConnectedAt).toLocaleTimeString()
              : 'Never'
            }
          </Text>
        </View>
        {networkState.disconnectedDuration > 0 && (
          <View style={styles.statusRow}>
            <Text style={styles.label}>Offline Duration:</Text>
            <Text style={styles.value}>
              {Math.floor(networkState.disconnectedDuration / 1000)}s
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.offlineButton]} onPress={handleSimulateOffline}>
            <Text style={styles.buttonText}>Simulate Offline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.onlineButton]} onPress={handleSimulateOnline}>
            <Text style={styles.buttonText}>Simulate Online</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.button, styles.syncButton]} onPress={handleForceSync}>
          <Text style={styles.buttonText}>Force Sync</Text>
        </TouchableOpacity>
      </View>

      {/* Sync Status */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sync Status</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleGetSyncStatus}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        {syncStatus ? (
          <>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Pending Messages:</Text>
              <Text style={styles.value}>{syncStatus.pendingMessages}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Sync In Progress:</Text>
              <Text style={styles.value}>{syncStatus.syncInProgress ? 'Yes' : 'No'}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Last Sync:</Text>
              <Text style={styles.value}>
                {syncStatus.lastSyncTime 
                  ? new Date(syncStatus.lastSyncTime).toLocaleTimeString()
                  : 'Never'
                }
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.placeholder}>Tap refresh to load sync status</Text>
        )}
      </View>

      {/* Cache Stats */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cache Stats</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleGetCacheStats}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>
        {cacheStats ? (
          <>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Total Messages:</Text>
              <Text style={styles.value}>{cacheStats.totalMessages}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Conversations:</Text>
              <Text style={styles.value}>{cacheStats.totalConversations}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Pending Messages:</Text>
              <Text style={styles.value}>{cacheStats.pendingMessages}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.placeholder}>Tap refresh to load cache stats</Text>
        )}
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClearCache}>
          <Text style={styles.buttonText}>Clear Cache</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  refreshText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  label: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#666666',
  },
  placeholder: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  offlineButton: {
    backgroundColor: '#FF3B30',
  },
  onlineButton: {
    backgroundColor: '#34C759',
  },
  syncButton: {
    backgroundColor: '#007AFF',
    marginHorizontal: 0,
  },
  clearButton: {
    backgroundColor: '#FF9500',
    marginTop: 12,
    marginHorizontal: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NetworkDebug;

