// Message Bubble Component - enhanced with sender info and timestamps
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../../types';
import { formatMessageTime, formatFullTimestamp } from '../../utils';
import SenderService, { SenderInfo } from '../../services/sender';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showSender?: boolean;
  showTimestamp?: boolean;
  showAvatar?: boolean;
  isGroup?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: any;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showSender = false,
  showTimestamp = true,
  showAvatar = false,
  isGroup = false,
  onPress,
  onLongPress,
  style,
}) => {
  const [senderInfo, setSenderInfo] = useState<SenderInfo | null>(null);
  const [showFullTimestamp, setShowFullTimestamp] = useState(false);
  const [timestampAnim] = useState(new Animated.Value(0));

  // Fetch sender information - Task 18 ✅
  useEffect(() => {
    const fetchSenderInfo = async () => {
      if (showSender && !isOwnMessage) {
        try {
          const info = await SenderService.getSenderInfo(message.senderId);
          setSenderInfo(info);
        } catch (error) {
          console.error('Error fetching sender info:', error);
        }
      }
    };

    fetchSenderInfo();
  }, [message.senderId, showSender, isOwnMessage]);

  const getBubbleStyle = () => {
    const baseStyle = [styles.bubble];
    
    if (isOwnMessage) {
      baseStyle.push(styles.ownBubble);
    } else {
      baseStyle.push(styles.otherBubble);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.messageText];
    
    if (isOwnMessage) {
      baseStyle.push(styles.ownMessageText);
    } else {
      baseStyle.push(styles.otherMessageText);
    }
    
    return baseStyle;
  };

  const getContainerStyle = () => {
    const baseStyle = [styles.container, style];
    
    if (isOwnMessage) {
      baseStyle.push(styles.ownContainer);
    } else {
      baseStyle.push(styles.otherContainer);
    }
    
    return baseStyle;
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Toggle timestamp view on press
      setShowFullTimestamp(!showFullTimestamp);
      
      // Animate timestamp appearance
      Animated.timing(timestampAnim, {
        toValue: showFullTimestamp ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const getSenderDisplayName = () => {
    if (senderInfo) {
      return senderInfo.displayName;
    }
    return 'Loading...';
  };

  const getSenderInitial = () => {
    if (senderInfo) {
      return SenderService.getSenderInitial(senderInfo);
    }
    return '?';
  };

  const getMessageStatus = () => {
    // Check for optimistic message
    const isOptimistic = (message as any).__optimistic;
    if (isOptimistic) {
      return { icon: 'time-outline', color: '#8E8E93', label: 'Sending...' };
    }

    // Check sync status from cache
    const syncStatus = (message as any).sync_status;
    if (syncStatus === 'pending') {
      return { icon: 'refresh-outline', color: '#FF9500', label: 'Pending sync' };
    } else if (syncStatus === 'failed') {
      return { icon: 'alert-circle-outline', color: '#FF3B30', label: 'Failed to send' };
    }

    // Message sent successfully
    return { icon: 'checkmark-outline', color: '#34C759', label: 'Sent' };
  };

  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={handlePress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.messageGroup}>
        {/* Sender info for group chats */}
        {showSender && !isOwnMessage && (
          <View style={styles.senderHeader}>
            {showAvatar && (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getSenderInitial()}</Text>
              </View>
            )}
            <Text style={styles.senderName}>
              {getSenderDisplayName()}
            </Text>
          </View>
        )}
        
        <View style={getBubbleStyle()}>
          <Text style={getTextStyle()}>
            {message.content}
          </Text>
          
          {/* Message footer with timestamp and status */}
          <View style={styles.messageFooter}>
            {showTimestamp && (
              <Text style={[
                styles.timestamp,
                isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
              ]}>
                {formatMessageTime(message.createdAt)}
              </Text>
            )}
            
            {isOwnMessage && (
              <View style={styles.messageStatus}>
                {(() => {
                  const status = getMessageStatus();
                  return (
                    <Ionicons
                      name={status.icon as any}
                      size={12}
                      color={status.color}
                    />
                  );
                })()}
              </View>
            )}
          </View>
        </View>
        
        {/* Full timestamp (shown on tap) */}
        {showFullTimestamp && (
          <Animated.View 
            style={[
              styles.fullTimestamp,
              isOwnMessage ? styles.fullTimestampOwn : styles.fullTimestampOther,
              { opacity: timestampAnim }
            ]}
          >
            <Text style={styles.fullTimestampText}>
              {formatFullTimestamp(message.createdAt)}
            </Text>
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    marginHorizontal: 16,
  },
  ownContainer: {
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignItems: 'flex-start',
  },
  messageGroup: {
    maxWidth: '80%',
    minWidth: 120,
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 4,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  senderName: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
  },
  bubble: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minWidth: 60,
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '400',
    marginRight: 6,
  },
  ownTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimestamp: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  messageStatus: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullTimestamp: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
  },
  fullTimestampOwn: {
    alignSelf: 'flex-end',
  },
  fullTimestampOther: {
    alignSelf: 'flex-start',
  },
  fullTimestampText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '400',
  },
});

export default MessageBubble;
