// User Profile Service - manages user data with GraphQL API (Amplify v6)
import { generateClient } from 'aws-amplify/api';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { User, UserStatus } from '../types';
import * as mutations from '../graphql/mutations';
import * as queries from '../graphql/queries';

// Create GraphQL client
const client = generateClient();

export interface CreateUserInput {
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  status?: UserStatus;
}

export interface UpdateUserInput {
  id: string;
  displayName?: string;
  avatar?: string;
  status?: UserStatus;
  lastSeen?: string;
}

export interface UserSearchParams {
  email?: string;
  username?: string;
  limit?: number;
}

export class UserService {
  
  /**
   * Create a new user profile in DynamoDB
   */
  static async createUserProfile(input: CreateUserInput): Promise<User> {
    try {
      const userInput = {
        username: input.username,
        email: input.email,
        displayName: input.displayName || input.username,
        avatar: input.avatar,
        status: input.status || UserStatus.ONLINE,
        lastSeen: new Date().toISOString(),
      };

      const result = await client.graphql({
        query: mutations.createUser,
        variables: { input: userInput }
      }) as GraphQLResult<{ createUser: any }>;

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to create user');
      }

      return UserService.mapGraphQLUserToUser(result.data?.createUser);
      
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      throw UserService.mapUserError(error);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await client.graphql({
        query: queries.getUser,
        variables: { id: userId }
      }) as GraphQLResult<{ getUser: any }>;

      if (result.errors) {
        console.error('Error getting user:', result.errors);
        return null;
      }

      if (!result.data?.getUser) {
        return null;
      }

      return UserService.mapGraphQLUserToUser(result.data.getUser);
      
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await client.graphql({
        query: queries.getUserByEmail,
        variables: { email }
      }) as GraphQLResult<{ getUserByEmail: { items: any[] } }>;

      if (result.errors) {
        console.error('Error getting user by email:', result.errors);
        return null;
      }

      const users = result.data?.getUserByEmail?.items || [];
      if (users.length === 0) {
        return null;
      }

      return UserService.mapGraphQLUserToUser(users[0]);
      
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Get user by username
   */
  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      const result = await client.graphql({
        query: queries.getUserByUsername,
        variables: { username }
      }) as GraphQLResult<{ getUserByUsername: { items: any[] } }>;

      if (result.errors) {
        console.error('Error getting user by username:', result.errors);
        return null;
      }

      const users = result.data?.getUserByUsername?.items || [];
      if (users.length === 0) {
        return null;
      }

      return UserService.mapGraphQLUserToUser(users[0]);
      
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(input: UpdateUserInput): Promise<User> {
    try {
      const updateInput = {
        id: input.id,
        ...(input.displayName && { displayName: input.displayName }),
        ...(input.avatar && { avatar: input.avatar }),
        ...(input.status && { status: input.status }),
        ...(input.lastSeen && { lastSeen: input.lastSeen }),
      };

      const result = await client.graphql({
        query: mutations.updateUser,
        variables: { input: updateInput }
      }) as GraphQLResult<{ updateUser: any }>;

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to update user');
      }

      return UserService.mapGraphQLUserToUser(result.data?.updateUser);
      
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      throw UserService.mapUserError(error);
    }
  }

