import * as vscode from 'vscode';

import { CHAT_VIEW_ID } from './constants';
import { createBridgeServer } from './server/bridge_server';
import { ChatViewProvider } from './webview/chat_view_provider';

export function activate(context: vscode.ExtensionContext) {
  const server = createBridgeServer();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(CHAT_VIEW_ID, new ChatViewProvider(context.extensionUri)),
  );

  context.subscriptions.push({
    dispose: () => {
      server.close();
    },
  });
}

export function deactivate() {}
