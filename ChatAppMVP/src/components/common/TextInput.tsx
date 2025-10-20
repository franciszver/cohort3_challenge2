// Reusable Text Input Component with validation states
import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TextInputProps extends RNTextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  isPassword = false,
  containerStyle,
  required = false,
  value,
  onChangeText,
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(isPassword);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(error);
  const hasValue = Boolean(value && value.length > 0);

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  const getInputStyle = () => {
    const baseStyle = [styles.input];
    
    if (isFocused) {
      baseStyle.push(styles.inputFocused);
    }
    
    if (hasError) {
      baseStyle.push(styles.inputError);
    }
    
    return baseStyle;
  };

  const getLabelStyle = () => {
    const baseStyle = [styles.label];
    
    if (isFocused || hasValue) {
      baseStyle.push(styles.labelFloating);
    }
    
    if (hasError) {
      baseStyle.push(styles.labelError);
    } else if (isFocused) {
      baseStyle.push(styles.labelFocused);
    }
    
    return baseStyle;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputContainer}>
        <Text style={getLabelStyle()}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        
        <RNTextInput
          style={getInputStyle()}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={toggleSecureEntry}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#666666"
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: 16,
    top: 16,
    fontSize: 16,
    color: '#999999',
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
    zIndex: 1,
    transition: 'all 0.2s',
  },
  labelFloating: {
    top: -8,
    fontSize: 12,
    fontWeight: '500',
  },
  labelFocused: {
    color: '#007AFF',
  },
  labelError: {
    color: '#FF3B30',
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  inputFocused: {
    borderColor: '#007AFF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 18,
    padding: 4,
  },
  errorText: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
  helperText: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 12,
    color: '#666666',
  },
});

export default TextInput;

