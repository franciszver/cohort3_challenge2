// Message Service - handles real-time messaging with GraphQL API and local caching (Amplify v6)
import { generateClient } from 'aws-amplify/api';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { Message, MessageType, Conversation } from '../types';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import { generateUniqueId } from '../utils';
import CacheService from './cache';

// Create GraphQL client
const client = generateClient();

export interface SendMessageInput {
  conversationId: string;
  content: string;
  senderId: string;
  messageType?: MessageType;
  attachments?: string[];
  metadata?: any;
}

export interface UpdateMessageInput {
  id: string;
  content?: string;
  editedAt?: string;
  metadata?: any;
}

export interface GetMessagesParams {
  conversationId: string;
  limit?: number;
  nextToken?: string;
}

export interface PaginatedMessages {
  messages: Message[];
  nextToken?: string;
  hasMore: boolean;
}

export class MessageService {
  
  /**
   * Send a new message to a conversation with offline-first caching
   */
  static async sendMessage(input: SendMessageInput): Promise<Message> {
    const messageInput = {
      id: generateUniqueId(),
      content: input.content,
      messageType: input.messageType || MessageType.TEXT,
      senderId: input.senderId,
      conversationId: input.conversationId,
      attachments: input.attachments || [],
      metadata: input.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Cache optimistic message immediately for smooth UI
    await CacheService.cacheOptimisticMessage(messageInput);

    try {
      // Try to send to server
      const result = await client.graphql({
        query: mutations.createMessage,
        variables: { 
          input: {
            ...messageInput,
            metadata: messageInput.metadata ? JSON.stringify(messageInput.metadata) : null,
          }
        }
      }) as GraphQLResult<{ createMessage: any }>;

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to send message');
      }

      const createdMessage = result.data?.createMessage;
      const serverMessage = MessageService.mapGraphQLMessageToMessage(createdMessage);
      
      // Update cache with server response and mark as synced
      await CacheService.updateMessageSyncStatus(input.conversationId, messageInput.id, 'synced');
      
      // Update conversation's last message info
      await MessageService.updateConversationLastMessage(
        input.conversationId,
        createdMessage.content,
        input.senderId,
        createdMessage.createdAt
      );

      console.log('✅ Message sent and cached successfully:', serverMessage.id);
      return serverMessage;
      
    } catch (error: any) {
      console.error('❌ Error sending message, caching for offline sync:', error);
      
      // Store for offline sync
      await CacheService.storePendingMessage(messageInput);
      await CacheService.updateMessageSyncStatus(input.conversationId, messageInput.id, 'failed');
      
      // Return the cached message so UI can show it
      return messageInput;
    }
  }

  /**
   * Get messages for a conversation with cache-first strategy
   */
  static async getMessagesForConversation(params: GetMessagesParams): Promise<PaginatedMessages> {
    try {
      // First, load from cache for instant display
      const cachedMessages = await CacheService.getCachedMessages(params.conversationId);
      console.log(`💾 Loaded ${cachedMessages.length} messages from cache`);

      // If we have cached messages and no specific pagination token, return cache first
      if (cachedMessages.length > 0 && !params.nextToken) {
        // Return cached messages immediately for fast UI
        const cacheResult = {
          messages: cachedMessages,
          nextToken: undefined,
          hasMore: false,
        };

        // Sync with server in background to get latest messages
        MessageService.syncMessagesInBackground(params.conversationId);
        
        return cacheResult;
      }

      // Fetch from server (either no cache or paginating)
      const result = await client.graphql({
        query: queries.messagesByConversationIdAndCreatedAt,
        variables: {
          conversationId: params.conversationId,
          sortDirection: 'ASC', // Oldest first for proper chat order
          limit: params.limit || 50,
          nextToken: params.nextToken,
        }
      }) as GraphQLResult<{ messagesByConversationIdAndCreatedAt: { items: any[]; nextToken?: string } }>;

      if (result.errors) {
        console.error('❌ Error getting messages from server:', result.errors);
        // Fall back to cache if server fails
        return {
          messages: cachedMessages,
          nextToken: undefined,
          hasMore: false,
        };
      }

      const data = result.data?.messagesByConversationIdAndCreatedAt;
      const serverMessages = (data?.items || [])
        .filter((message: any) => message && !message._deleted)
        .map((message: any) => MessageService.mapGraphQLMessageToMessage(message));

      // Cache the fetched messages
      await CacheService.cacheMessages(params.conversationId, serverMessages);

      return {
        messages: serverMessages,
        nextToken: data?.nextToken,
        hasMore: Boolean(data?.nextToken),
      };
      
    } catch (error) {
      console.error('❌ Error getting messages, using cache:', error);
      // Fall back to cache on network error
      const cachedMessages = await CacheService.getCachedMessages(params.conversationId);
      return {
        messages: cachedMessages,
        nextToken: undefined,
        hasMore: false,
      };
    }
  }

