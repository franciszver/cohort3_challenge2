// Settings Screen - user preferences and app settings
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import AuthService from '../../services/auth';
import { User } from '../../types';
import { ChatNavigationProp } from '../../navigation/types';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<ChatNavigationProp>();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  // Reload user data when screen comes into focus (after editing profile)
  useFocusEffect(
    React.useCallback(() => {
      loadCurrentUser();
    }, [])
  );

  const loadCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: confirmSignOut }
      ]
    );
  };

  const confirmSignOut = async () => {
    setIsSigningOut(true);
    
    try {
      await AuthService.signOut();
      // Navigation will be handled by AppNavigator auth state change
    } catch (error: any) {
      console.error('Sign out error:', error);
      Alert.alert(
        'Sign Out Failed',
        'Unable to sign out. Please try again.'
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleEditProfile = () => {
    if (currentUser) {
      navigation.navigate('EditProfile', { user: currentUser });
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'ONLINE': return 'Online';
      case 'AWAY': return 'Away';
      case 'BUSY': return 'Busy';
      case 'OFFLINE': return 'Offline';
      default: return 'Online';
    }
  };

  const getStatusDotStyle = (status?: string) => {
    switch (status) {
      case 'ONLINE': return styles.statusDotOnline;
      case 'AWAY': return styles.statusDotAway;
      case 'BUSY': return styles.statusDotBusy;
      case 'OFFLINE': return styles.statusDotOffline;
      default: return styles.statusDotOnline;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        
        {/* User Info Section */}
        {currentUser && (
          <View style={styles.userSection}>
            <View style={styles.accountHeader}>
              <Text style={styles.sectionTitle}>Account</Text>
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Ionicons name="create-outline" size={20} color="#007AFF" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.userCard}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {currentUser.displayName?.charAt(0)?.toUpperCase() || 
                   currentUser.username?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {currentUser.displayName || currentUser.username}
                </Text>
                <Text style={styles.userEmail}>{currentUser.email}</Text>
                <View style={styles.statusContainer}>
                  <View style={[styles.statusDot, getStatusDotStyle(currentUser.status)]} />
                  <Text style={styles.userStatus}>
                    {getStatusText(currentUser.status)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
        
        {/* Settings options */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Profile</Text>
            <Text style={styles.settingValue}>Update your info</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Privacy</Text>
            <Text style={styles.settingValue}>Manage privacy settings</Text>
          </View>
          
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingValue}>Enabled</Text>
          </View>
          
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0 (MVP)</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
            loading={isSigningOut}
            style={styles.signOutButton}
            textStyle={styles.signOutText}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 24,
  },
  userSection: {
    marginBottom: 32,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
  },
  editButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotOnline: {
    backgroundColor: '#34C759',
  },
  statusDotAway: {
    backgroundColor: '#FF9500',
  },
  statusDotBusy: {
    backgroundColor: '#FF3B30',
  },
  statusDotOffline: {
    backgroundColor: '#8E8E93',
  },
  userStatus: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  settingsSection: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#000000',
  },
  settingValue: {
    fontSize: 14,
    color: '#666666',
  },
  signOutSection: {
    paddingTop: 16,
  },
  signOutButton: {
    borderColor: '#FF3B30',
    paddingVertical: 16,
  },
  signOutText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
});

export default SettingsScreen;
