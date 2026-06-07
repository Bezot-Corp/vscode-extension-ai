import * as vscode from 'vscode';

import { CHAT_VIEW_ID, OPEN_CHAT_COMMAND, OPEN_SETTINGS_COMMAND } from './constants';
import { createBridgeServer } from './server/bridge_server';
import { ChatViewProvider } from './webview/chat_view_provider';

export function activate(context: vscode.ExtensionContext) {
  const server = createBridgeServer();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(CHAT_VIEW_ID, new ChatViewProvider(context.extensionUri)),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(OPEN_CHAT_COMMAND, async () => {
      await vscode.commands.executeCommand('workbench.view.extension.bezotcorp-ai');
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(OPEN_SETTINGS_COMMAND, async () => {
      await vscode.commands.executeCommand('workbench.action.openSettings', '@ext:bezotcorp.bezotcorp-ai');
    }),
  );

  context.subscriptions.push({
    dispose: () => {
      server.close();
    },
  });
}

export function deactivate() {}
