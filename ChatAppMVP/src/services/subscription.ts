// Subscription Service - handles real-time GraphQL subscriptions
import { API, graphqlOperation } from 'aws-amplify';
import { GraphQLResult, GRAPHQL_AUTH_MODE } from '@aws-amplify/api';
import { Message, Conversation } from '../types';
import { 
  onCreateMessage, 
  onUpdateMessage, 
  onDeleteMessage,
  onCreateConversation,
  onUpdateConversation,
} from '../graphql/subscriptions';

export type MessageSubscriptionCallback = (message: Message) => void;
export type ConversationSubscriptionCallback = (conversation: Conversation) => void;

export interface SubscriptionFilters {
  conversationId?: string;
  senderId?: string;
  userId?: string;
}

class SubscriptionService {
  private static subscriptions: Map<string, any> = new Map();

  /**
   * Subscribe to new messages in a specific conversation
   */
  static subscribeToNewMessages(
    conversationId: string,
    callback: MessageSubscriptionCallback
  ): string {
    const subscriptionId = `newMessages-${conversationId}-${Date.now()}`;

    try {
      const subscription = API.graphql(
        graphqlOperation(onCreateMessage, {
          filter: {
            conversationId: { eq: conversationId }
          }
        })
      ) as any;

      // Listen for subscription updates
      if (subscription?.subscribe) {
        const observer = subscription.subscribe({
          next: (result: any) => {
            try {
              const newMessage = result?.value?.data?.onCreateMessage;
              if (newMessage) {
                const mappedMessage = SubscriptionService.mapGraphQLMessageToMessage(newMessage);
                console.log('🔔 New message received via subscription:', mappedMessage.id);
                callback(mappedMessage);
              }
            } catch (error) {
              console.error('Error processing new message subscription:', error);
            }
          },
          error: (error: any) => {
            console.error('Message subscription error:', error);
          }
        });

        SubscriptionService.subscriptions.set(subscriptionId, observer);
      }

    } catch (error) {
      console.error('Error setting up message subscription:', error);
    }

    return subscriptionId;
  }

  /**
   * Subscribe to message updates (edits) in a specific conversation
   */
  static subscribeToMessageUpdates(
    conversationId: string,
    callback: MessageSubscriptionCallback
  ): string {
    const subscriptionId = `updateMessages-${conversationId}-${Date.now()}`;

    try {
      const subscription = API.graphql(
        graphqlOperation(onUpdateMessage, {
          filter: {
            conversationId: { eq: conversationId }
          }
        })
      ) as any;

      if (subscription?.subscribe) {
        const observer = subscription.subscribe({
          next: (result: any) => {
            try {
              const updatedMessage = result?.value?.data?.onUpdateMessage;
              if (updatedMessage) {
                const mappedMessage = SubscriptionService.mapGraphQLMessageToMessage(updatedMessage);
                console.log('📝 Message updated via subscription:', mappedMessage.id);
                callback(mappedMessage);
              }
            } catch (error) {
              console.error('Error processing message update subscription:', error);
            }
          },
          error: (error: any) => {
            console.error('Message update subscription error:', error);
          }
        });

        SubscriptionService.subscriptions.set(subscriptionId, observer);
      }

    } catch (error) {
      console.error('Error setting up message update subscription:', error);
    }

    return subscriptionId;
  }

  /**
   * Subscribe to message deletions in a specific conversation
   */
  static subscribeToMessageDeletions(
    conversationId: string,
    callback: (messageId: string) => void
  ): string {
    const subscriptionId = `deleteMessages-${conversationId}-${Date.now()}`;

    try {
      const subscription = API.graphql(
        graphqlOperation(onDeleteMessage, {
          filter: {
            conversationId: { eq: conversationId }
          }
        })
      ) as any;

      if (subscription?.subscribe) {
        const observer = subscription.subscribe({
          next: (result: any) => {
            try {
              const deletedMessage = result?.value?.data?.onDeleteMessage;
              if (deletedMessage?.id) {
                console.log('🗑️ Message deleted via subscription:', deletedMessage.id);
                callback(deletedMessage.id);
              }
            } catch (error) {
              console.error('Error processing message deletion subscription:', error);
            }
          },
          error: (error: any) => {
            console.error('Message deletion subscription error:', error);
          }
        });

        SubscriptionService.subscriptions.set(subscriptionId, observer);
      }

    } catch (error) {
      console.error('Error setting up message deletion subscription:', error);
    }

    return subscriptionId;
  }

