import * as vscode from 'vscode';

import { getExtensionConfig } from '../config/extension_config';
import { buildChatContext } from '../context/context_builder';
import { createProvider } from '../providers/provider_factory';
import { getChatHtml } from './chat_html';

type WebviewMessage = {
  type: string;
  text?: string;
  includeActiveFile?: boolean;
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
        await this.testConnection(webviewView);
        return;
      }

      if (message.type === 'refreshContextPreview') {
        await this.sendContextPreview(webviewView, message.includeActiveFile ?? true);
        return;
      }

      if (message.type === 'chat') {
        const includeActiveFile = message.includeActiveFile ?? true;

        await this.sendContextPreview(webviewView, includeActiveFile);
        await this.sendChatMessage(webviewView, message.text ?? '', includeActiveFile);
      }
    });

    void this.testConnection(webviewView);
    void this.sendContextPreview(webviewView, true);
  }

  private async testConnection(webviewView: vscode.WebviewView): Promise<void> {
    const config = getExtensionConfig();

    webviewView.webview.postMessage({
      type: 'backendStatus',
      status: 'connecting',
      backendUrl: config.providerUrl,
      text: `Connecting to ${config.provider}...`,
    });

    const provider = createProvider(config);
    const status = await provider.health();

    webviewView.webview.postMessage({
      type: 'backendStatus',
      status: status.status,
      backendUrl: status.providerUrl,
      text: status.text,
    });
  }

  private async sendChatMessage(
    webviewView: vscode.WebviewView,
    text: string,
    includeActiveFile: boolean,
  ): Promise<void> {
    const config = getExtensionConfig();
    const provider = createProvider(config);

    try {
      const context = await buildChatContext(config.contextMode, {
        includeActiveFile,
      });

      webviewView.webview.postMessage({
        type: 'contextStatus',
        activeFilePath: context.activeFile?.path,
      });

      const result = await provider.chat({ message: text, context });

      webviewView.webview.postMessage({
        type: 'response',
        text: result.text,
      });
    } catch (error) {
      webviewView.webview.postMessage({
        type: 'response',
        text: `Error: ${String(error)}`,
      });

      webviewView.webview.postMessage({
        type: 'backendStatus',
        status: 'disconnected',
        backendUrl: config.providerUrl,
        text: `Disconnected: ${String(error)}`,
      });
    }
  }

  private async sendContextPreview(webviewView: vscode.WebviewView, includeActiveFile: boolean): Promise<void> {
    const config = getExtensionConfig();

    const context = await buildChatContext(config.contextMode, {
      includeActiveFile,
    });

    webviewView.webview.postMessage({
      type: 'contextPreview',
      mode: config.contextMode,
      activeFilePath: context.activeFile?.path,
      openFilesCount: context.openFiles.length,
    });
  }
}
