// Core type definitions for the Chat App MVP

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  messageType: 'text' | 'image' | 'file';
  createdAt: string;
  updatedAt: string;
  readBy: string[]; // Array of user IDs who have read the message
}

export interface Conversation {
  id: string;
  name?: string; // For group chats
  participants: string[]; // Array of user IDs
  isGroup: boolean;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Navigation related types
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextToken?: string;
  hasMore: boolean;
}

