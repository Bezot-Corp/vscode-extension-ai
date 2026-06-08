import * as vscode from 'vscode';
import { CHAT_STORE_VERSION, ChatStore } from './chat_store';
import { ChatSession } from './chat_session';

const CHAT_FILE_NAME = 'chat.json';

export class ChatStorage {
  constructor(private readonly storageUri: vscode.Uri) {}

  async load(): Promise<ChatStore | undefined> {
    const fileUri = vscode.Uri.joinPath(this.storageUri, CHAT_FILE_NAME);

    try {
      const bytes = await vscode.workspace.fs.readFile(fileUri);
      const content = Buffer.from(bytes).toString('utf8');
      const parsed = JSON.parse(content) as unknown;

      return migrateChatData(parsed);
    } catch {
      return undefined;
    }
  }

  async save(store: ChatStore): Promise<void> {
    await vscode.workspace.fs.createDirectory(this.storageUri);

    const fileUri = vscode.Uri.joinPath(this.storageUri, CHAT_FILE_NAME);
    const content = JSON.stringify(store, null, 2);
    const bytes = Buffer.from(content, 'utf8');

    await vscode.workspace.fs.writeFile(fileUri, bytes);
  }
}

function migrateChatData(data: unknown): ChatStore | undefined {
  if (isChatStore(data)) {
    return data;
  }

  if (isLegacyChatSession(data)) {
    const now = new Date().toISOString();

    const migratedSession: ChatSession = {
      id: data.id,
      title: createTitleFromMessages(data.messages),
      createdAt: data.messages[0]?.createdAt ?? now,
      updatedAt: data.messages[data.messages.length - 1]?.createdAt ?? now,
      messages: data.messages,
    };

    return {
      version: CHAT_STORE_VERSION,
      activeSessionId: migratedSession.id,
      sessions: [migratedSession],
    };
  }

  return undefined;
}

function isChatStore(data: unknown): data is ChatStore {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const candidate = data as Partial<ChatStore>;

  return (
    candidate.version === CHAT_STORE_VERSION &&
    typeof candidate.activeSessionId === 'string' &&
    Array.isArray(candidate.sessions)
  );
}

function isLegacyChatSession(data: unknown): data is Pick<ChatSession, 'id' | 'messages'> {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const candidate = data as Partial<ChatSession>;

  return typeof candidate.id === 'string' && Array.isArray(candidate.messages);
}

function createTitleFromMessages(messages: ChatSession['messages']): string {
  const firstUserMessage = messages.find((message) => message.role === 'user')?.content.trim();

  if (!firstUserMessage) {
    return 'New chat';
  }

  return firstUserMessage.length > 48 ? `${firstUserMessage.slice(0, 48)}...` : firstUserMessage;
}
