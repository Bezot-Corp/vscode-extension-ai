import { randomUUID } from 'node:crypto';

import { ChatMessage, ChatRole } from './chat_message';
import { ChatSession } from './chat_session';
import { ChatStorage } from './chat_storage';

export class ChatManager {
  private session: ChatSession = {
    id: randomUUID(),
    messages: [],
  };

  constructor(private readonly storage: ChatStorage) {}

  async load(): Promise<void> {
    const storedSession = await this.storage.load();

    if (storedSession) {
      this.session = storedSession;
    }
  }

  getMessages(): ChatMessage[] {
    return [...this.session.messages];
  }

  async addMessage(role: ChatRole, content: string): Promise<void> {
    this.session.messages.push({
      role,
      content,
      createdAt: new Date().toISOString(),
    });

    await this.storage.save(this.session);
  }

  async clear(): Promise<void> {
    this.session = {
      id: randomUUID(),
      messages: [],
    };

    await this.storage.save(this.session);
  }
}
