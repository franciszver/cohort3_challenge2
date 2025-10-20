// Edit Profile Screen - user profile editing
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { User, UserStatus } from '../../types';
import Button from '../../components/common/Button';
import TextInput from '../../components/common/TextInput';
import LoadingScreen from '../../components/common/LoadingScreen';
import UserService from '../../services/user';
import AuthService from '../../services/auth';
import { validateRequired } from '../../utils';

type EditProfileRouteProp = RouteProp<{
  EditProfile: {
    user: User;
  };
}, 'EditProfile'>;

interface FormData {
  displayName: string;
  username: string;
  status: UserStatus;
}

interface FormErrors {
  displayName: string | null;
  username: string | null;
}

const statusOptions: { value: UserStatus; label: string; icon: string }[] = [
  { value: UserStatus.ONLINE, label: 'Online', icon: '🟢' },
  { value: UserStatus.AWAY, label: 'Away', icon: '🟡' },
  { value: UserStatus.BUSY, label: 'Busy', icon: '🔴' },
  { value: UserStatus.OFFLINE, label: 'Offline', icon: '⚫' },
];

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<EditProfileRouteProp>();
  const { user } = route.params;

  const [formData, setFormData] = useState<FormData>({
    displayName: user.displayName || user.username,
    username: user.username,
    status: user.status || UserStatus.ONLINE,
  });
  
  const [errors, setErrors] = useState<FormErrors>({
    displayName: null,
    username: null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if form has changes
    const hasFormChanges = 
      formData.displayName !== (user.displayName || user.username) ||
      formData.username !== user.username ||
      formData.status !== (user.status || UserStatus.ONLINE);
    
    setHasChanges(hasFormChanges);
  }, [formData, user]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      displayName: validateRequired(formData.displayName, 'Display Name'),
      username: validateRequired(formData.username, 'Username'),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== null);
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      await UserService.updateUserProfile({
        id: user.id,
        displayName: formData.displayName,
        status: formData.status,
      });

      Alert.alert(
        'Profile Updated',
        'Your profile has been successfully updated.',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );

    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Update Failed',
        error.message || 'Unable to update profile. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | UserStatus) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (field in errors && errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleStatusSelect = (status: UserStatus) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
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
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Profile</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {formData.displayName?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <TouchableOpacity style={styles.changeAvatarButton}>
              <Text style={styles.changeAvatarText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Display Name"
              value={formData.displayName}
              onChangeText={(value) => handleInputChange('displayName', value)}
              error={errors.displayName}
              helperText="This is how others will see you in chats"
              required
            />

            <TextInput
              label="Username"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              error={errors.username}
              helperText="Your unique identifier"
              autoCapitalize="none"
              required
              editable={false} // Username shouldn't be editable after creation
              style={styles.disabledInput}
            />

            {/* Status Selection */}
            <View style={styles.statusSection}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={styles.statusHelperText}>
                Let others know your availability
              </Text>
              
              <View style={styles.statusOptions}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusOption,
                      formData.status === option.value && styles.statusOptionSelected
                    ]}
                    onPress={() => handleStatusSelect(option.value)}
                  >
                    <Text style={styles.statusIcon}>{option.icon}</Text>
                    <Text style={[
                      styles.statusText,
                      formData.status === option.value && styles.statusTextSelected
                    ]}>
                      {option.label}
                    </Text>
                    {formData.status === option.value && (
                      <Ionicons name="checkmark" size={20} color="#007AFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Account Info */}
            <View style={styles.accountSection}>
              <Text style={styles.sectionTitle}>Account Information</Text>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <Button
              title="Save Changes"
              onPress={handleSaveProfile}
              loading={isSaving}
              disabled={!hasChanges}
              style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  cancelButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  changeAvatarButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changeAvatarText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  statusSection: {
    marginBottom: 32,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  statusHelperText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  statusOptions: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  statusOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  statusText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  statusTextSelected: {
    fontWeight: '600',
    color: '#007AFF',
  },
  accountSection: {
    marginBottom: 32,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#000000',
  },
  infoValue: {
    fontSize: 16,
    color: '#666666',
  },
  saveButton: {
    paddingVertical: 16,
    marginTop: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
});

export default EditProfileScreen;

