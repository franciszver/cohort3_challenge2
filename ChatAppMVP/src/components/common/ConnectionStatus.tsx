// Connection Status Component - shows network connectivity status
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useConnectionInfo, useNetworkState } from '../../services/network';
import NetworkService from '../../services/network';

interface ConnectionStatusProps {
  showWhenOnline?: boolean; // Whether to show status when connected
  style?: any;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  showWhenOnline = false,
  style,
}) => {
  const connectionInfo = useConnectionInfo();
  const networkState = useNetworkState();
  const [fadeAnim] = React.useState(new Animated.Value(1));

  // Don't show when online unless explicitly requested
  if (networkState.isConnected && !showWhenOnline) {
    return null;
  }

  const handleRetry = async () => {
    // Animate the retry action
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Trigger connectivity check
    await NetworkService.forceRefresh();
  };

  const getStatusBarStyle = () => {
    switch (connectionInfo.status) {
      case 'offline':
        return [styles.statusBar, styles.offlineBar];
      case 'slow':
        return [styles.statusBar, styles.slowBar];
      case 'online':
        return [styles.statusBar, styles.onlineBar];
      default:
        return [styles.statusBar, styles.unknownBar];
    }
  };

  const formatDisconnectedDuration = () => {
    if (networkState.disconnectedDuration === 0) return '';
    
    const seconds = Math.floor(networkState.disconnectedDuration / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <Animated.View style={[getStatusBarStyle(), style, { opacity: fadeAnim }]}>
      <View style={styles.statusContent}>
        <Ionicons 
          name={connectionInfo.icon as any} 
          size={16} 
          color="#ffffff" 
          style={styles.statusIcon}
        />
        
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusText}>
            {connectionInfo.description}
          </Text>
          
          {!networkState.isConnected && networkState.disconnectedDuration > 0 && (
            <Text style={styles.durationText}>
              Offline {formatDisconnectedDuration()}
            </Text>
          )}
        </View>

        {!networkState.isConnected && (
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={handleRetry}
            activeOpacity={0.7}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// Compact version for headers or small spaces
export const ConnectionStatusCompact: React.FC<{ style?: any }> = ({ style }) => {
  const connectionInfo = useConnectionInfo();
  const networkState = useNetworkState();

  if (networkState.isConnected) {
    return null;
  }

  return (
    <View style={[styles.compactStatus, style]}>
      <Ionicons 
        name={connectionInfo.icon as any} 
        size={12} 
        color={connectionInfo.color}
        style={styles.compactIcon}
      />
      <Text style={[styles.compactText, { color: connectionInfo.color }]}>
        {connectionInfo.status === 'offline' ? 'Offline' : 'Poor connection'}
      </Text>
    </View>
  );
};

// Connection dot indicator
export const ConnectionDot: React.FC<{ size?: number; style?: any }> = ({ 
  size = 8, 
  style 
}) => {
  const connectionInfo = useConnectionInfo();
  const [pulseAnim] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    if (connectionInfo.status === 'offline') {
      // Pulse animation for offline state
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [connectionInfo.status]);

  return (
    <Animated.View 
      style={[
        styles.connectionDot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: connectionInfo.color,
          opacity: pulseAnim,
        },
        style,
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  statusBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineBar: {
    backgroundColor: '#FF3B30',
  },
  slowBar: {
    backgroundColor: '#FF9500',
  },
  onlineBar: {
    backgroundColor: '#34C759',
  },
  unknownBar: {
    backgroundColor: '#8E8E93',
  },
  statusContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: 8,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  durationText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  compactStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  compactIcon: {
    marginRight: 4,
  },
  compactText: {
    fontSize: 10,
    fontWeight: '500',
  },
  connectionDot: {
    // Dynamic styles applied inline
  },
});

export default ConnectionStatus;

