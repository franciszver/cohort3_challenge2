// Message List Component - enhanced with date separators and sender info
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Message } from '../../types';
import MessageBubble from './MessageBubble';
import DateSeparator from './DateSeparator';
import SenderService from '../../services/sender';
import { isSameDay } from '../../utils';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isGroup?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  onMessagePress?: (message: Message) => void;
  onMessageLongPress?: (message: Message) => void;
}

// Item type for FlatList (message or date separator)
interface ListItem {
  type: 'message' | 'date';
  id: string;
  data: Message | { date: string };
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isGroup = false,
  onLoadMore,
  isLoading = false,
  isLoadingMore = false,
  onRefresh,
  refreshing = false,
  onMessagePress,
  onMessageLongPress,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [shouldScrollToEnd, setShouldScrollToEnd] = useState(true);
  const [listItems, setListItems] = useState<ListItem[]>([]);

  // Process messages with date separators - Task 18 ✅
  useEffect(() => {
    const processedItems: ListItem[] = [];
    let lastDate: string | null = null;

    // Sort messages by timestamp
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedMessages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt).toDateString();
      
      // Add date separator if this is a new day
      if (lastDate !== messageDate) {
        processedItems.push({
          type: 'date',
          id: `date-${messageDate}`,
          data: { date: message.createdAt },
        });
        lastDate = messageDate;
      }

      // Add message
      processedItems.push({
        type: 'message',
        id: message.id,
        data: message,
      });
    });

    setListItems(processedItems);

    // Prefetch sender information for better performance - Task 18 ✅
    if (isGroup && messages.length > 0) {
      const senderIds = [...new Set(messages.map(msg => msg.senderId))];
      SenderService.prefetchSenderInfos(senderIds);
    }
  }, [messages, isGroup]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listItems.length > 0 && shouldScrollToEnd) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [listItems.length, shouldScrollToEnd]);

  const renderItem = ({ item, index }: { item: ListItem; index: number }) => {
    if (item.type === 'date') {
      const dateData = item.data as { date: string };
      return <DateSeparator date={dateData.date} />;
    }

    const message = item.data as Message;
    const isOwnMessage = message.senderId === currentUserId;
    
    // Check if we should show sender info - Task 18 ✅
    let shouldShowSender = false;
    if (isGroup && !isOwnMessage) {
      // Show sender for group chats (not own messages)
      shouldShowSender = true;
      
      // Check if previous message was from same sender to avoid repetition
      if (index > 0) {
        const prevItem = listItems[index - 1];
        if (prevItem.type === 'message') {
          const prevMessage = prevItem.data as Message;
          if (prevMessage.senderId === message.senderId) {
            // Same sender as previous message
            const timeDiff = new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime();
            // Only show sender if messages are more than 2 minutes apart
            shouldShowSender = timeDiff > (2 * 60 * 1000);
          }
        }
      }
    }
    
    return (
      <MessageBubble
        message={message}
        isOwnMessage={isOwnMessage}
        showSender={shouldShowSender}
        showTimestamp={true}
        showAvatar={isGroup && shouldShowSender}
        isGroup={isGroup}
        onPress={() => onMessagePress?.(message)}
        onLongPress={() => onMessageLongPress?.(message)}
      />
    );
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.emptyText}>Loading messages...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.emptyTitle}>No messages yet</Text>
        <Text style={styles.emptySubtitle}>
          Start the conversation by sending your first message!
        </Text>
      </View>
    );
  };

  const renderLoadMoreFooter = () => {
    if (!isLoadingMore) {
      return null;
    }

    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadMoreText}>Loading more messages...</Text>
      </View>
    );
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    
    // Check if user is near the bottom (within 100px)
    const isNearBottom = 
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 100;
    
    setShouldScrollToEnd(isNearBottom);
  };

  const keyExtractor = (item: ListItem) => item.id;

  const getItemLayout = (data: any, index: number) => {
    // Approximate layout - could be improved with dynamic heights
    const item = listItems[index];
    const length = item?.type === 'date' ? 60 : 80;
    
    return {
      length,
      offset: 70 * index, // Average height approximation
      index,
    };
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={listItems}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={styles.messageList}
        contentContainerStyle={[
          styles.messageListContent,
          listItems.length === 0 && styles.emptyListContent
        ]}
        inverted={false}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderLoadMoreFooter}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#007AFF"
              colors={['#007AFF']}
            />
          ) : undefined
        }
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={20}
        windowSize={10}
        initialNumToRender={20}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 8,
  },
  emptyListContent: {
    flexGrow: 1,
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
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
  },
  loadMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
});

export default MessageList;