  /**
   * Background sync to get latest messages without blocking UI
   */
  private static async syncMessagesInBackground(conversationId: string): Promise<void> {
    try {
      console.log('🔄 Background sync for conversation:', conversationId);
      
      const result = await client.graphql({
        query: queries.messagesByConversationIdAndCreatedAt,
        variables: {
          conversationId,
          sortDirection: 'ASC',
          limit: 50, // Get recent messages
        }
      }) as GraphQLResult<{ messagesByConversationIdAndCreatedAt: { items: any[] } }>;

      if (!result.errors && result.data?.messagesByConversationIdAndCreatedAt?.items) {
        const serverMessages = result.data.messagesByConversationIdAndCreatedAt.items
          .filter((message: any) => message && !message._deleted)
          .map((message: any) => MessageService.mapGraphQLMessageToMessage(message));

        // Update cache with latest messages
        await CacheService.cacheMessages(conversationId, serverMessages);
        console.log('✅ Background sync completed for conversation:', conversationId);
      }
    } catch (error) {
      console.log('⚠️ Background sync failed (this is OK):', error);
    }
  }

  /**
   * Get a single message by ID
   */
  static async getMessageById(messageId: string): Promise<Message | null> {
    try {
      const result = await client.graphql({
        query: queries.getMessage,
        variables: { id: messageId }
      }) as GraphQLResult<{ getMessage: any }>;

      if (result.errors || !result.data?.getMessage) {
        return null;
      }

      return MessageService.mapGraphQLMessageToMessage(result.data.getMessage);
      
    } catch (error) {
      console.error('Error getting message by ID:', error);
      return null;
    }
  }

