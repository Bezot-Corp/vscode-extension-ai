import { ChatMessage } from './chat_message';

export type ChatSession = {
  id: string;
  messages: ChatMessage[];
};
