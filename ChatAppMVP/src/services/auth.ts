// Authentication service using AWS Amplify Cognito
import { Auth, Hub } from 'aws-amplify';
import { User } from '../types';
import UserService from './user';

export interface SignInParams {
  username: string;
  password: string;
}

export interface SignUpParams {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface ConfirmSignUpParams {
  username: string;
  code: string;
}

export interface ForgotPasswordParams {
  username: string;
}

export interface ResetPasswordParams {
  username: string;
  code: string;
  newPassword: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export class AuthService {
  
  /**
   * Sign in with email and password
   */
  static async signIn(params: SignInParams): Promise<User> {
    try {
      const cognitoUser = await Auth.signIn(params.username, params.password);
      
      // Handle different sign-in scenarios
      if (cognitoUser.challengeName === 'NEW_PASSWORD_REQUIRED') {
        throw {
          code: 'NEW_PASSWORD_REQUIRED',
          message: 'New password required',
          cognitoUser
        };
      }
      
      if (cognitoUser.challengeName === 'MFA_SETUP') {
        throw {
          code: 'MFA_SETUP',
          message: 'MFA setup required',
          cognitoUser
        };
      }

      // Get user attributes
      const userAttributes = await Auth.currentUserInfo();
      
      return AuthService.mapCognitoUserToUser(cognitoUser, userAttributes);
      
    } catch (error: any) {
      console.error('SignIn error:', error);
      throw AuthService.mapAuthError(error);
    }
  }

  /**
   * Sign up new user
   */
  static async signUp(params: SignUpParams): Promise<{ userSub: string; codeDeliveryDetails: any }> {
    try {
      const { user } = await Auth.signUp({
        username: params.email, // Use email as username
        password: params.password,
        attributes: {
          email: params.email,
          name: params.displayName,
          preferred_username: params.username,
        },
      });

      return {
        userSub: user.getUsername(),
        codeDeliveryDetails: user.codeDeliveryDetails,
      };
      
    } catch (error: any) {
      console.error('SignUp error:', error);
      throw AuthService.mapAuthError(error);
    }
  }

  /**
   * Confirm sign up with verification code and create user profile
   */
  static async confirmSignUp(params: ConfirmSignUpParams): Promise<void> {
    try {
      await Auth.confirmSignUp(params.username, params.code);
      
      // After successful verification, we don't need to create profile here
      // as it will be created in getCurrentUser() when they sign in
      
    } catch (error: any) {
      console.error('ConfirmSignUp error:', error);
      throw AuthService.mapAuthError(error);
    }
  }

  /**
   * Resend verification code
   */
  static async resendSignUpCode(username: string): Promise<any> {
    try {
      return await Auth.resendSignUp(username);
    } catch (error: any) {
      console.error('ResendSignUp error:', error);
      throw AuthService.mapAuthError(error);
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      await Auth.signOut();
    } catch (error: any) {
      console.error('SignOut error:', error);
      throw AuthService.mapAuthError(error);
    }
  }

  /**
   * Get current authenticated user and ensure profile exists
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const userAttributes = await Auth.currentUserInfo();
      
      // Ensure user profile exists in DynamoDB
      const user = await UserService.ensureUserProfile(cognitoUser, userAttributes);
      
      return user;
      
    } catch (error) {
      // User is not authenticated
      return null;
    }
  }

  /**
   * Initiate forgot password flow
   */
  static async forgotPassword(params: ForgotPasswordParams): Promise<any> {
    try {
      return await Auth.forgotPassword(params.username);
    } catch (error: any) {
      console.error('ForgotPassword error:', error);
      throw AuthService.mapAuthError(error);
    }
  }

  /**
   * Complete password reset with code
   */
  static async forgotPasswordSubmit(params: ResetPasswordParams): Promise<void> {
    try {
      await Auth.forgotPasswordSubmit(params.username, params.code, params.newPassword);
    } catch (error: any) {
      console.error('ForgotPasswordSubmit error:', error);
      throw AuthService.mapAuthError(error);
    }
  }

  /**
   * Update user attributes
   */
  static async updateUserAttributes(attributes: Record<string, string>): Promise<void> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      await Auth.updateUserAttributes(user, attributes);
    } catch (error: any) {
      console.error('UpdateUserAttributes error:', error);
      throw AuthService.mapAuthError(error);
    }
  }

  /**
   * Get current session
   */
  static async getCurrentSession(): Promise<any> {
    try {
      return await Auth.currentSession();
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      await Auth.currentAuthenticatedUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Map Cognito user to our User type
   */
  private static mapCognitoUserToUser(cognitoUser: any, userInfo: any): User {
    const attributes = userInfo?.attributes || {};
    
    return {
      id: cognitoUser.username || userInfo?.id,
      username: attributes.preferred_username || attributes.email || cognitoUser.username,
      email: attributes.email,
      displayName: attributes.name || attributes.preferred_username,
      avatar: attributes.picture,
      status: 'ONLINE', // Default status
      lastSeen: new Date().toISOString(),
      createdAt: attributes.created_at || new Date().toISOString(),
      updatedAt: attributes.updated_at || new Date().toISOString(),
    };
  }

  /**
   * Map Amplify auth errors to our format
   */
  private static mapAuthError(error: any): AuthError {
    const errorMap: Record<string, string> = {
      'UserNotFoundException': 'No account found with this email address.',
      'NotAuthorizedException': 'Incorrect email or password.',
      'UserNotConfirmedException': 'Please verify your email address before signing in.',
      'PasswordResetRequiredException': 'Password reset is required for this account.',
      'TooManyRequestsException': 'Too many attempts. Please try again later.',
      'LimitExceededException': 'Attempt limit exceeded. Please try again later.',
      'InvalidParameterException': 'Invalid parameters provided.',
      'InvalidPasswordException': 'Password does not meet requirements.',
      'UsernameExistsException': 'An account with this email already exists.',
      'CodeMismatchException': 'Invalid verification code.',
      'ExpiredCodeException': 'Verification code has expired.',
      'AliasExistsException': 'An account with this email already exists.',
    };

    const code = error.code || 'UnknownError';
    const message = errorMap[code] || error.message || 'An unexpected error occurred.';

    return { code, message };
  }
}

export default AuthService;