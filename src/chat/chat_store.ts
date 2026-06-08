import { ChatSession } from './chat_session';

export const CHAT_STORE_VERSION = 1;

export type ChatStore = {
  version: typeof CHAT_STORE_VERSION;
  activeSessionId: string;
  sessions: ChatSession[];
};
