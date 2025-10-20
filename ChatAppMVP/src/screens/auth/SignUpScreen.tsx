// Sign Up Screen - beautiful registration form
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
import { 
  validateEmail, 
  validateRequired, 
  validatePassword,
  validateConfirmPassword,
  getFirstError 
} from '../../utils';

interface FormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  displayName: string | null;
  email: string | null;
  password: string | null;
  confirmPassword: string | null;
}

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({
    displayName: null,
    email: null,
    password: null,
    confirmPassword: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: false, errors: [] });

  const validateForm = (): boolean => {
    const passwordResult = validatePassword(formData.password);
    const newErrors: FormErrors = {
      displayName: validateRequired(formData.displayName, 'Display Name'),
      email: validateRequired(formData.email, 'Email') || 
             (!validateEmail(formData.email) ? 'Please enter a valid email address' : null),
      password: validateRequired(formData.password, 'Password') ||
               (!passwordResult.isValid ? passwordResult.errors[0] : null),
      confirmPassword: validateRequired(formData.confirmPassword, 'Confirm Password') ||
                      validateConfirmPassword(formData.password, formData.confirmPassword),
    };

    setErrors(newErrors);
    return !getFirstError(newErrors);
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      const firstError = getFirstError(errors);
      if (firstError) {
        Alert.alert('Validation Error', firstError);
      }
      return;
    }

    setIsLoading(true);
    
    try {
      const AuthService = (await import('../../services/auth')).default;
      
      await AuthService.signUp({
        username: formData.displayName,
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
      });

      // Navigate to confirmation screen
      navigation.navigate('ConfirmSignUp', {
        email: formData.email,
        password: formData.password,
      });
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      if (error.code === 'UsernameExistsException' || error.code === 'AliasExistsException') {
        Alert.alert(
          'Account Already Exists',
          'An account with this email address already exists. Please try signing in instead.',
          [
            { text: 'Sign In', onPress: () => navigation.navigate('SignIn') },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } else if (error.code === 'InvalidPasswordException') {
        setErrors(prev => ({ 
          ...prev, 
          password: error.message 
        }));
      } else {
        Alert.alert(
          'Registration Failed',
          error.message || 'Please check your information and try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Update password validation in real-time
    if (field === 'password') {
      setPasswordValidation(validatePassword(value));
    }
  };

  const navigateToSignIn = () => {
    navigation.navigate('SignIn');
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the conversation today</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Display Name"
              value={formData.displayName}
              onChangeText={(value) => handleInputChange('displayName', value)}
              error={errors.displayName}
              autoComplete="name"
              textContentType="name"
              helperText="This is how others will see you in chats"
              required
            />

            <TextInput
              label="Email Address"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              error={errors.email}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              required
            />

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              error={errors.password}
              isPassword
              autoComplete="new-password"
              textContentType="newPassword"
              required
            />

            {/* Password Requirements */}
            {formData.password.length > 0 && (
              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                {passwordValidation.errors.map((error, index) => (
                  <Text key={index} style={styles.requirementError}>• {error}</Text>
                ))}
                {passwordValidation.isValid && (
                  <Text style={styles.requirementSuccess}>✓ Password meets all requirements</Text>
                )}
              </View>
            )}

            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              error={errors.confirmPassword}
              isPassword
              autoComplete="new-password"
              textContentType="newPassword"
              required
            />

            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={isLoading}
              style={styles.signUpButton}
            />
          </View>

          {/* Terms Notice */}
          <View style={styles.terms}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>{' '}
              and <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Sign In Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Button
              title="Sign In"
              onPress={navigateToSignIn}
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
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  signUpButton: {
    marginTop: 24,
    paddingVertical: 16,
  },
  passwordRequirements: {
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 4,
  },
  requirementError: {
    fontSize: 11,
    color: '#FF3B30',
    marginBottom: 2,
  },
  requirementSuccess: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
  terms: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '500',
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
});

export default SignUpScreen;