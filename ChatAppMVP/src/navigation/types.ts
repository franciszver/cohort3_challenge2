// Navigation type definitions for React Navigation

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ConfirmSignUp: {
    email: string;
    password: string;
  };
};

export type MainTabParamList = {
  ChatList: undefined;
  Settings: undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatRoom: {
    conversationId: string;
    conversationName?: string;
  };
  CreateGroup: undefined;
  UserProfile: {
    userId: string;
  };
  EditProfile: {
    user: any; // User type
  };
};

// Navigation prop types for type safety
import { NavigationProp } from '@react-navigation/native';

export type AuthNavigationProp = NavigationProp<AuthStackParamList>;
export type MainNavigationProp = NavigationProp<MainTabParamList>;
export type ChatNavigationProp = NavigationProp<ChatStackParamList>;
export type RootNavigationProp = NavigationProp<RootStackParamList>;
