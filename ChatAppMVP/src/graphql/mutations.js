/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
export const createConversation = /* GraphQL */ `
  mutation CreateConversation(
    $input: CreateConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    createConversation(input: $input, condition: $condition) {
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
export const updateConversation = /* GraphQL */ `
  mutation UpdateConversation(
    $input: UpdateConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    updateConversation(input: $input, condition: $condition) {
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
export const deleteConversation = /* GraphQL */ `
  mutation DeleteConversation(
    $input: DeleteConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    deleteConversation(input: $input, condition: $condition) {
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
export const createConversationParticipant = /* GraphQL */ `
  mutation CreateConversationParticipant(
    $input: CreateConversationParticipantInput!
    $condition: ModelConversationParticipantConditionInput
  ) {
    createConversationParticipant(input: $input, condition: $condition) {
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
export const updateConversationParticipant = /* GraphQL */ `
  mutation UpdateConversationParticipant(
    $input: UpdateConversationParticipantInput!
    $condition: ModelConversationParticipantConditionInput
  ) {
    updateConversationParticipant(input: $input, condition: $condition) {
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
export const deleteConversationParticipant = /* GraphQL */ `
  mutation DeleteConversationParticipant(
    $input: DeleteConversationParticipantInput!
    $condition: ModelConversationParticipantConditionInput
  ) {
    deleteConversationParticipant(input: $input, condition: $condition) {
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
export const createMessage = /* GraphQL */ `
  mutation CreateMessage(
    $input: CreateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    createMessage(input: $input, condition: $condition) {
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
export const updateMessage = /* GraphQL */ `
  mutation UpdateMessage(
    $input: UpdateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    updateMessage(input: $input, condition: $condition) {
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
export const deleteMessage = /* GraphQL */ `
  mutation DeleteMessage(
    $input: DeleteMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    deleteMessage(input: $input, condition: $condition) {
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
export const createMessageRead = /* GraphQL */ `
  mutation CreateMessageRead(
    $input: CreateMessageReadInput!
    $condition: ModelMessageReadConditionInput
  ) {
    createMessageRead(input: $input, condition: $condition) {
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
export const updateMessageRead = /* GraphQL */ `
  mutation UpdateMessageRead(
    $input: UpdateMessageReadInput!
    $condition: ModelMessageReadConditionInput
  ) {
    updateMessageRead(input: $input, condition: $condition) {
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
export const deleteMessageRead = /* GraphQL */ `
  mutation DeleteMessageRead(
    $input: DeleteMessageReadInput!
    $condition: ModelMessageReadConditionInput
  ) {
    deleteMessageRead(input: $input, condition: $condition) {
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
