export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  role: ChatRole;
  content: string;
  createdAt: string;
};

export function createChatMessage(role: ChatRole, content: string): ChatMessage {
  return {
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function cloneChatMessage(message: ChatMessage): ChatMessage {
  return {
    ...message,
  };
}
