// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const UserStatus = {
  "ONLINE": "ONLINE",
  "OFFLINE": "OFFLINE",
  "AWAY": "AWAY",
  "BUSY": "BUSY"
};

const ConversationRole = {
  "ADMIN": "ADMIN",
  "MODERATOR": "MODERATOR",
  "MEMBER": "MEMBER"
};

const MessageType = {
  "TEXT": "TEXT",
  "IMAGE": "IMAGE",
  "FILE": "FILE",
  "SYSTEM": "SYSTEM"
};

const { User, Conversation, ConversationParticipant, Message, MessageRead } = initSchema(schema);

export {
  User,
  Conversation,
  ConversationParticipant,
  Message,
  MessageRead,
  UserStatus,
  ConversationRole,
  MessageType
};