import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";

export enum UserStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  AWAY = "AWAY",
  BUSY = "BUSY"
}

export enum ConversationRole {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  MEMBER = "MEMBER"
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  FILE = "FILE",
  SYSTEM = "SYSTEM"
}



type EagerUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
  };
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly displayName?: string | null;
  readonly avatar?: string | null;
  readonly status?: UserStatus | keyof typeof UserStatus | null;
  readonly lastSeen?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

type LazyUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
  };
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly displayName?: string | null;
  readonly avatar?: string | null;
  readonly status?: UserStatus | keyof typeof UserStatus | null;
  readonly lastSeen?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export declare type User = LazyLoading extends LazyLoadingDisabled ? EagerUser : LazyUser

export declare const User: (new (init: ModelInit<User>) => User) & {
  copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}

type EagerConversation = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Conversation, 'id'>;
  };
  readonly id: string;
  readonly name?: string | null;
  readonly description?: string | null;
  readonly isGroup: boolean;
  readonly participants: string[];
  readonly lastMessage?: string | null;
  readonly lastMessageAt?: string | null;
  readonly lastMessageSender?: string | null;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

type LazyConversation = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Conversation, 'id'>;
  };
  readonly id: string;
  readonly name?: string | null;
  readonly description?: string | null;
  readonly isGroup: boolean;
  readonly participants: string[];
  readonly lastMessage?: string | null;
  readonly lastMessageAt?: string | null;
  readonly lastMessageSender?: string | null;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export declare type Conversation = LazyLoading extends LazyLoadingDisabled ? EagerConversation : LazyConversation

export declare const Conversation: (new (init: ModelInit<Conversation>) => Conversation) & {
  copyOf(source: Conversation, mutator: (draft: MutableModel<Conversation>) => MutableModel<Conversation> | void): Conversation;
}

type EagerConversationParticipant = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ConversationParticipant, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userId: string;
  readonly conversationId: string;
  readonly joinedAt: string;
  readonly leftAt?: string | null;
  readonly role?: ConversationRole | keyof typeof ConversationRole | null;
  readonly unreadCount?: number | null;
  readonly lastReadAt?: string | null;
  readonly notifications?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyConversationParticipant = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ConversationParticipant, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userId: string;
  readonly conversationId: string;
  readonly joinedAt: string;
  readonly leftAt?: string | null;
  readonly role?: ConversationRole | keyof typeof ConversationRole | null;
  readonly unreadCount?: number | null;
  readonly lastReadAt?: string | null;
  readonly notifications?: boolean | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ConversationParticipant = LazyLoading extends LazyLoadingDisabled ? EagerConversationParticipant : LazyConversationParticipant

export declare const ConversationParticipant: (new (init: ModelInit<ConversationParticipant>) => ConversationParticipant) & {
  copyOf(source: ConversationParticipant, mutator: (draft: MutableModel<ConversationParticipant>) => MutableModel<ConversationParticipant> | void): ConversationParticipant;
}

type EagerMessage = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Message, 'id'>;
  };
  readonly id: string;
  readonly content: string;
  readonly messageType: MessageType | keyof typeof MessageType;
  readonly senderId: string;
  readonly conversationId: string;
  readonly attachments?: (string | null)[] | null;
  readonly metadata?: string | null;
  readonly editedAt?: string | null;
  readonly deletedAt?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

type LazyMessage = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Message, 'id'>;
  };
  readonly id: string;
  readonly content: string;
  readonly messageType: MessageType | keyof typeof MessageType;
  readonly senderId: string;
  readonly conversationId: string;
  readonly attachments?: (string | null)[] | null;
  readonly metadata?: string | null;
  readonly editedAt?: string | null;
  readonly deletedAt?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export declare type Message = LazyLoading extends LazyLoadingDisabled ? EagerMessage : LazyMessage

export declare const Message: (new (init: ModelInit<Message>) => Message) & {
  copyOf(source: Message, mutator: (draft: MutableModel<Message>) => MutableModel<Message> | void): Message;
}

type EagerMessageRead = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<MessageRead, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly messageId: string;
  readonly userId: string;
  readonly readAt: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyMessageRead = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<MessageRead, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly messageId: string;
  readonly userId: string;
  readonly readAt: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type MessageRead = LazyLoading extends LazyLoadingDisabled ? EagerMessageRead : LazyMessageRead

export declare const MessageRead: (new (init: ModelInit<MessageRead>) => MessageRead) & {
  copyOf(source: MessageRead, mutator: (draft: MutableModel<MessageRead>) => MutableModel<MessageRead> | void): MessageRead;
}