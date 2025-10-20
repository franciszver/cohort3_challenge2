// User Profile Screen - view and edit user profiles
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { ChatStackParamList } from '../../navigation/types';

interface UserProfileScreenProps {
  route: RouteProp<ChatStackParamList, 'UserProfile'>;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ route }) => {
  const { userId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>User Profile</Text>
        
        {/* User profile will be implemented in later phases */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            👤 Profile View Coming Soon
          </Text>
          <Text style={styles.note}>
            View user information and status
          </Text>
          <Text style={styles.userId}>
            User ID: {userId}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginBottom: 48,
  },
  placeholder: {
    padding: 32,
    backgroundColor: '#FFF5EE',
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6347',
    marginBottom: 12,
  },
  note: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 12,
  },
  userId: {
    fontSize: 12,
    color: '#FF6347',
    fontFamily: 'monospace',
  },
});

export default UserProfileScreen;

