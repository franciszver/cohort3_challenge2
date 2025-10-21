// Conversation Service - manages conversations and participants (Amplify v6)
import { generateClient } from 'aws-amplify/api';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { Conversation, ConversationRole } from '../types';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';
import { generateUniqueId } from '../utils';
import CacheService from './cache';

// Create GraphQL client
const client = generateClient();

export interface CreateConversationInput {
  participants: string[]; // Array of user IDs
  createdBy: string;
  name?: string; // For group chats
  description?: string;
  isGroup?: boolean;
}

export interface UpdateConversationInput {
  id: string;
  name?: string;
  description?: string;
}

export interface JoinConversationInput {
  conversationId: string;
  userId: string;
  role?: ConversationRole;
}

export interface ConversationWithParticipants extends Conversation {
  participantCount?: number;
}

export class ConversationService {
  
  /**
   * Create a new conversation (1-on-1 or group)
   */
  static async createConversation(input: CreateConversationInput): Promise<Conversation> {
    try {
      const conversationId = generateUniqueId();
      const isGroup = input.isGroup || input.participants.length > 2;

      // Create conversation
      const conversationInput = {
        id: conversationId,
        name: input.name,
        description: input.description,
        isGroup,
        participants: input.participants,
        createdBy: input.createdBy,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const conversationResult = await client.graphql({
        query: mutations.createConversation,
        variables: { input: conversationInput }
      }) as GraphQLResult<{ createConversation: any }>;

      if (conversationResult.errors) {
        throw new Error(conversationResult.errors[0]?.message || 'Failed to create conversation');
      }

      // Add participants to conversation
      const participantPromises = input.participants.map((userId, index) => 
        ConversationService.addParticipantToConversation({
          conversationId,
          userId,
          role: userId === input.createdBy ? ConversationRole.ADMIN : ConversationRole.MEMBER,
        })
      );

      await Promise.all(participantPromises);

      return ConversationService.mapGraphQLConversationToConversation(conversationResult.data?.createConversation);
      
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      throw ConversationService.mapConversationError(error);
    }
  }

  /**
   * Get conversation by ID
   */
  static async getConversationById(conversationId: string): Promise<Conversation | null> {
    try {
      const result = await client.graphql({
        query: queries.getConversation,
        variables: { id: conversationId }
      }) as GraphQLResult<{ getConversation: any }>;

      if (result.errors || !result.data?.getConversation) {
        return null;
      }

      return ConversationService.mapGraphQLConversationToConversation(result.data.getConversation);
      
    } catch (error) {
      console.error('Error getting conversation by ID:', error);
      return null;
    }
  }

  /**
   * Get conversations for a user with cache-first strategy
   */
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      // First, load from cache for instant display
      const cachedConversations = await CacheService.getCachedConversations();
      console.log(`💾 Loaded ${cachedConversations.length} conversations from cache`);

      // If we have cached conversations, return them immediately and sync in background
      if (cachedConversations.length > 0) {
        // Sync with server in background to get latest conversations
        ConversationService.syncConversationsInBackground(userId);
        return cachedConversations;
      }

      // Fetch from server (no cache available)
      return await ConversationService.fetchConversationsFromServer(userId);
      
    } catch (error) {
      console.error('❌ Error getting conversations, using cache:', error);
      // Fall back to cache on error
      const cachedConversations = await CacheService.getCachedConversations();
      return cachedConversations;
    }
  }

  /**
   * Fetch conversations from server and cache them
   */
  static async fetchConversationsFromServer(userId: string): Promise<Conversation[]> {
    try {
      // Get all conversation participants for this user
      const result = await client.graphql({
        query: queries.conversationParticipantsByUserIdAndConversationId,
        variables: {
          userId,
          sortDirection: 'DESC',
        }
      }) as GraphQLResult<{ conversationParticipantsByUserIdAndConversationId: { items: any[] } }>;

      if (result.errors) {
        console.error('❌ Error getting user conversations from server:', result.errors);
        return [];
      }

      const participants = result.data?.conversationParticipantsByUserIdAndConversationId?.items || [];
      
      // Get conversation details for each participant record
      const conversationPromises = participants
        .filter(participant => participant && !participant._deleted && !participant.leftAt)
        .map(participant => ConversationService.getConversationById(participant.conversationId));

      const conversations = await Promise.all(conversationPromises);
      
      const validConversations = conversations
        .filter((conversation): conversation is Conversation => conversation !== null)
        .sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

      // Cache the fetched conversations
      await CacheService.cacheConversations(validConversations);
      
      return validConversations;
      
    } catch (error) {
      console.error('❌ Error fetching conversations from server:', error);
      return [];
    }
  }

  /**
   * Background sync to get latest conversations without blocking UI
   */
  private static async syncConversationsInBackground(userId: string): Promise<void> {
    try {
      console.log('🔄 Background sync for conversations:', userId);
      
      const conversations = await ConversationService.fetchConversationsFromServer(userId);
      console.log(`✅ Background sync completed - ${conversations.length} conversations`);
      
    } catch (error) {
      console.log('⚠️ Background conversation sync failed (this is OK):', error);
    }
  }

  /**
   * Update conversation details
   */
  static async updateConversation(input: UpdateConversationInput): Promise<Conversation> {
    try {
      const updateInput = {
        id: input.id,
        ...(input.name && { name: input.name }),
        ...(input.description && { description: input.description }),
        updatedAt: new Date().toISOString(),
      };

      const result = await client.graphql({
        query: mutations.updateConversation,
        variables: { input: updateInput }
      }) as GraphQLResult<{ updateConversation: any }>;

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to update conversation');
      }

      return ConversationService.mapGraphQLConversationToConversation(result.data?.updateConversation);
      
    } catch (error: any) {
      console.error('Error updating conversation:', error);
      throw ConversationService.mapConversationError(error);
    }
  }

  /**
   * Add participant to conversation
   */
  static async addParticipantToConversation(input: JoinConversationInput): Promise<void> {
    try {
      const participantInput = {
        id: generateUniqueId(),
        userId: input.userId,
        conversationId: input.conversationId,
        role: input.role || ConversationRole.MEMBER,
        joinedAt: new Date().toISOString(),
        unreadCount: 0,
        notifications: true,
      };

      const result = await client.graphql({
        query: mutations.createConversationParticipant,
        variables: { input: participantInput }
      });

      if ((result as any).errors) {
        throw new Error((result as any).errors[0]?.message || 'Failed to add participant');
      }
      
    } catch (error: any) {
      console.error('Error adding participant to conversation:', error);
      throw ConversationService.mapConversationError(error);
    }
  }

  /**
   * Remove participant from conversation (leave conversation)
   */
  static async removeParticipantFromConversation(conversationId: string, userId: string): Promise<void> {
    try {
      // Get participant record
      const participantResult = await client.graphql({
        query: queries.conversationParticipantsByConversationIdAndUserId,
        variables: {
          conversationId,
          userId: { eq: userId }
        }
      }) as GraphQLResult<{ conversationParticipantsByConversationIdAndUserId: { items: any[] } }>;

      const participants = participantResult.data?.conversationParticipantsByConversationIdAndUserId?.items || [];
      
      if (participants.length > 0) {
        const participant = participants[0];
        
        // Update participant with left timestamp
        await client.graphql({
          query: mutations.updateConversationParticipant,
          variables: {
            input: {
              id: participant.id,
              leftAt: new Date().toISOString(),
            }
          }
        });
      }
      
    } catch (error: any) {
      console.error('Error removing participant from conversation:', error);
      throw ConversationService.mapConversationError(error);
    }
  }

  /**
   * Check if user is participant in conversation
   */
  static async isUserInConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      const result = await client.graphql({
        query: queries.conversationParticipantsByConversationIdAndUserId,
        variables: {
          conversationId,
          userId: { eq: userId }
        }
      }) as GraphQLResult<{ conversationParticipantsByConversationIdAndUserId: { items: any[] } }>;

      const participants = result.data?.conversationParticipantsByConversationIdAndUserId?.items || [];
      
      return participants.some(participant => 
        participant && !participant._deleted && !participant.leftAt
      );
      
    } catch (error) {
      console.error('Error checking if user is in conversation:', error);
      return false;
    }
  }

  /**
   * Find or create 1-on-1 conversation between two users
   */
  static async findOrCreateDirectConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    try {
      // Get conversations for user1
      const user1Conversations = await ConversationService.getUserConversations(user1Id);
      
      // Find existing 1-on-1 conversation with user2
      const existingConversation = user1Conversations.find(conv => 
        !conv.isGroup && 
        conv.participants.includes(user2Id) &&
        conv.participants.length === 2
      );

      if (existingConversation) {
        return existingConversation;
      }

      // Create new 1-on-1 conversation
      return await ConversationService.createConversation({
        participants: [user1Id, user2Id],
        createdBy: user1Id,
        isGroup: false,
      });
      
    } catch (error: any) {
      console.error('Error finding or creating direct conversation:', error);
      throw ConversationService.mapConversationError(error);
    }
  }

  /**
   * Update unread count for user in conversation
   */
  static async updateUnreadCount(conversationId: string, userId: string, unreadCount: number): Promise<void> {
    try {
      const participantResult = await client.graphql({
        query: queries.conversationParticipantsByConversationIdAndUserId,
        variables: {
          conversationId,
          userId: { eq: userId }
        }
      }) as GraphQLResult<{ conversationParticipantsByConversationIdAndUserId: { items: any[] } }>;

      const participants = participantResult.data?.conversationParticipantsByConversationIdAndUserId?.items || [];
      
      if (participants.length > 0) {
        const participant = participants[0];
        
        await client.graphql({
          query: mutations.updateConversationParticipant,
          variables: {
            input: {
              id: participant.id,
              unreadCount,
              lastReadAt: new Date().toISOString(),
            }
          }
        });
      }
      
    } catch (error) {
      console.error('Error updating unread count:', error);
    }
  }

  /**
   * Map GraphQL conversation data to our Conversation type
   */
  private static mapGraphQLConversationToConversation(graphqlConversation: any): Conversation {
    return {
      id: graphqlConversation.id,
      name: graphqlConversation.name,
      description: graphqlConversation.description,
      isGroup: graphqlConversation.isGroup,
      participants: graphqlConversation.participants || [],
      lastMessage: graphqlConversation.lastMessage,
      lastMessageAt: graphqlConversation.lastMessageAt,
      lastMessageSender: graphqlConversation.lastMessageSender,
      createdBy: graphqlConversation.createdBy,
      createdAt: graphqlConversation.createdAt,
      updatedAt: graphqlConversation.updatedAt,
    };
  }

  /**
   * Map GraphQL errors to user-friendly messages
   */
  private static mapConversationError(error: any): Error {
    const errorMap: Record<string, string> = {
      'ValidationException': 'Invalid conversation data.',
      'ConditionalCheckFailedException': 'Conversation operation failed. Please try again.',
      'ResourceNotFoundException': 'Conversation not found.',
      'UnauthorizedException': 'You do not have permission to perform this action.',
      'NetworkError': 'Network connection error. Please check your connection.',
    };

    const errorType = error.name || error.code || 'UnknownError';
    const message = errorMap[errorType] || error.message || 'Conversation operation failed. Please try again.';

    return new Error(message);
  }
}

export default ConversationService;
