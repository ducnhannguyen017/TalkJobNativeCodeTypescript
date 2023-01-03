import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection, AsyncItem } from "@aws-amplify/datastore";

export enum ProjectStatus {
  NOT_OPEN = "NOT_OPEN",
  PENDING = "PENDING",
  CLOSED = "CLOSED"
}

export enum MessageStatus {
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  READ = "READ"
}



type EagerTask = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Task, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly code?: string | null;
  readonly processStep?: number | null;
  readonly description?: string | null;
  readonly summary?: string | null;
  readonly projectID?: string | null;
  readonly taskIndex?: number | null;
  readonly assigner?: string | null;
  readonly assignee?: string | null;
  readonly type?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyTask = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Task, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly code?: string | null;
  readonly processStep?: number | null;
  readonly description?: string | null;
  readonly summary?: string | null;
  readonly projectID?: string | null;
  readonly taskIndex?: number | null;
  readonly assigner?: string | null;
  readonly assignee?: string | null;
  readonly type?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Task = LazyLoading extends LazyLoadingDisabled ? EagerTask : LazyTask

export declare const Task: (new (init: ModelInit<Task>) => Task) & {
  copyOf(source: Task, mutator: (draft: MutableModel<Task>) => MutableModel<Task> | void): Task;
}

type EagerProject = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Project, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly key?: string | null;
  readonly description?: string | null;
  readonly Users?: (ProjectUser | null)[] | null;
  readonly Tasks?: (Task | null)[] | null;
  readonly Owner?: User | null;
  readonly status?: ProjectStatus | keyof typeof ProjectStatus | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly projectOwnerId?: string | null;
}

type LazyProject = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Project, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly key?: string | null;
  readonly description?: string | null;
  readonly Users: AsyncCollection<ProjectUser>;
  readonly Tasks: AsyncCollection<Task>;
  readonly Owner: AsyncItem<User | undefined>;
  readonly status?: ProjectStatus | keyof typeof ProjectStatus | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly projectOwnerId?: string | null;
}

export declare type Project = LazyLoading extends LazyLoadingDisabled ? EagerProject : LazyProject

export declare const Project: (new (init: ModelInit<Project>) => Project) & {
  copyOf(source: Project, mutator: (draft: MutableModel<Project>) => MutableModel<Project> | void): Project;
}

type EagerUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly imageUri?: string | null;
  readonly status?: string | null;
  readonly email?: string | null;
  readonly lastOnlineAt?: number | null;
  readonly phone?: string | null;
  readonly friends?: (string | null)[] | null;
  readonly Messages?: (Message | null)[] | null;
  readonly ChatRooms?: (ChatRoomUser | null)[] | null;
  readonly Projects?: (ProjectUser | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly imageUri?: string | null;
  readonly status?: string | null;
  readonly email?: string | null;
  readonly lastOnlineAt?: number | null;
  readonly phone?: string | null;
  readonly friends?: (string | null)[] | null;
  readonly Messages: AsyncCollection<Message>;
  readonly ChatRooms: AsyncCollection<ChatRoomUser>;
  readonly Projects: AsyncCollection<ProjectUser>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type User = LazyLoading extends LazyLoadingDisabled ? EagerUser : LazyUser

export declare const User: (new (init: ModelInit<User>) => User) & {
  copyOf(source: User, mutator: (draft: MutableModel<User>) => MutableModel<User> | void): User;
}

type EagerMessage = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Message, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly content?: string | null;
  readonly image?: string | null;
  readonly audio?: string | null;
  readonly status?: MessageStatus | keyof typeof MessageStatus | null;
  readonly replyToMessageID?: string | null;
  readonly forUserId?: string | null;
  readonly userID: string;
  readonly chatroomID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyMessage = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Message, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly content?: string | null;
  readonly image?: string | null;
  readonly audio?: string | null;
  readonly status?: MessageStatus | keyof typeof MessageStatus | null;
  readonly replyToMessageID?: string | null;
  readonly forUserId?: string | null;
  readonly userID: string;
  readonly chatroomID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Message = LazyLoading extends LazyLoadingDisabled ? EagerMessage : LazyMessage

export declare const Message: (new (init: ModelInit<Message>) => Message) & {
  copyOf(source: Message, mutator: (draft: MutableModel<Message>) => MutableModel<Message> | void): Message;
}

type EagerChatRoom = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoom, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly newMessages?: number | null;
  readonly name?: string | null;
  readonly imageUri?: string | null;
  readonly Members?: (ChatRoomUser | null)[] | null;
  readonly Owner?: User | null;
  readonly LastMessage?: Message | null;
  readonly Messages?: (Message | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly chatRoomOwnerId?: string | null;
  readonly chatRoomLastMessageId?: string | null;
}

type LazyChatRoom = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoom, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly newMessages?: number | null;
  readonly name?: string | null;
  readonly imageUri?: string | null;
  readonly Members: AsyncCollection<ChatRoomUser>;
  readonly Owner: AsyncItem<User | undefined>;
  readonly LastMessage: AsyncItem<Message | undefined>;
  readonly Messages: AsyncCollection<Message>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly chatRoomOwnerId?: string | null;
  readonly chatRoomLastMessageId?: string | null;
}

export declare type ChatRoom = LazyLoading extends LazyLoadingDisabled ? EagerChatRoom : LazyChatRoom

export declare const ChatRoom: (new (init: ModelInit<ChatRoom>) => ChatRoom) & {
  copyOf(source: ChatRoom, mutator: (draft: MutableModel<ChatRoom>) => MutableModel<ChatRoom> | void): ChatRoom;
}

type EagerProjectUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ProjectUser, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly projectId?: string | null;
  readonly userId?: string | null;
  readonly project: Project;
  readonly user: User;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyProjectUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ProjectUser, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly projectId?: string | null;
  readonly userId?: string | null;
  readonly project: AsyncItem<Project>;
  readonly user: AsyncItem<User>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ProjectUser = LazyLoading extends LazyLoadingDisabled ? EagerProjectUser : LazyProjectUser

export declare const ProjectUser: (new (init: ModelInit<ProjectUser>) => ProjectUser) & {
  copyOf(source: ProjectUser, mutator: (draft: MutableModel<ProjectUser>) => MutableModel<ProjectUser> | void): ProjectUser;
}

type EagerChatRoomUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoomUser, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userId?: string | null;
  readonly chatRoomId?: string | null;
  readonly user: User;
  readonly chatRoom: ChatRoom;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyChatRoomUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<ChatRoomUser, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly userId?: string | null;
  readonly chatRoomId?: string | null;
  readonly user: AsyncItem<User>;
  readonly chatRoom: AsyncItem<ChatRoom>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type ChatRoomUser = LazyLoading extends LazyLoadingDisabled ? EagerChatRoomUser : LazyChatRoomUser

export declare const ChatRoomUser: (new (init: ModelInit<ChatRoomUser>) => ChatRoomUser) & {
  copyOf(source: ChatRoomUser, mutator: (draft: MutableModel<ChatRoomUser>) => MutableModel<ChatRoomUser> | void): ChatRoomUser;
}