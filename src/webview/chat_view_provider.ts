import * as vscode from 'vscode';

import { getChatHtml } from './chat_html';

type WebviewMessage = {
  type: string;
  text?: string;
};

type ChatResponse = {
  content?: string;
  error?: string;
};

export class ChatViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = getChatHtml();

    webviewView.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
      if (message.type === 'openSettings') {
        await vscode.commands.executeCommand('workbench.action.openSettings', '@ext:bezotcorp.bezotcorp-ai');
        return;
      }

      if (message.type !== 'chat') {
        return;
      }

      const config = vscode.workspace.getConfiguration('bezotcorpAi');
      const backendMode = config.get<string>('backendMode', 'custom');
      const backendUrl = config.get<string>('backendUrl', 'http://127.0.0.1:4188');

      if (backendMode === 'bezotcorp') {
        webviewView.webview.postMessage({
          type: 'response',
          text: 'BezotCorp hosted backend is not available yet. Please use a custom backend for now.',
        });
        return;
      }

      try {
        const response = await fetch(`${backendUrl.replace(/\/$/, '')}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message.text ?? '' }),
        });

        const data = (await response.json()) as ChatResponse;

        webviewView.webview.postMessage({
          type: 'response',
          text: data.content ?? data.error ?? 'no response',
        });
      } catch (error) {
        webviewView.webview.postMessage({
          type: 'response',
          text: `Error: ${String(error)}`,
        });
      }
    });
  }
}