  /**
   * Update user's last seen timestamp
   */
  static async updateLastSeen(userId: string): Promise<void> {
    try {
      await UserService.updateUserProfile({
        id: userId,
        lastSeen: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating last seen:', error);
      // Don't throw error for last seen updates
    }
  }

  /**
   * Update user status (online, offline, away, busy)
   */
  static async updateUserStatus(userId: string, status: UserStatus): Promise<void> {
    try {
      await UserService.updateUserProfile({
        id: userId,
        status,
        lastSeen: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  /**
   * Search users by email or username
   */
  static async searchUsers(params: UserSearchParams): Promise<User[]> {
    try {
      let result: GraphQLResult<any>;

      if (params.email) {
        result = await client.graphql({
          query: queries.getUserByEmail,
          variables: { email: params.email }
        }) as GraphQLResult<{ getUserByEmail: { items: any[] } }>;
      } else if (params.username) {
        result = await client.graphql({
          query: queries.getUserByUsername,
          variables: { username: params.username }
        }) as GraphQLResult<{ getUserByUsername: { items: any[] } }>;
      } else {
        result = await client.graphql({
          query: queries.listUsers,
          variables: { limit: params.limit || 10 }
        }) as GraphQLResult<{ listUsers: { items: any[] } }>;
      }

      if (result.errors) {
        console.error('Error searching users:', result.errors);
        return [];
      }

      const users = result.data?.getUserByEmail?.items || 
                   result.data?.getUserByUsername?.items || 
                   result.data?.listUsers?.items || [];

      return users
        .filter((user: any) => user && !user._deleted)
        .map((user: any) => UserService.mapGraphQLUserToUser(user));
      
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Delete user profile
   */
  static async deleteUserProfile(userId: string): Promise<void> {
    try {
      const result = await client.graphql({
        query: mutations.deleteUser,
        variables: { input: { id: userId } }
      }) as GraphQLResult<{ deleteUser: any }>;

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to delete user');
      }
      
    } catch (error: any) {
      console.error('Error deleting user profile:', error);
      throw UserService.mapUserError(error);
    }
  }

  /**
   * Check if user profile exists for Cognito user
   */
  static async ensureUserProfile(cognitoUser: any, userInfo: any): Promise<User> {
    try {
      const attributes = userInfo?.attributes || {};
      const userId = cognitoUser.username || userInfo?.id;

      // Try to get existing user profile
      let existingUser = await UserService.getUserById(userId);
      
      if (existingUser) {
        // Update last seen for existing user
        await UserService.updateLastSeen(userId);
        return existingUser;
      }

      // Create new user profile
      const newUser = await UserService.createUserProfile({
        username: attributes.preferred_username || attributes.email || userId,
        email: attributes.email,
        displayName: attributes.name || attributes.preferred_username,
        avatar: attributes.picture,
        status: UserStatus.ONLINE,
      });

      return newUser;
      
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID (alias for getUser for consistency).
   */
  static async getUserProfile(id: string): Promise<User | null> {
    return UserService.getUser(id);
  }

  /**
   * List all users (for user discovery in search).
   */
  static async listUsers(limit: number = 50): Promise<User[]> {
    try {
      const result = await client.graphql({
        query: queries.listUsers,
        variables: { limit }
      }) as GraphQLResult<{ listUsers: { items: any[] } }>;

      if (result.errors) {
        console.error('Error listing users:', result.errors);
        return [];
      }

      return (result.data?.listUsers?.items || [])
        .filter(user => user && !user._deleted)
        .map(user => UserService.mapGraphQLUserToUser(user));
    } catch (error) {
      console.error('Error listing users:', error);
      return [];
    }
  }

  /**
   * Map GraphQL user data to our User type
   */
  private static mapGraphQLUserToUser(graphqlUser: any): User {
    return {
      id: graphqlUser.id,
      username: graphqlUser.username,
      email: graphqlUser.email,
      displayName: graphqlUser.displayName,
      avatar: graphqlUser.avatar,
      status: graphqlUser.status as UserStatus,
      lastSeen: graphqlUser.lastSeen,
      createdAt: graphqlUser.createdAt,
      updatedAt: graphqlUser.updatedAt,
    };
  }

  /**
   * Map GraphQL errors to user-friendly messages
   */
  private static mapUserError(error: any): Error {
    const errorMap: Record<string, string> = {
      'ConditionalCheckFailedException': 'User profile already exists.',
      'ValidationException': 'Invalid user data provided.',
      'ResourceNotFoundException': 'User profile not found.',
      'NetworkError': 'Network connection error. Please try again.',
    };

    const errorType = error.name || error.code || 'UnknownError';
    const message = errorMap[errorType] || error.message || 'An unexpected error occurred.';

    return new Error(message);
  }
}

export default UserService;
