// Chat List Screen - shows all user conversations with search and management
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ChatNavigationProp } from '../../navigation/types';
import { Conversation, User } from '../../types';
import LoadingScreen from '../../components/common/LoadingScreen';
import AuthService from '../../services/auth';
import ConversationService from '../../services/conversation';
import UserService from '../../services/user';
import SubscriptionService from '../../services/subscription';
import { ConnectionStatusCompact, ConnectionDot } from '../../components/common/ConnectionStatus';
import ConversationSearch from '../../components/chat/ConversationSearch';
import ConversationActions from '../../components/chat/ConversationActions';
import { formatConversationTime } from '../../utils';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
  onLongPress: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ 
  conversation, 
  onPress,
  onLongPress
}) => {
  const getDisplayName = () => {
    if (conversation.isGroup) {
      return conversation.name || 'Group Chat';
    }
    
    // For 1-on-1 chats, we'd normally show the other participant's name
    // For now, using a placeholder
    return 'Chat Partner';
  };

  const getAvatarText = () => {
    const displayName = getDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) {
      return 'No messages yet';
    }
    
    return conversation.lastMessage;
  };

  const getAvatarColor = () => {
    // Generate color based on conversation ID for consistency
    const colors = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#FF2D92'];
    const hash = conversation.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <TouchableOpacity 
      style={styles.conversationItem} 
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.avatarContainer, { backgroundColor: getAvatarColor() }]}>
        <Text style={styles.avatarText}>{getAvatarText()}</Text>
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName} numberOfLines={1}>
            {getDisplayName()}
          </Text>
          <View style={styles.conversationMeta}>
            <Text style={styles.conversationTime}>
              {conversation.lastMessageAt ? formatConversationTime(conversation.lastMessageAt) : ''}
            </Text>
            {conversation.isGroup && (
              <Ionicons name="people" size={12} color="#8E8E93" style={styles.groupIcon} />
            )}
          </View>
        </View>
        
        <View style={styles.conversationFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {getLastMessagePreview()}
          </Text>
          
          <View style={styles.badgeContainer}>
            {conversation.unreadCount && conversation.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<ChatNavigationProp>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [subscriptionIds, setSubscriptionIds] = useState<string[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isActionsVisible, setIsActionsVisible] = useState(false);

  useEffect(() => {
    initializeChatList();
  }, []);

  // Clean up subscriptions when component unmounts
  useEffect(() => {
    return () => {
      subscriptionIds.forEach(id => SubscriptionService.unsubscribe(id));
      console.log('🔕 Cleaned up conversation list subscriptions');
    };
  }, [subscriptionIds]);

  const initializeChatList = async () => {
    try {
      // Get current user
      const user = await AuthService.getCurrentUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      await loadConversations();

      // Set up real-time conversation subscriptions
      setupRealTimeSubscriptions();
      
    } catch (error) {
      console.error('Error initializing chat list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealTimeSubscriptions = () => {
    if (!currentUserId) return;
    
    try {
      // Set up real-time conversation list subscriptions - Task 15 ✅
      const newSubscriptionIds = SubscriptionService.setupConversationListRealTime(
        currentUserId,
        {
          onNewConversation: handleNewConversationFromSubscription,
          onConversationUpdate: handleConversationUpdateFromSubscription,
        }
      );

      setSubscriptionIds(newSubscriptionIds);
      console.log('🚀 Real-time conversation list subscriptions active for user:', currentUserId);
      
    } catch (error) {
      console.error('Error setting up conversation list subscriptions:', error);
    }
  };

  const loadConversations = async () => {
    if (!currentUserId) return;
    
    try {
      // Real GraphQL conversation loading - Task 14 ✅
      const userConversations = await ConversationService.getUserConversations(currentUserId);
      
      // If no conversations exist, create a sample conversation for demo
      if (userConversations.length === 0) {
        console.log('No conversations found. Creating sample conversation for demo...');
        
        try {
          // Create a sample conversation with self (for demo purposes)
          const sampleConversation = await ConversationService.createConversation({
            participants: [currentUserId],
            createdBy: currentUserId,
            name: 'Welcome Chat',
            description: 'Your first conversation!',
            isGroup: false,
          });
          
          setConversations([sampleConversation]);
        } catch (createError) {
          console.error('Error creating sample conversation:', createError);
          setConversations([]);
        }
      } else {
        setConversations(userConversations);
      }
      
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      setConversations([]); // Show empty state on error
    }
  };

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate('ChatRoom', {
      conversationId: conversation.id,
      conversationName: conversation.isGroup ? conversation.name : undefined,
    });
  };

  const handleConversationLongPress = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsActionsVisible(true);
  };

  const handleSearchPress = () => {
    setIsSearchVisible(true);
  };

  const handleCloseSearch = () => {
    setIsSearchVisible(false);
  };

  const handleSearchConversationSelect = (conversation: Conversation) => {
    setIsSearchVisible(false);
    handleConversationPress(conversation);
  };

  const handleNewChatWithUser = async (user: User) => {
    try {
      const conversation = await ConversationService.findOrCreateDirectConversation(
        currentUserId,
        user.id
      );
      setIsSearchVisible(false);
      handleConversationPress(conversation);
    } catch (error) {
      console.error('Error starting chat with user:', error);
      Alert.alert('Error', 'Failed to start conversation with user');
    }
  };

  const handleLeaveConversation = async (conversationId: string) => {
    try {
      // For now, just remove from local state - in a real app you'd call API
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      Alert.alert('Success', 'Left conversation');
    } catch (error) {
      console.error('Error leaving conversation:', error);
      Alert.alert('Error', 'Failed to leave conversation');
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      // For now, just remove from local state - in a real app you'd call API
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      Alert.alert('Success', 'Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      Alert.alert('Error', 'Failed to delete conversation');
    }
  };

  const handleMuteConversation = async (conversationId: string, isMuted: boolean) => {
    try {
      // For now, just show feedback - in a real app you'd update conversation settings
      Alert.alert('Success', `Conversation ${isMuted ? 'muted' : 'unmuted'}`);
    } catch (error) {
      console.error('Error muting conversation:', error);
      Alert.alert('Error', 'Failed to update conversation settings');
    }
  };

  const handleArchiveConversation = async (conversationId: string, isArchived: boolean) => {
    try {
      // For now, just remove from list when archived - in a real app you'd update metadata
      if (isArchived) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      }
      Alert.alert('Success', `Conversation ${isArchived ? 'archived' : 'unarchived'}`);
    } catch (error) {
      console.error('Error archiving conversation:', error);
      Alert.alert('Error', 'Failed to archive conversation');
    }
  };

  const handleRenameConversation = async (conversationId: string, newName: string) => {
    try {
      // Update local state - in a real app you'd call ConversationService.updateConversation
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, name: newName }
          : conv
      ));
      Alert.alert('Success', 'Conversation renamed');
    } catch (error) {
      console.error('Error renaming conversation:', error);
      Alert.alert('Error', 'Failed to rename conversation');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadConversations();
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <ConversationItem
      conversation={item}
      onPress={() => handleConversationPress(item)}
      onLongPress={() => handleConversationLongPress(item)}
    />
  );

  const handleCreateDemoChat = async () => {
    if (!currentUserId) return;
    
    try {
      const demoConversation = await ConversationService.createConversation({
        participants: [currentUserId],
        createdBy: currentUserId,
        name: 'Demo Chat',
        description: 'Test out the messaging system!',
        isGroup: false,
      });
      
      // Navigate directly to the new chat
      navigation.navigate('ChatRoom', {
        conversationId: demoConversation.id,
        conversationName: demoConversation.name,
      });
      
    } catch (error) {
      console.error('Error creating demo chat:', error);
    }
  };

  // Real-time subscription callbacks - Task 15 ✅
  const handleNewConversationFromSubscription = (newConversation: Conversation) => {
    setConversations(prev => {
      // Check if conversation already exists
      const exists = prev.some(conv => conv.id === newConversation.id);
      if (exists) {
        console.log('📋 Conversation already exists, skipping:', newConversation.id);
        return prev;
      }

      console.log('🔔 Adding new conversation from subscription:', newConversation.id);
      return [newConversation, ...prev].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
  };

  const handleConversationUpdateFromSubscription = (updatedConversation: Conversation) => {
    setConversations(prev => {
      const updated = prev.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      );
      
      // Resort by updatedAt to move updated conversations to top
      return updated.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
    console.log('🔄 Updated conversation from subscription:', updatedConversation.id);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptySubtitle}>
        Start chatting with someone to see your conversations here!
      </Text>
      <TouchableOpacity style={styles.demoChatButton} onPress={handleCreateDemoChat}>
        <Text style={styles.demoChatButtonText}>Start Demo Chat</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return <LoadingScreen message="Loading conversations..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header with search and actions */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Messages</Text>
          <ConnectionDot size={10} style={styles.connectionDot} />
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleSearchPress}>
            <Ionicons name="search" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleCreateDemoChat}>
            <Ionicons name="add" size={28} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ConnectionStatusCompact style={styles.connectionStatus} />

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        style={styles.conversationList}
        contentContainerStyle={[
          styles.conversationListContent,
          conversations.length === 0 && styles.emptyListContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Search Modal */}
      {isSearchVisible && (
        <Modal
          visible={isSearchVisible}
          animationType="slide"
          onRequestClose={handleCloseSearch}
        >
          <SafeAreaView style={styles.modalContainer}>
            <ConversationSearch
              conversations={conversations}
              currentUserId={currentUserId}
              onConversationSelect={handleSearchConversationSelect}
              onNewChatWithUser={handleNewChatWithUser}
              onClose={handleCloseSearch}
            />
          </SafeAreaView>
        </Modal>
      )}

      {/* Conversation Actions Modal */}
      {selectedConversation && (
        <ConversationActions
          conversation={selectedConversation}
          isVisible={isActionsVisible}
          onClose={() => {
            setIsActionsVisible(false);
            setSelectedConversation(null);
          }}
          onLeaveConversation={handleLeaveConversation}
          onDeleteConversation={handleDeleteConversation}
          onMuteConversation={handleMuteConversation}
          onArchiveConversation={handleArchiveConversation}
          onRenameConversation={handleRenameConversation}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#ffffff',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  connectionDot: {
    marginLeft: 8,
  },
  connectionStatus: {
    // Styles applied from component
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  conversationList: {
    flex: 1,
  },
  conversationListContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationTime: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
  },
  groupIcon: {
    marginLeft: 4,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
    lineHeight: 18,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  demoChatButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  demoChatButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default ChatListScreen;