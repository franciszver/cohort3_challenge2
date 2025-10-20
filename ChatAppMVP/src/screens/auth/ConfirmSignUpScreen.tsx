// Confirm Sign Up Screen - email verification
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AuthNavigationProp } from '../../navigation/types';
import Button from '../../components/common/Button';
import TextInput from '../../components/common/TextInput';
import AuthService from '../../services/auth';
import { validateRequired } from '../../utils';

type ConfirmSignUpRouteProp = RouteProp<{
  ConfirmSignUp: {
    email: string;
    password: string;
  };
}, 'ConfirmSignUp'>;

export const ConfirmSignUpScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<ConfirmSignUpRouteProp>();
  const { email, password } = route.params;

  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const validateForm = (): boolean => {
    const codeError = validateRequired(verificationCode, 'Verification Code');
    setError(codeError);
    return !codeError;
  };

  const handleConfirmSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await AuthService.confirmSignUp({
        username: email,
        code: verificationCode.trim(),
      });

      // Account verified, now sign in automatically
      await AuthService.signIn({
        username: email,
        password: password,
      });

      // Navigation will be handled by AppNavigator auth state change
      
    } catch (error: any) {
      console.error('Confirm sign up error:', error);
      
      if (error.code === 'CodeMismatchException') {
        setError('Invalid verification code. Please check and try again.');
      } else if (error.code === 'ExpiredCodeException') {
        Alert.alert(
          'Code Expired',
          'The verification code has expired. We\'ll send you a new one.',
          [
            { text: 'OK', onPress: handleResendCode }
          ]
        );
      } else {
        Alert.alert(
          'Verification Failed',
          error.message || 'Unable to verify your account. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    
    try {
      await AuthService.resendSignUpCode(email);
      
      Alert.alert(
        'Code Sent',
        'A new verification code has been sent to your email address.'
      );
      
      setVerificationCode('');
      setError(null);
      
    } catch (error: any) {
      console.error('Resend code error:', error);
      Alert.alert(
        'Resend Failed',
        error.message || 'Unable to resend verification code. Please try again.'
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>📧</Text>
            </View>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Verification Code"
              value={verificationCode}
              onChangeText={(value) => {
                setVerificationCode(value);
                if (error) setError(null);
              }}
              error={error}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={6}
              placeholder="Enter 6-digit code"
              required
            />

            <Button
              title="Verify Account"
              onPress={handleConfirmSignUp}
              loading={isLoading}
              style={styles.verifyButton}
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Resend Code"
              onPress={handleResendCode}
              variant="outline"
              loading={isResending}
              style={styles.resendButton}
            />
            
            <Button
              title="Change Email"
              onPress={handleBackToSignUp}
              variant="secondary"
              size="small"
              style={styles.backButton}
            />
          </View>

          {/* Help Text */}
          <View style={styles.helpText}>
            <Text style={styles.helpNote}>
              Didn't receive the code? Check your spam folder or request a new one.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F0F8FF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  form: {
    marginBottom: 32,
  },
  verifyButton: {
    marginTop: 24,
    paddingVertical: 16,
  },
  actions: {
    marginBottom: 24,
  },
  resendButton: {
    marginBottom: 16,
    paddingVertical: 12,
  },
  backButton: {
    paddingHorizontal: 8,
  },
  helpText: {
    alignItems: 'center',
  },
  helpNote: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ConfirmSignUpScreen;

