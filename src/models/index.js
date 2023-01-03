// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const ProjectStatus = {
  "NOT_OPEN": "NOT_OPEN",
  "PENDING": "PENDING",
  "CLOSED": "CLOSED"
};

const MessageStatus = {
  "SENT": "SENT",
  "DELIVERED": "DELIVERED",
  "READ": "READ"
};

const { Task, Project, User, Message, ChatRoom, ProjectUser, ChatRoomUser } = initSchema(schema);

export {
  Task,
  Project,
  User,
  Message,
  ChatRoom,
  ProjectUser,
  ChatRoomUser,
  ProjectStatus,
  MessageStatus
};