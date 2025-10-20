# 📱 PRD_MVP – Chat App Product Requirements

## 🧩 Overview
This MVP delivers a lightweight, scalable chat experience using **React Native (Expo Go)** and **AWS Amplify**. It supports one-on-one and group messaging with real-time updates, user authentication, and basic presence indicators.

---

## 🎯 Goals
- Enable real-time chat between authenticated users.
- Ensure message persistence and offline resilience.
- Provide a responsive, optimistic UI experience.
- Support basic group chat and read receipts.
- Deliver push notifications (foreground only for MVP).

---

## 🛠️ Tech Stack
- **Frontend**: React Native via Expo Go
- **Backend**: AWS Amplify (Cognito, AppSync, DynamoDB, Pinpoint)
- **Realtime**: GraphQL subscriptions via AppSync
- **Storage**: DynamoDB (messages), S3 (optional for media)
- **Notifications**: Expo Notifications + AWS Pinpoint

---

## 👤 User Stories

### Authentication
- As a user, I can sign up and log in with email/password.
- As a user, I have a profile with a username and avatar.

### Messaging
- As a user, I can send and receive messages in real time.
- As a user, I see messages instantly (optimistic UI).
- As a user, my messages persist across app restarts.
- As a user, I see timestamps on each message.
- As a user, I see read receipts for messages I've sent.

### Presence
- As a user, I can see when others were last online.

### Group Chat
- As a user, I can create a group and invite others.
- As a user, I can send messages to all group members.

### Notifications
- As a user, I receive push notifications when a new message arrives (foreground only).

---

## 🧪 MVP Constraints
- ✅ Must run on Expo Go (no native modules).
- ✅ Must support Android emulator or physical device.
- ✅ Backend must be deployed (AWS Amplify).
- ❌ No background notifications or custom native code.
- ❌ No media messages or file uploads in MVP.

---

## 📦 Data Models (Simplified)

### User
```graphql
type User @model {
  id: ID!
  username: String!
  avatarUrl: String
  lastSeen: AWSDateTime
}


type Conversation @model {
  id: ID!
  name: String
  participants: [User!]!
  messages: [Message!] @connection(keyName: "byConversation", fields: ["id"])
}


type Message @model @key(name: "byConversation", fields: ["conversationID"]) {
  id: ID!
  conversationID: ID!
  senderID: ID!
  content: String!
  timestamp: AWSDateTime!
  readBy: [ID!] # user IDs who have read this message
}
```
