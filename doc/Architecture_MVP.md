# 🏗️ Architecture_MVP

## 📚 High-Level Architecture

```mermaid
flowchart TD

    subgraph Client["📱 Client (Expo Go - React Native)"]
        UI["Chat UI (React Native Components)"]
        AuthModule["Auth Module (Amplify Auth)"]
        MsgModule["Messaging Module (GraphQL Queries/Mutations)"]
        SubModule["Realtime Subscriptions (GraphQL)"]
        NotifModule["Push Notifications (Expo Notifications)"]
    end

    subgraph Amplify["☁️ AWS Amplify Backend"]
        Cognito["Cognito (User Auth)"]
        AppSync["AppSync (GraphQL API + Subscriptions)"]
        DynamoDB["DynamoDB (Message & User Data Store)"]
        Pinpoint["Pinpoint (Push Notifications)"]
    end

    subgraph Optional["📦 Optional Future Services"]
        S3["S3 (Media Storage)"]
        Lambda["Lambda (Custom Business Logic)"]
    end

    %% Connections
    UI --> AuthModule
    UI --> MsgModule
    UI --> SubModule
    UI --> NotifModule

    AuthModule --> Cognito
    MsgModule --> AppSync
    SubModule --> AppSync
    AppSync --> DynamoDB
    DynamoDB --> AppSync

    NotifModule --> Pinpoint

    %% Optional flows
    MsgModule -.-> Lambda
    Lambda -.-> DynamoDB
    MsgModule -.-> S3