  /**
   * Update message content (for editing)
   */
  static async updateMessage(input: UpdateMessageInput): Promise<Message> {
    try {
      const updateInput = {
        id: input.id,
        ...(input.content && { content: input.content }),
        ...(input.editedAt && { editedAt: input.editedAt }),
        ...(input.metadata && { metadata: JSON.stringify(input.metadata) }),
        updatedAt: new Date().toISOString(),
      };

      const result = await client.graphql({
        query: mutations.updateMessage,
        variables: { input: updateInput }
      }) as GraphQLResult<{ updateMessage: any }>;

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to update message');
      }

      return MessageService.mapGraphQLMessageToMessage(result.data?.updateMessage);
      
    } catch (error: any) {
      console.error('Error updating message:', error);
      throw MessageService.mapMessageError(error);
    }
  }

  /**
   * Delete message (soft delete)
   */
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      const result = await client.graphql({
        query: mutations.deleteMessage,
        variables: { input: { id: messageId } }
      }) as GraphQLResult<{ deleteMessage: any }>;

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to delete message');
      }
      
    } catch (error: any) {
      console.error('Error deleting message:', error);
      throw MessageService.mapMessageError(error);
    }
  }

  /**
   * Get messages by sender (for user message history)
   */
  static async getMessagesBySender(senderId: string, limit?: number): Promise<Message[]> {
    try {
      const result = await client.graphql({
        query: queries.messagesBySenderIdAndCreatedAt,
        variables: {
          senderId,
          sortDirection: 'DESC',
          limit: limit || 20,
        }
      }) as GraphQLResult<{ messagesBySenderIdAndCreatedAt: { items: any[] } }>;

      if (result.errors) {
        console.error('Error getting messages by sender:', result.errors);
        return [];
      }

      const messages = result.data?.messagesBySenderIdAndCreatedAt?.items || [];
      
      return messages
        .filter((message: any) => message && !message._deleted)
        .map((message: any) => MessageService.mapGraphQLMessageToMessage(message));
      
    } catch (error) {
      console.error('Error getting messages by sender:', error);
      return [];
    }
  }

  /**
   * Update conversation's last message info
   */
  private static async updateConversationLastMessage(
    conversationId: string,
    lastMessage: string,
    senderId: string,
    timestamp: string
  ): Promise<void> {
    try {
      const { updateConversation } = await import('../graphql/mutations');
      
      await client.graphql({
        query: updateConversation,
        variables: {
          input: {
            id: conversationId,
            lastMessage,
            lastMessageSender: senderId,
            lastMessageAt: timestamp,
            updatedAt: new Date().toISOString(),
          }
        }
      });
    } catch (error) {
      console.error('Error updating conversation last message:', error);
      // Don't throw error for this update
    }
  }

  /**
   * Create optimistic message for immediate UI updates
   */
  static createOptimisticMessage(input: SendMessageInput): Message {
    return {
      id: generateUniqueId(),
      content: input.content,
      messageType: input.messageType || MessageType.TEXT,
      senderId: input.senderId,
      conversationId: input.conversationId,
      attachments: input.attachments || [],
      metadata: input.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Mark as optimistic for UI handling
      __optimistic: true,
    } as Message & { __optimistic: boolean };
  }

  /**
   * Map GraphQL message data to our Message type
   */
  private static mapGraphQLMessageToMessage(graphqlMessage: any): Message {
    return {
      id: graphqlMessage.id,
      content: graphqlMessage.content,
      messageType: graphqlMessage.messageType as MessageType,
      senderId: graphqlMessage.senderId,
      conversationId: graphqlMessage.conversationId,
      attachments: graphqlMessage.attachments || [],
      metadata: graphqlMessage.metadata ? JSON.parse(graphqlMessage.metadata) : {},
      editedAt: graphqlMessage.editedAt,
      deletedAt: graphqlMessage.deletedAt,
      createdAt: graphqlMessage.createdAt,
      updatedAt: graphqlMessage.updatedAt,
    };
  }

  /**
   * Sync pending messages when back online
   */
  static async syncPendingMessages(): Promise<void> {
    try {
      const pendingMessages = await CacheService.getPendingMessages();
      
      if (pendingMessages.length === 0) {
        console.log('📤 No pending messages to sync');
        return;
      }

      console.log(`📤 Syncing ${pendingMessages.length} pending messages...`);

      for (const pending of pendingMessages) {
        try {
          // Skip messages that have failed too many times
          if (pending.attempts >= 3) {
            console.log(`⚠️ Skipping message after ${pending.attempts} failed attempts:`, pending.id);
            continue;
          }

          // Try to send the message
          const result = await client.graphql({
            query: mutations.createMessage,
            variables: { 
              input: {
                ...pending.message,
                metadata: pending.message.metadata ? JSON.stringify(pending.message.metadata) : null,
              }
            }
          }) as GraphQLResult<{ createMessage: any }>;

          if (result.errors) {
            throw new Error(result.errors[0]?.message || 'Failed to sync message');
          }

          // Success! Remove from pending and update cache
          await CacheService.removePendingMessage(pending.id);
          await CacheService.updateMessageSyncStatus(pending.message.conversationId, pending.id, 'synced');
          
          console.log('✅ Synced pending message:', pending.id);

        } catch (error) {
          console.error('❌ Failed to sync pending message:', pending.id, error);
          await CacheService.markPendingMessageFailed(pending.id);
        }
      }

      console.log('📤 Finished syncing pending messages');

    } catch (error) {
      console.error('Error syncing pending messages:', error);
    }
  }

  /**
   * Get sync status for debugging
   */
  static async getSyncStatus(): Promise<{
    pendingMessages: number;
    cacheStats: any;
  }> {
    try {
      const pending = await CacheService.getPendingMessages();
      const cacheStats = await CacheService.getCacheStats();

      return {
        pendingMessages: pending.length,
        cacheStats,
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        pendingMessages: 0,
        cacheStats: null,
      };
    }
  }

  /**
   * Map GraphQL errors to user-friendly messages
   */
  private static mapMessageError(error: any): Error {
    const errorMap: Record<string, string> = {
      'ValidationException': 'Message content is invalid.',
      'ConditionalCheckFailedException': 'Message could not be sent. Please try again.',
      'ResourceNotFoundException': 'Conversation not found.',
      'NetworkError': 'Network connection error. Please check your connection.',
      'UnauthorizedException': 'You do not have permission to send messages in this conversation.',
    };

    const errorType = error.name || error.code || 'UnknownError';
    const message = errorMap[errorType] || error.message || 'Failed to send message. Please try again.';

    return new Error(message);
  }
}

export default MessageService;
