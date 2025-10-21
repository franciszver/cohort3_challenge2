/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser(
    $filter: ModelSubscriptionUserFilterInput
    $id: String
  ) {
    onCreateUser(filter: $filter, id: $id) {
      id
      username
      email
      displayName
      avatar
      status
      lastSeen
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser(
    $filter: ModelSubscriptionUserFilterInput
    $id: String
  ) {
    onUpdateUser(filter: $filter, id: $id) {
      id
      username
      email
      displayName
      avatar
      status
      lastSeen
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser(
    $filter: ModelSubscriptionUserFilterInput
    $id: String
  ) {
    onDeleteUser(filter: $filter, id: $id) {
      id
      username
      email
      displayName
      avatar
      status
      lastSeen
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onCreateConversation = /* GraphQL */ `
  subscription OnCreateConversation(
    $filter: ModelSubscriptionConversationFilterInput
  ) {
    onCreateConversation(filter: $filter) {
      id
      name
      description
      isGroup
      participants
      lastMessage
      lastMessageAt
      lastMessageSender
      createdBy
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onUpdateConversation = /* GraphQL */ `
  subscription OnUpdateConversation(
    $filter: ModelSubscriptionConversationFilterInput
  ) {
    onUpdateConversation(filter: $filter) {
      id
      name
      description
      isGroup
      participants
      lastMessage
      lastMessageAt
      lastMessageSender
      createdBy
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onDeleteConversation = /* GraphQL */ `
  subscription OnDeleteConversation(
    $filter: ModelSubscriptionConversationFilterInput
  ) {
    onDeleteConversation(filter: $filter) {
      id
      name
      description
      isGroup
      participants
      lastMessage
      lastMessageAt
      lastMessageSender
      createdBy
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onCreateConversationParticipant = /* GraphQL */ `
  subscription OnCreateConversationParticipant(
    $filter: ModelSubscriptionConversationParticipantFilterInput
    $userId: String
  ) {
    onCreateConversationParticipant(filter: $filter, userId: $userId) {
      id
      userId
      conversationId
      joinedAt
      leftAt
      role
      unreadCount
      lastReadAt
      notifications
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onUpdateConversationParticipant = /* GraphQL */ `
  subscription OnUpdateConversationParticipant(
    $filter: ModelSubscriptionConversationParticipantFilterInput
    $userId: String
  ) {
    onUpdateConversationParticipant(filter: $filter, userId: $userId) {
      id
      userId
      conversationId
      joinedAt
      leftAt
      role
      unreadCount
      lastReadAt
      notifications
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onDeleteConversationParticipant = /* GraphQL */ `
  subscription OnDeleteConversationParticipant(
    $filter: ModelSubscriptionConversationParticipantFilterInput
    $userId: String
  ) {
    onDeleteConversationParticipant(filter: $filter, userId: $userId) {
      id
      userId
      conversationId
      joinedAt
      leftAt
      role
      unreadCount
      lastReadAt
      notifications
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onCreateMessage = /* GraphQL */ `
  subscription OnCreateMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $senderId: String
  ) {
    onCreateMessage(filter: $filter, senderId: $senderId) {
      id
      content
      messageType
      senderId
      conversationId
      attachments
      metadata
      editedAt
      deletedAt
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onUpdateMessage = /* GraphQL */ `
  subscription OnUpdateMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $senderId: String
  ) {
    onUpdateMessage(filter: $filter, senderId: $senderId) {
      id
      content
      messageType
      senderId
      conversationId
      attachments
      metadata
      editedAt
      deletedAt
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onDeleteMessage = /* GraphQL */ `
  subscription OnDeleteMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $senderId: String
  ) {
    onDeleteMessage(filter: $filter, senderId: $senderId) {
      id
      content
      messageType
      senderId
      conversationId
      attachments
      metadata
      editedAt
      deletedAt
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onCreateMessageRead = /* GraphQL */ `
  subscription OnCreateMessageRead(
    $filter: ModelSubscriptionMessageReadFilterInput
    $userId: String
  ) {
    onCreateMessageRead(filter: $filter, userId: $userId) {
      id
      messageId
      userId
      readAt
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onUpdateMessageRead = /* GraphQL */ `
  subscription OnUpdateMessageRead(
    $filter: ModelSubscriptionMessageReadFilterInput
    $userId: String
  ) {
    onUpdateMessageRead(filter: $filter, userId: $userId) {
      id
      messageId
      userId
      readAt
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
export const onDeleteMessageRead = /* GraphQL */ `
  subscription OnDeleteMessageRead(
    $filter: ModelSubscriptionMessageReadFilterInput
    $userId: String
  ) {
    onDeleteMessageRead(filter: $filter, userId: $userId) {
      id
      messageId
      userId
      readAt
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
      __typename
    }
  }
`;
