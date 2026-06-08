import * as vscode from 'vscode';

import { ChatMessage } from './chat_message';
import { ChatSession, createChatSessionFromLegacy } from './chat_session';
import { CHAT_STORE_VERSION, ChatStore, normalizeChatStore } from './chat_store';

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
    } catch (error) {
      console.error(`Failed to load chat storage: ${error}`);
      return undefined;
    }
  }

  async save(store: ChatStore): Promise<void> {
    await vscode.workspace.fs.createDirectory(this.storageUri);

    const fileUri = vscode.Uri.joinPath(this.storageUri, CHAT_FILE_NAME);
    const content = JSON.stringify(normalizeChatStore(store), null, 2);
    const bytes = Buffer.from(content, 'utf8');

    try {
      await vscode.workspace.fs.writeFile(fileUri, bytes);
    } catch (error) {
      console.error(`Failed to save chat storage: ${error}`);
    }
  }
}

function migrateChatData(data: unknown): ChatStore | undefined {
  if (isChatStore(data)) {
    return normalizeChatStore(data);
  }

  if (isLegacyChatSession(data)) {
    const migratedSession = createChatSessionFromLegacy(data.id, data.messages);

    return {
      version: CHAT_STORE_VERSION,
      activeSessionId: migratedSession.id,
      sessions: [migratedSession],
    };
  }

  console.warn('Unknown chat data format');
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

function isLegacyChatSession(data: unknown): data is { id: string; messages: ChatMessage[] } {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const candidate = data as Partial<ChatSession>;

  return typeof candidate.id === 'string' && Array.isArray(candidate.messages);
}
