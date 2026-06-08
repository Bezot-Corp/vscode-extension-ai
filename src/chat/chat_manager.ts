import { randomUUID } from 'node:crypto';

import { ChatMessage, ChatRole } from './chat_message';
import { ChatSession } from './chat_session';
import { CHAT_STORE_VERSION, ChatStore } from './chat_store';
import { ChatStorage } from './chat_storage';

export class ChatManager {
  private store: ChatStore = createDefaultStore();

  constructor(private readonly storage: ChatStorage) {}

  async load(): Promise<void> {
    const stored = await this.storage.load();

    if (stored) {
      this.store = normalizeStore(stored);
    }
  }

  getStore(): ChatStore {
    return {
      ...this.store,
      sessions: this.store.sessions.map((session) => ({
        ...session,
        messages: [...session.messages],
      })),
    };
  }

  getSessions(): ChatSession[] {
    return this.store.sessions.map((session) => ({
      ...session,
      messages: [...session.messages],
    }));
  }

  getActiveSession(): ChatSession {
    return this.getOrCreateActiveSession();
  }

  getMessages(): ChatMessage[] {
    return [...this.getOrCreateActiveSession().messages];
  }

  async createSession(title = 'New chat'): Promise<ChatSession> {
    const session = createSession(title);

    this.store.sessions.unshift(session);
    this.store.activeSessionId = session.id;

    await this.persist();

    return session;
  }

  async setActiveSession(sessionId: string): Promise<ChatSession | undefined> {
    const session = this.store.sessions.find((candidate) => candidate.id === sessionId);

    if (!session) {
      return undefined;
    }

    this.store.activeSessionId = session.id;

    await this.persist();

    return session;
  }

  async renameSession(sessionId: string, title: string): Promise<void> {
    const session = this.store.sessions.find((candidate) => candidate.id === sessionId);
    const cleanTitle = title.trim();

    if (!session || !cleanTitle) {
      return;
    }

    session.title = cleanTitle;
    session.updatedAt = new Date().toISOString();

    await this.persist();
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.store.sessions = this.store.sessions.filter((session) => session.id !== sessionId);

    if (this.store.sessions.length === 0) {
      const session = createSession();
      this.store.sessions = [session];
      this.store.activeSessionId = session.id;

      await this.persist();
      return;
    }

    if (this.store.activeSessionId === sessionId) {
      this.store.activeSessionId = this.store.sessions[0].id;
    }

    await this.persist();
  }

  async addMessage(role: ChatRole, content: string): Promise<void> {
    const session = this.getOrCreateActiveSession();
    const now = new Date().toISOString();

    session.messages.push({
      role,
      content,
      createdAt: now,
    });

    session.updatedAt = now;

    if (role === 'user' && session.title === 'New chat') {
      session.title = createTitleFromMessage(content);
    }

    await this.persist();
  }

  async clearActiveSession(): Promise<void> {
    const session = this.getOrCreateActiveSession();
    const now = new Date().toISOString();

    session.title = 'New chat';
    session.messages = [];
    session.updatedAt = now;

    await this.persist();
  }

  private getOrCreateActiveSession(): ChatSession {
    let session = this.store.sessions.find((candidate) => candidate.id === this.store.activeSessionId);

    if (!session) {
      session = createSession();
      this.store.sessions.unshift(session);
      this.store.activeSessionId = session.id;
    }

    return session;
  }

  private async persist(): Promise<void> {
    this.store = normalizeStore(this.store);
    await this.storage.save(this.store);
  }
}

function createDefaultStore(): ChatStore {
  const session = createSession();

  return {
    version: CHAT_STORE_VERSION,
    activeSessionId: session.id,
    sessions: [session],
  };
}

function createSession(title = 'New chat'): ChatSession {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    title,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

function normalizeStore(store: ChatStore): ChatStore {
  if (store.sessions.length === 0) {
    return createDefaultStore();
  }

  const activeSessionExists = store.sessions.some((session) => session.id === store.activeSessionId);

  return {
    version: CHAT_STORE_VERSION,
    activeSessionId: activeSessionExists ? store.activeSessionId : store.sessions[0].id,
    sessions: store.sessions.map((session) => ({
      ...session,
      title: session.title?.trim() || 'New chat',
      createdAt: session.createdAt || new Date().toISOString(),
      updatedAt: session.updatedAt || session.createdAt || new Date().toISOString(),
      messages: session.messages ?? [],
    })),
  };
}

function createTitleFromMessage(message: string): string {
  const clean = message.trim().replace(/\s+/g, ' ');

  if (!clean) {
    return 'New chat';
  }

  return clean.length > 48 ? `${clean.slice(0, 48)}...` : clean;
}
