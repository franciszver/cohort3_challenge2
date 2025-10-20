// Sign In Screen - beautiful authentication form
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
import { validateEmail, validateRequired, getFirstError } from '../../utils';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email: string | null;
  password: string | null;
}

export const SignInScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({
    email: null,
    password: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      email: validateRequired(formData.email, 'Email') || 
             (!validateEmail(formData.email) ? 'Please enter a valid email address' : null),
      password: validateRequired(formData.password, 'Password'),
    };

    setErrors(newErrors);
    return !getFirstError(newErrors);
  };

  const handleSignIn = async () => {
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
      
      await AuthService.signIn({
        username: formData.email,
        password: formData.password,
      });

      // Authentication successful - navigation will be handled by AppNavigator
      // through auth state change detection
      
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      if (error.code === 'UserNotConfirmedException') {
        Alert.alert(
          'Email Verification Required',
          'Please check your email and verify your account before signing in.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
      } else {
        Alert.alert(
          'Sign In Failed',
          error.message || 'Please check your credentials and try again.'
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
  };

  const navigateToSignUp = () => {
    navigation.navigate('SignUp');
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue messaging</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
              autoComplete="password"
              textContentType="password"
              required
            />

            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={isLoading}
              style={styles.signInButton}
            />
          </View>

          {/* Forgot Password Link */}
          <View style={styles.links}>
            <Button
              title="Forgot Password?"
              onPress={navigateToForgotPassword}
              variant="outline"
              size="small"
            />
          </View>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Button
              title="Sign Up"
              onPress={navigateToSignUp}
              variant="secondary"
              size="small"
              style={styles.signUpButton}
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
    marginBottom: 48,
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
    marginBottom: 32,
  },
  signInButton: {
    marginTop: 24,
    paddingVertical: 16,
  },
  links: {
    alignItems: 'center',
    marginBottom: 32,
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
  signUpButton: {
    paddingHorizontal: 8,
  },
});

export default SignInScreen;