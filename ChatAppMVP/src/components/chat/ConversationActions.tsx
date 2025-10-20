// Conversation Actions Component - manage conversation settings and actions
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Conversation } from '../../types';

interface ConversationActionsProps {
  conversation: Conversation;
  isVisible: boolean;
  onClose: () => void;
  onLeaveConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onMuteConversation: (conversationId: string, isMuted: boolean) => void;
  onArchiveConversation: (conversationId: string, isArchived: boolean) => void;
  onRenameConversation?: (conversationId: string, newName: string) => void;
}

interface ActionItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  destructive?: boolean;
  onPress: () => void;
}

export const ConversationActions: React.FC<ConversationActionsProps> = ({
  conversation,
  isVisible,
  onClose,
  onLeaveConversation,
  onDeleteConversation,
  onMuteConversation,
  onArchiveConversation,
  onRenameConversation,
}) => {
  
  const handleLeaveConversation = () => {
    Alert.alert(
      'Leave Conversation',
      `Are you sure you want to leave ${conversation.name || 'this conversation'}? You won't receive any more messages.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            onLeaveConversation(conversation.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleDeleteConversation = () => {
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete ${conversation.name || 'this conversation'}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDeleteConversation(conversation.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleMuteConversation = () => {
    const isMuted = false; // TODO: Get from conversation metadata
    onMuteConversation(conversation.id, !isMuted);
    onClose();
  };

  const handleArchiveConversation = () => {
    const isArchived = false; // TODO: Get from conversation metadata
    onArchiveConversation(conversation.id, !isArchived);
    onClose();
  };

  const handleRenameConversation = () => {
    if (!onRenameConversation) return;
    
    Alert.prompt(
      'Rename Conversation',
      'Enter a new name for this conversation:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rename',
          onPress: (newName) => {
            if (newName?.trim()) {
              onRenameConversation(conversation.id, newName.trim());
              onClose();
            }
          },
        },
      ],
      'plain-text',
      conversation.name || ''
    );
  };

  const actions: ActionItem[] = [
    ...(conversation.isGroup && onRenameConversation ? [{
      id: 'rename',
      title: 'Rename',
      icon: 'pencil' as keyof typeof Ionicons.glyphMap,
      onPress: handleRenameConversation,
    }] : []),
    {
      id: 'mute',
      title: 'Mute Notifications',
      icon: 'notifications-off' as keyof typeof Ionicons.glyphMap,
      onPress: handleMuteConversation,
    },
    {
      id: 'archive',
      title: 'Archive',
      icon: 'archive' as keyof typeof Ionicons.glyphMap,
      onPress: handleArchiveConversation,
    },
    ...(conversation.isGroup ? [{
      id: 'leave',
      title: 'Leave Conversation',
      icon: 'log-out' as keyof typeof Ionicons.glyphMap,
      color: '#FF3B30',
      destructive: true,
      onPress: handleLeaveConversation,
    }] : []),
    {
      id: 'delete',
      title: conversation.isGroup ? 'Delete Conversation' : 'Delete Chat',
      icon: 'trash' as keyof typeof Ionicons.glyphMap,
      color: '#FF3B30',
      destructive: true,
      onPress: handleDeleteConversation,
    },
  ];

  const renderAction = (action: ActionItem) => (
    <TouchableOpacity
      key={action.id}
      style={[
        styles.actionItem,
        action.destructive && styles.destructiveAction,
      ]}
      onPress={action.onPress}
    >
      <Ionicons
        name={action.icon}
        size={24}
        color={action.color || '#007AFF'}
        style={styles.actionIcon}
      />
      <Text
        style={[
          styles.actionText,
          action.destructive && styles.destructiveText,
        ]}
      >
        {action.title}
      </Text>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Conversation Settings</Text>
              <View style={styles.placeholder} />
            </View>

            <View style={styles.conversationInfo}>
              <View style={styles.conversationAvatar}>
                <Text style={styles.conversationAvatarText}>
                  {(conversation.name || 'Chat').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.conversationDetails}>
                <Text style={styles.conversationName} numberOfLines={1}>
                  {conversation.name || (conversation.isGroup ? 'Group Chat' : 'Direct Message')}
                </Text>
                <Text style={styles.conversationMeta}>
                  {conversation.isGroup 
                    ? `${conversation.participants?.length || 0} participants`
                    : 'Direct message'
                  }
                </Text>
              </View>
            </View>

            <View style={styles.actionsContainer}>
              {actions.map(renderAction)}
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  safeArea: {
    paddingBottom: 34, // Safe area bottom
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 60, // Approximate width of close button
  },
  conversationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#F9F9F9',
  },
  conversationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  conversationAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  conversationDetails: {
    flex: 1,
  },
  conversationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  conversationMeta: {
    fontSize: 14,
    color: '#666666',
  },
  actionsContainer: {
    paddingVertical: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  destructiveAction: {
    backgroundColor: '#FFF5F5',
  },
  actionIcon: {
    marginRight: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  destructiveText: {
    color: '#FF3B30',
  },
});

export default ConversationActions;

