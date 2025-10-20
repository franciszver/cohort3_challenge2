// Conversation Search Component - search conversations and discover users
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Conversation, User } from '../../types';
import ConversationService from '../../services/conversation';
import UserService from '../../services/user';
import SenderService from '../../services/sender';
import { formatConversationTime } from '../../utils';

interface SearchResult {
  type: 'conversation' | 'user';
  id: string;
  data: Conversation | User;
}

interface ConversationSearchProps {
  conversations: Conversation[];
  currentUserId: string;
  onConversationSelect: (conversation: Conversation) => void;
  onNewChatWithUser: (user: User) => void;
  onClose: () => void;
}

export const ConversationSearch: React.FC<ConversationSearchProps> = ({
  conversations,
  currentUserId,
  onConversationSelect,
  onNewChatWithUser,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  // Load all users for user discovery
  useEffect(() => {
    loadUsers();
  }, []);

  // Perform search when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      performSearch(searchQuery.trim());
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, conversations, users]);

  const loadUsers = async () => {
    try {
      const allUsers = await UserService.listUsers();
      // Filter out current user
      const otherUsers = allUsers.filter(user => user.id !== currentUserId);
      setUsers(otherUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const performSearch = (query: string) => {
    setIsSearching(true);
    
    try {
      const results: SearchResult[] = [];
      const lowerQuery = query.toLowerCase();

      // Search conversations
      conversations.forEach(conversation => {
        let matches = false;
        
        // Search by conversation name
        if (conversation.name && conversation.name.toLowerCase().includes(lowerQuery)) {
          matches = true;
        }
        
        // Search by last message content
        if (conversation.lastMessage && conversation.lastMessage.toLowerCase().includes(lowerQuery)) {
          matches = true;
        }
        
        if (matches) {
          results.push({
            type: 'conversation',
            id: conversation.id,
            data: conversation,
          });
        }
      });

      // Search users
      users.forEach(user => {
        let matches = false;
        
        // Search by display name
        if (user.displayName && user.displayName.toLowerCase().includes(lowerQuery)) {
          matches = true;
        }
        
        // Search by username
        if (user.username && user.username.toLowerCase().includes(lowerQuery)) {
          matches = true;
        }
        
        // Search by email
        if (user.email && user.email.toLowerCase().includes(lowerQuery)) {
          matches = true;
        }
        
        if (matches) {
          results.push({
            type: 'user',
            id: user.id,
            data: user,
          });
        }
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultPress = async (result: SearchResult) => {
    if (result.type === 'conversation') {
      const conversation = result.data as Conversation;
      onConversationSelect(conversation);
    } else {
      const user = result.data as User;
      
      try {
        // Find or create conversation with this user
        const conversation = await ConversationService.findOrCreateDirectConversation(
          currentUserId,
          user.id
        );
        onConversationSelect(conversation);
      } catch (error) {
        console.error('Error creating conversation:', error);
        Alert.alert('Error', 'Failed to start conversation with user');
      }
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    if (item.type === 'conversation') {
      const conversation = item.data as Conversation;
      return (
        <TouchableOpacity
          style={styles.resultItem}
          onPress={() => handleResultPress(item)}
        >
          <View style={styles.conversationAvatar}>
            <Ionicons name="chatbubbles-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle} numberOfLines={1}>
              {conversation.name || 'Direct Message'}
            </Text>
            <Text style={styles.resultSubtitle} numberOfLines={1}>
              {conversation.lastMessage || 'No messages yet'}
            </Text>
          </View>
          <Text style={styles.resultTime}>
            {conversation.lastMessageAt ? formatConversationTime(conversation.lastMessageAt) : ''}
          </Text>
        </TouchableOpacity>
      );
    } else {
      const user = item.data as User;
      return (
        <TouchableOpacity
          style={styles.resultItem}
          onPress={() => handleResultPress(item)}
        >
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {user.displayName?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.resultContent}>
            <Text style={styles.resultTitle} numberOfLines={1}>
              {user.displayName || user.username}
            </Text>
            <Text style={styles.resultSubtitle} numberOfLines={1}>
              @{user.username}
            </Text>
          </View>
          <View style={styles.newChatIndicator}>
            <Ionicons name="add-circle-outline" size={20} color="#34C759" />
          </View>
        </TouchableOpacity>
      );
    }
  };

  const renderEmptyState = () => {
    if (isSearching) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      );
    }

    if (searchQuery.trim().length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#8E8E93" />
          <Text style={styles.emptyText}>Search conversations and users</Text>
          <Text style={styles.emptySubtext}>
            Find existing conversations or discover new people to chat with
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="search-outline" size={48} color="#8E8E93" />
        <Text style={styles.emptyText}>No results found</Text>
        <Text style={styles.emptySubtext}>
          Try different keywords or check the spelling
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations and people..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      <FlatList
        data={searchResults}
        renderItem={renderSearchResult}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        style={styles.resultsList}
        contentContainerStyle={[
          styles.resultsContent,
          searchResults.length === 0 && styles.emptyContent
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 32, // Same as close button to center title
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    paddingVertical: 8,
  },
  emptyContent: {
    flexGrow: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  conversationAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  resultTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  newChatIndicator: {
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ConversationSearch;

