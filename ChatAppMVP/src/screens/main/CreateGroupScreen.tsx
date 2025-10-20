// Create Group Screen - create new group conversations
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

export const CreateGroupScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create New Group</Text>
        
        {/* Group creation form will be implemented in Phase 4 */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            👥 Group Creation Coming Soon
          </Text>
          <Text style={styles.note}>
            Create group chats with multiple participants
          </Text>
          <Text style={styles.feature}>
            Features: Group name, add members, group settings
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
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  note: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  feature: {
    fontSize: 12,
    color: '#007AFF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default CreateGroupScreen;

