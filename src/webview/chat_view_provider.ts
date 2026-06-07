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

      if (message.type === 'testConnection') {
        await this.testBackendConnection(webviewView);
        return;
      }

      if (message.type === 'chat') {
        await this.sendChatMessage(webviewView, message.text ?? '');
      }
    });

    void this.testBackendConnection(webviewView);
  }

  private getBackendConfig(): { backendMode: string; backendUrl: string } {
    const config = vscode.workspace.getConfiguration('bezotcorpAi');

    return {
      backendMode: config.get<string>('backendMode', 'custom'),
      backendUrl: config.get<string>('backendUrl', 'http://127.0.0.1:4188').replace(/\/$/, ''),
    };
  }

  private async testBackendConnection(webviewView: vscode.WebviewView): Promise<void> {
    const { backendMode, backendUrl } = this.getBackendConfig();

    webviewView.webview.postMessage({
      type: 'backendStatus',
      status: 'connecting',
      backendUrl,
      text: 'Connecting...',
    });

    if (backendMode === 'bezotcorp') {
      webviewView.webview.postMessage({
        type: 'backendStatus',
        status: 'disconnected',
        backendUrl,
        text: 'BezotCorp hosted backend is not available yet.',
      });
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Backend returned HTTP ${response.status}`);
      }

      webviewView.webview.postMessage({
        type: 'backendStatus',
        status: 'connected',
        backendUrl,
        text: 'Connected',
      });
    } catch (error) {
      webviewView.webview.postMessage({
        type: 'backendStatus',
        status: 'disconnected',
        backendUrl,
        text: `Disconnected: ${String(error)}`,
      });
    }
  }

  private async sendChatMessage(webviewView: vscode.WebviewView, text: string): Promise<void> {
    const { backendMode, backendUrl } = this.getBackendConfig();

    if (backendMode === 'bezotcorp') {
      webviewView.webview.postMessage({
        type: 'response',
        text: 'BezotCorp hosted backend is not available yet. Please use a custom backend for now.',
      });
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
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

      webviewView.webview.postMessage({
        type: 'backendStatus',
        status: 'disconnected',
        backendUrl,
        text: `Disconnected: ${String(error)}`,
      });
    }
  }
}
