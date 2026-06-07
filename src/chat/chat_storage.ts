import * as vscode from 'vscode';

import { ChatSession } from './chat_session';

const CHAT_FILE_NAME = 'chat.json';

export class ChatStorage {
  constructor(private readonly storageUri: vscode.Uri) {}

  async load(): Promise<ChatSession | undefined> {
    const fileUri = vscode.Uri.joinPath(this.storageUri, CHAT_FILE_NAME);

    try {
      const bytes = await vscode.workspace.fs.readFile(fileUri);
      const content = Buffer.from(bytes).toString('utf8');

      return JSON.parse(content) as ChatSession;
    } catch {
      return undefined;
    }
  }

  async save(session: ChatSession): Promise<void> {
    await vscode.workspace.fs.createDirectory(this.storageUri);

    const fileUri = vscode.Uri.joinPath(this.storageUri, CHAT_FILE_NAME);
    const content = JSON.stringify(session, null, 2);
    const bytes = Buffer.from(content, 'utf8');

    await vscode.workspace.fs.writeFile(fileUri, bytes);
  }
}
