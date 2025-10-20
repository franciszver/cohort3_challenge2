/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
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
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncUsers = /* GraphQL */ `
  query SyncUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncUsers(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getConversation = /* GraphQL */ `
  query GetConversation($id: ID!) {
    getConversation(id: $id) {
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
export const listConversations = /* GraphQL */ `
  query ListConversations(
    $filter: ModelConversationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listConversations(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncConversations = /* GraphQL */ `
  query SyncConversations(
    $filter: ModelConversationFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncConversations(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getConversationParticipant = /* GraphQL */ `
  query GetConversationParticipant($id: ID!) {
    getConversationParticipant(id: $id) {
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
export const listConversationParticipants = /* GraphQL */ `
  query ListConversationParticipants(
    $filter: ModelConversationParticipantFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listConversationParticipants(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncConversationParticipants = /* GraphQL */ `
  query SyncConversationParticipants(
    $filter: ModelConversationParticipantFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncConversationParticipants(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getMessage = /* GraphQL */ `
  query GetMessage($id: ID!) {
    getMessage(id: $id) {
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
export const listMessages = /* GraphQL */ `
  query ListMessages(
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncMessages = /* GraphQL */ `
  query SyncMessages(
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncMessages(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getMessageRead = /* GraphQL */ `
  query GetMessageRead($id: ID!) {
    getMessageRead(id: $id) {
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
export const listMessageReads = /* GraphQL */ `
  query ListMessageReads(
    $filter: ModelMessageReadFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMessageReads(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const syncMessageReads = /* GraphQL */ `
  query SyncMessageReads(
    $filter: ModelMessageReadFilterInput
    $limit: Int
    $nextToken: String
    $lastSync: AWSTimestamp
  ) {
    syncMessageReads(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      lastSync: $lastSync
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getUserByUsername = /* GraphQL */ `
  query GetUserByUsername(
    $username: String!
    $sortDirection: ModelSortDirection
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    getUserByUsername(
      username: $username
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const getUserByEmail = /* GraphQL */ `
  query GetUserByEmail(
    $email: String!
    $sortDirection: ModelSortDirection
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    getUserByEmail(
      email: $email
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const conversationParticipantsByUserIdAndConversationId = /* GraphQL */ `
  query ConversationParticipantsByUserIdAndConversationId(
    $userId: String!
    $conversationId: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelConversationParticipantFilterInput
    $limit: Int
    $nextToken: String
  ) {
    conversationParticipantsByUserIdAndConversationId(
      userId: $userId
      conversationId: $conversationId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const conversationParticipantsByConversationIdAndUserId = /* GraphQL */ `
  query ConversationParticipantsByConversationIdAndUserId(
    $conversationId: String!
    $userId: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelConversationParticipantFilterInput
    $limit: Int
    $nextToken: String
  ) {
    conversationParticipantsByConversationIdAndUserId(
      conversationId: $conversationId
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const messagesBySenderIdAndCreatedAt = /* GraphQL */ `
  query MessagesBySenderIdAndCreatedAt(
    $senderId: String!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesBySenderIdAndCreatedAt(
      senderId: $senderId
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const messagesByConversationIdAndCreatedAt = /* GraphQL */ `
  query MessagesByConversationIdAndCreatedAt(
    $conversationId: String!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesByConversationIdAndCreatedAt(
      conversationId: $conversationId
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const messageReadsByMessageIdAndUserId = /* GraphQL */ `
  query MessageReadsByMessageIdAndUserId(
    $messageId: String!
    $userId: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMessageReadFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messageReadsByMessageIdAndUserId(
      messageId: $messageId
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
export const messageReadsByUserIdAndReadAt = /* GraphQL */ `
  query MessageReadsByUserIdAndReadAt(
    $userId: String!
    $readAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelMessageReadFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messageReadsByUserIdAndReadAt(
      userId: $userId
      readAt: $readAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
      startedAt
      __typename
    }
  }
`;
