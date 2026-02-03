export type ConversationParticipant = {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string | null;
};

export type MessageSender = {
  id: string;
  username: string;
  avatarUrl: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  sender: MessageSender;
  text: string;
  createdAt: string;
};

export type LastMessagePreview = {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  participants: ConversationParticipant[];
  lastMessage: LastMessagePreview | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
};

export type ConversationsResponse = {
  data: Conversation[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type MessagesResponse = {
  data: Message[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type CreateConversationResponse = {
  conversation: Conversation;
};

export type SendMessageResponse = {
  message: Message;
};

export type UnreadMessageCountResponse = {
  count: number;
};
