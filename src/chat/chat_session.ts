import { randomUUID } from 'node:crypto';

import { ChatMessage, ChatRole, cloneChatMessage, createChatMessage } from './chat_message';

export const DEFAULT_CHAT_TITLE = 'New chat';

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
};

export function createChatSession(title = DEFAULT_CHAT_TITLE): ChatSession {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function createChatSessionFromLegacy(id: string, messages: ChatMessage[]): ChatSession {
  const now = new Date().toISOString();

  return {
    id,
    title: createChatTitleFromMessages(messages),
    createdAt: messages[0]?.createdAt ?? now,
    updatedAt: messages[messages.length - 1]?.createdAt ?? now,
    messages: messages.map(cloneChatMessage),
  };
}

export function cloneChatSession(session: ChatSession): ChatSession {
  return {
    ...session,
    messages: session.messages.map(cloneChatMessage),
  };
}

export function addMessageToChatSession(session: ChatSession, role: ChatRole, content: string): void {
  const message = createChatMessage(role, content);

  session.messages.push(message);
  session.updatedAt = message.createdAt;

  if (role === 'user' && session.title === DEFAULT_CHAT_TITLE) {
    session.title = createChatTitleFromMessage(content);
  }
}

export function clearChatSession(session: ChatSession): void {
  session.title = DEFAULT_CHAT_TITLE;
  session.messages = [];
  session.updatedAt = new Date().toISOString();
}

export function renameChatSession(session: ChatSession, title: string): void {
  const cleanTitle = title.trim();

  if (!cleanTitle) {
    return;
  }

  session.title = cleanTitle;
  session.updatedAt = new Date().toISOString();
}

export function normalizeChatSession(session: ChatSession): ChatSession {
  return {
    id: session.id || randomUUID(),
    title: session.title?.trim() || DEFAULT_CHAT_TITLE,
    createdAt: session.createdAt || new Date().toISOString(),
    updatedAt: session.updatedAt || session.createdAt || new Date().toISOString(),
    messages: Array.isArray(session.messages) ? session.messages.map(cloneChatMessage) : [],
  };
}

function createChatTitleFromMessages(messages: ChatMessage[]): string {
  const firstUserMessage = messages.find((message) => message.role === 'user')?.content;

  return createChatTitleFromMessage(firstUserMessage ?? '');
}

function createChatTitleFromMessage(message: string): string {
  const clean = message.trim().replace(/\s+/g, ' ');

  if (!clean) {
    return DEFAULT_CHAT_TITLE;
  }

  return clean.length > 48 ? `${clean.slice(0, 48)}...` : clean;
}
