// Forgot Password Screen - password reset form
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
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '../../navigation/types';
import Button from '../../components/common/Button';
import TextInput from '../../components/common/TextInput';
import { validateEmail, validateRequired } from '../../utils';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const validateForm = (): boolean => {
    const emailError = validateRequired(email, 'Email') || 
                      (!validateEmail(email) ? 'Please enter a valid email address' : null);
    
    setError(emailError);
    return !emailError;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const AuthService = (await import('../../services/auth')).default;
      
      await AuthService.forgotPassword({ username: email });
      
      setIsEmailSent(true);
      
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      if (error.code === 'UserNotFoundException') {
        Alert.alert(
          'Account Not Found',
          'No account found with this email address. Please check your email or create a new account.'
        );
      } else if (error.code === 'LimitExceededException') {
        Alert.alert(
          'Too Many Requests',
          'Too many password reset attempts. Please wait a few minutes before trying again.'
        );
      } else {
        Alert.alert(
          'Reset Failed',
          error.message || 'Unable to send reset email. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    navigation.navigate('SignIn');
  };

  const handleResendEmail = () => {
    setIsEmailSent(false);
    handleResetPassword();
  };

  if (isEmailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Success State */}
          <View style={styles.successHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>📧</Text>
            </View>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successSubtitle}>
              We've sent password reset instructions to{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
          </View>

          <View style={styles.successActions}>
            <Button
              title="Back to Sign In"
              onPress={handleBackToSignIn}
              style={styles.backButton}
            />
            
            <Button
              title="Resend Email"
              onPress={handleResendEmail}
              variant="outline"
              style={styles.resendButton}
            />
          </View>

          <View style={styles.helpText}>
            <Text style={styles.helpNote}>
              Didn't receive the email? Check your spam folder or try again.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (error) setError(null);
              }}
              error={error}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              autoCapitalize="none"
              autoCorrect={false}
              required
            />

            <Button
              title="Send Reset Instructions"
              onPress={handleResetPassword}
              loading={isLoading}
              style={styles.resetButton}
            />
          </View>

          {/* Back to Sign In */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <Button
              title="Sign In"
              onPress={handleBackToSignIn}
              variant="secondary"
              size="small"
              style={styles.signInButton}
            />
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
    paddingTop: 20,
    paddingBottom: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
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
    paddingHorizontal: 16,
  },
  form: {
    marginBottom: 32,
  },
  resetButton: {
    marginTop: 24,
    paddingVertical: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 16,
    color: '#666666',
  },
  signInButton: {
    paddingHorizontal: 8,
  },
  // Success state styles
  successHeader: {
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
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  successActions: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
    paddingVertical: 16,
  },
  resendButton: {
    paddingVertical: 12,
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

export default ForgotPasswordScreen;