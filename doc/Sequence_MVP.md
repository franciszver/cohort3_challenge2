sequenceDiagram
    participant UserA as 👤 User A (Sender)
    participant ClientA as 📱 Expo Go Client (User A)
    participant AppSync as ☁️ AWS AppSync (GraphQL API)
    participant DynamoDB as 🗄️ DynamoDB (Message Store)
    participant ClientB as 📱 Expo Go Client (User B)
    participant UserB as 👤 User B (Recipient)

    UserA->>ClientA: Type message + press send
    ClientA->>ClientA: Optimistic UI update (message appears instantly)
    ClientA->>AppSync: GraphQL mutation (sendMessage)
    AppSync->>DynamoDB: Store message (with timestamp, senderID, conversationID)
    DynamoDB-->>AppSync: Confirm persistence
    AppSync-->>ClientA: Mutation success (update optimistic state)
    AppSync-->>ClientB: Subscription event (newMessage)
    ClientB->>UserB: Render new message in chat UI
