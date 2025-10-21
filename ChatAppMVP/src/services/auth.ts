// Authentication service using AWS Amplify Cognito v6
import { 
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  signOut as amplifySignOut,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  getCurrentUser as amplifyGetCurrentUser,
  fetchUserAttributes,
  updateUserAttributes as amplifyUpdateUserAttributes,
  fetchAuthSession
} from '@aws-amplify/auth';
import { Hub } from '@aws-amplify/core';
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
      const { isSignedIn, nextStep } = await amplifySignIn({
        username: params.username,
        password: params.password
      });
      
      // Handle different sign-in scenarios
      if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        throw {
          code: 'NEW_PASSWORD_REQUIRED',
          message: 'New password required'
        };
      }
      
      if (nextStep.signInStep === 'CONTINUE_SIGN_IN_WITH_MFA_SETUP') {
        throw {
          code: 'MFA_SETUP',
          message: 'MFA setup required'
        };
      }

      if (!isSignedIn) {
        throw {
          code: 'SignInIncomplete',
          message: 'Sign in not completed'
        };
      }

      // Get user attributes
      const cognitoUser = await amplifyGetCurrentUser();
      const userAttributes = await fetchUserAttributes();
      
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
      const { isSignUpComplete, userId, nextStep } = await amplifySignUp({
        username: params.email, // Use email as username
        password: params.password,
        options: {
          userAttributes: {
            email: params.email,
            name: params.displayName,
            preferred_username: params.username,
          }
        }
      });

      return {
        userSub: userId || '',
        codeDeliveryDetails: nextStep.codeDeliveryDetails,
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
      await confirmSignUp({
        username: params.username,
        confirmationCode: params.code
      });
      
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
      return await resendSignUpCode({ username });
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
      await amplifySignOut();
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
      const cognitoUser = await amplifyGetCurrentUser();
      const userAttributes = await fetchUserAttributes();
      
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
      return await resetPassword({ username: params.username });
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
      await confirmResetPassword({
        username: params.username,
        confirmationCode: params.code,
        newPassword: params.newPassword
      });
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
      await amplifyUpdateUserAttributes({ userAttributes: attributes });
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
      return await fetchAuthSession();
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      await amplifyGetCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Map Cognito user to our User type
   */
  private static mapCognitoUserToUser(cognitoUser: any, userAttributes: any): User {
    return {
      id: cognitoUser.userId || cognitoUser.username,
      username: userAttributes.preferred_username || userAttributes.email || cognitoUser.username,
      email: userAttributes.email,
      displayName: userAttributes.name || userAttributes.preferred_username,
      avatar: userAttributes.picture,
      status: 'ONLINE', // Default status
      lastSeen: new Date().toISOString(),
      createdAt: userAttributes.created_at || new Date().toISOString(),
      updatedAt: userAttributes.updated_at || new Date().toISOString(),
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