  /**
   * Subscribe to conversation updates (for conversation list)
   */
  static subscribeToConversationUpdates(
    userId: string,
    callback: ConversationSubscriptionCallback
  ): string {
    const subscriptionId = `conversationUpdates-${userId}-${Date.now()}`;

    try {
      const subscription = API.graphql(
        graphqlOperation(onUpdateConversation, {
          filter: {
            participants: { contains: userId }
          }
        })
      ) as any;

      if (subscription?.subscribe) {
        const observer = subscription.subscribe({
          next: (result: any) => {
            try {
              const updatedConversation = result?.value?.data?.onUpdateConversation;
              if (updatedConversation) {
                const mappedConversation = SubscriptionService.mapGraphQLConversationToConversation(updatedConversation);
                console.log('🔄 Conversation updated via subscription:', mappedConversation.id);
                callback(mappedConversation);
              }
            } catch (error) {
              console.error('Error processing conversation update subscription:', error);
            }
          },
          error: (error: any) => {
            console.error('Conversation subscription error:', error);
          }
        });

        SubscriptionService.subscriptions.set(subscriptionId, observer);
      }

    } catch (error) {
      console.error('Error setting up conversation subscription:', error);
    }

    return subscriptionId;
  }

  /**
   * Subscribe to new conversations for a user
   */
  static subscribeToNewConversations(
    userId: string,
    callback: ConversationSubscriptionCallback
  ): string {
    const subscriptionId = `newConversations-${userId}-${Date.now()}`;

    try {
      const subscription = API.graphql(
        graphqlOperation(onCreateConversation, {
          filter: {
            participants: { contains: userId }
          }
        })
      ) as any;

      if (subscription?.subscribe) {
        const observer = subscription.subscribe({
          next: (result: any) => {
            try {
              const newConversation = result?.value?.data?.onCreateConversation;
              if (newConversation) {
                const mappedConversation = SubscriptionService.mapGraphQLConversationToConversation(newConversation);
                console.log('🆕 New conversation via subscription:', mappedConversation.id);
                callback(mappedConversation);
              }
            } catch (error) {
              console.error('Error processing new conversation subscription:', error);
            }
          },
          error: (error: any) => {
            console.error('New conversation subscription error:', error);
          }
        });

        SubscriptionService.subscriptions.set(subscriptionId, observer);
      }

    } catch (error) {
      console.error('Error setting up new conversation subscription:', error);
    }

    return subscriptionId;
  }

  /**
   * Unsubscribe from a specific subscription
   */
  static unsubscribe(subscriptionId: string): void {
    try {
      const subscription = SubscriptionService.subscriptions.get(subscriptionId);
      if (subscription) {
        subscription.unsubscribe();
        SubscriptionService.subscriptions.delete(subscriptionId);
        console.log('🔕 Unsubscribed from:', subscriptionId);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  }

  /**
   * Unsubscribe from all subscriptions (cleanup)
   */
  static unsubscribeAll(): void {
    try {
      SubscriptionService.subscriptions.forEach((subscription, id) => {
        subscription.unsubscribe();
        console.log('🔕 Unsubscribed from:', id);
      });
      SubscriptionService.subscriptions.clear();
    } catch (error) {
      console.error('Error unsubscribing from all:', error);
    }
  }

  /**
   * Set up complete real-time messaging for a conversation
   * Returns array of subscription IDs for cleanup
   */
  static setupConversationRealTime(
    conversationId: string,
    callbacks: {
      onNewMessage: MessageSubscriptionCallback;
      onMessageUpdate: MessageSubscriptionCallback;
      onMessageDelete: (messageId: string) => void;
    }
  ): string[] {
    const subscriptionIds = [
      SubscriptionService.subscribeToNewMessages(conversationId, callbacks.onNewMessage),
      SubscriptionService.subscribeToMessageUpdates(conversationId, callbacks.onMessageUpdate),
      SubscriptionService.subscribeToMessageDeletions(conversationId, callbacks.onMessageDelete),
    ];

    console.log('🚀 Real-time messaging setup for conversation:', conversationId);
    return subscriptionIds;
  }

  /**
   * Set up complete real-time conversation list for a user
   */
  static setupConversationListRealTime(
    userId: string,
    callbacks: {
      onNewConversation: ConversationSubscriptionCallback;
      onConversationUpdate: ConversationSubscriptionCallback;
    }
  ): string[] {
    const subscriptionIds = [
      SubscriptionService.subscribeToNewConversations(userId, callbacks.onNewConversation),
      SubscriptionService.subscribeToConversationUpdates(userId, callbacks.onConversationUpdate),
    ];

    console.log('🚀 Real-time conversation list setup for user:', userId);
    return subscriptionIds;
  }

  /**
   * Map GraphQL message data to our Message type
   */
  private static mapGraphQLMessageToMessage(graphqlMessage: any): Message {
    return {
      id: graphqlMessage.id,
      content: graphqlMessage.content,
      messageType: graphqlMessage.messageType,
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
   * Get active subscription count (for debugging)
   */
  static getActiveSubscriptionCount(): number {
    return SubscriptionService.subscriptions.size;
  }

  /**
   * Get all active subscription IDs (for debugging)
   */
  static getActiveSubscriptionIds(): string[] {
    return Array.from(SubscriptionService.subscriptions.keys());
  }
}

export default SubscriptionService;

