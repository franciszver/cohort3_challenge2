// Chat Room Screen - real-time messaging interface
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { ChatStackParamList } from '../../navigation/types';
import { Message, MessageType } from '../../types';
import MessageList from '../../components/chat/MessageList';
import MessageInput from '../../components/chat/MessageInput';
import LoadingScreen from '../../components/common/LoadingScreen';
import AuthService from '../../services/auth';
import MessageService from '../../services/message';
import ConversationService from '../../services/conversation';
import SubscriptionService from '../../services/subscription';
import ConnectionStatus from '../../components/common/ConnectionStatus';
import { generateUniqueId, delay } from '../../utils';

interface ChatRoomScreenProps {
  route: RouteProp<ChatStackParamList, 'ChatRoom'>;
}

export const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({ route }) => {
  const { conversationId, conversationName } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionIds, setSubscriptionIds] = useState<string[]>([]);
  const [isGroup, setIsGroup] = useState<boolean>(false);

  useEffect(() => {
    initializeChatRoom();
  }, [conversationId]);

  // Clean up subscriptions when component unmounts
  useEffect(() => {
    return () => {
      subscriptionIds.forEach(id => SubscriptionService.unsubscribe(id));
      console.log('🔕 Cleaned up subscriptions for conversation:', conversationId);
    };
  }, [subscriptionIds, conversationId]);

  // Reload messages when screen comes into focus (reduced frequency due to real-time)
  useFocusEffect(
    useCallback(() => {
      if (currentUserId && subscriptionIds.length === 0) {
        // Only reload if subscriptions aren't active yet
        handleRefresh();
      }
    }, [currentUserId, subscriptionIds])
  );

  const initializeChatRoom = async () => {
    setError(null);
    try {
      // Get current user
      const user = await AuthService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      setCurrentUserId(user.id);

      // Verify user has access to this conversation and get conversation info
      const hasAccess = await ConversationService.isUserInConversation(conversationId, user.id);
      if (!hasAccess) {
        throw new Error('You do not have access to this conversation');
      }

      // Get conversation details to determine if it's a group chat - Task 18 ✅
      const conversation = await ConversationService.getConversationById(conversationId);
      if (conversation) {
        setIsGroup(conversation.isGroup || conversation.participants.length > 2);
      }

      // Load initial messages with real GraphQL
      await loadMessages(true);

      // Set up real-time subscriptions for instant messaging
      setupRealTimeSubscriptions();
      
    } catch (error: any) {
      console.error('Error initializing chat room:', error);
      setError(error.message || 'Unable to load chat messages');
      Alert.alert(
        'Error',
        error.message || 'Unable to load chat messages. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealTimeSubscriptions = () => {
    try {
      // Set up real-time message subscriptions - Task 15 ✅
      const newSubscriptionIds = SubscriptionService.setupConversationRealTime(
        conversationId,
        {
          onNewMessage: handleNewMessageFromSubscription,
          onMessageUpdate: handleMessageUpdateFromSubscription,
          onMessageDelete: handleMessageDeleteFromSubscription,
        }
      );

      setSubscriptionIds(newSubscriptionIds);
      console.log('🚀 Real-time subscriptions active for conversation:', conversationId);
      
    } catch (error) {
      console.error('Error setting up real-time subscriptions:', error);
    }
  };

  const loadMessages = async (isInitial: boolean = false) => {
    try {
      // Real GraphQL message loading - Task 14 ✅
      const result = await MessageService.getMessagesForConversation({
        conversationId,
        limit: 50,
        nextToken: isInitial ? undefined : nextToken,
      });

      if (isInitial) {
        // Initial load - replace messages
        setMessages(result.messages);
        setNextToken(result.nextToken);
        setHasMore(result.hasMore);
      } else {
        // Load more - append messages
        setMessages(prev => [...result.messages, ...prev]);
        setNextToken(result.nextToken);
        setHasMore(result.hasMore);
      }

    } catch (error: any) {
      console.error('Error loading messages:', error);
      if (isInitial) {
        setError(error.message || 'Failed to load messages');
      }
      // Don't show alert for load more failures
    }
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!currentUserId || isSending || !messageContent.trim()) {
      return;
    }

    setIsSending(true);
    
    // Create optimistic message for immediate UI update
    const optimisticMessage = MessageService.createOptimisticMessage({
      conversationId,
      content: messageContent.trim(),
      senderId: currentUserId,
      messageType: MessageType.TEXT,
    });

    // Add optimistic message immediately for smooth UX
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Real GraphQL message sending - Task 14 ✅
      const sentMessage = await MessageService.sendMessage({
        conversationId,
        content: messageContent.trim(),
        senderId: currentUserId,
        messageType: MessageType.TEXT,
      });

      // Replace optimistic message with real server message
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? sentMessage : msg
      ));

      console.log('✅ Message sent successfully:', sentMessage.id);
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      
      Alert.alert(
        'Message Failed',
        error.message || 'Unable to send message. Please try again.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || !nextToken) return;
    
    setIsLoadingMore(true);
    
    try {
      // Real GraphQL pagination - Task 14 ✅
      await loadMessages(false); // Load more messages (not initial)
      
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    try {
      // Reset pagination state and load fresh messages
      setNextToken(undefined);
      setHasMore(false);
      setError(null);
      await loadMessages(true); // Fresh reload
    } catch (error) {
      console.error('Error refreshing messages:', error);
    }
  };

  const handleMessagePress = (message: Message) => {
    console.log('Message pressed:', message.id);
    // Future: Show message details, reactions, etc.
  };

  const handleMessageLongPress = (message: Message) => {
    console.log('Message long pressed:', message.id);
    // Future: Show message options (copy, delete, reply, etc.)
  };

  // Real-time subscription callbacks - Task 15 ✅
  const handleNewMessageFromSubscription = (newMessage: Message) => {
    // Avoid duplicate messages (don't add if we sent it or already have it)
    setMessages(prev => {
      // Check if message already exists (optimistic UI or already loaded)
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) {
        console.log('📋 Message already exists, skipping:', newMessage.id);
        return prev;
      }

      // Don't add messages we sent ourselves (already handled by optimistic UI)
      if (newMessage.senderId === currentUserId) {
        console.log('📤 Ignoring our own message from subscription:', newMessage.id);
        return prev;
      }

      console.log('🔔 Adding new message from subscription:', newMessage.id);
      return [...prev, newMessage].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
  };

  const handleMessageUpdateFromSubscription = (updatedMessage: Message) => {
    setMessages(prev => prev.map(msg => 
      msg.id === updatedMessage.id ? updatedMessage : msg
    ));
    console.log('📝 Updated message from subscription:', updatedMessage.id);
  };

  const handleMessageDeleteFromSubscription = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    console.log('🗑️ Deleted message from subscription:', messageId);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error && messages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={initializeChatRoom}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatContainer}>
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            isGroup={isGroup}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
            onRefresh={handleRefresh}
            onMessagePress={handleMessagePress}
            onMessageLongPress={handleMessageLongPress}
          />
          
          {/* Connection status bar - shows when offline */}
          <ConnectionStatus showWhenOnline={false} />
          
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={isSending}
            placeholder={`Message ${conversationName || 'chat'}...`}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardContainer: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChatRoomScreen;