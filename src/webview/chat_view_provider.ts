import * as vscode from 'vscode';

import { getExtensionConfig } from '../config/extension_config';
import { buildChatContext } from '../context/context_builder';
import { createProvider } from '../providers/provider_factory';
import { getChatHtml } from './chat_html';

type WebviewMessage = {
  type: string;
  text?: string;
  includeActiveFile?: boolean;
  includeOpenFiles?: boolean;
};

type ContextOptions = {
  includeActiveFile: boolean;
  includeOpenFiles: boolean;
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
        await this.sendContextPreview(webviewView, this.getContextOptions(message));
        return;
      }

      if (message.type === 'chat') {
        const contextOptions = this.getContextOptions(message);

        await this.sendContextPreview(webviewView, contextOptions);
        await this.sendChatMessage(webviewView, message.text ?? '', contextOptions);
      }
    });

    void this.testConnection(webviewView);
    void this.sendContextPreview(webviewView, {
      includeActiveFile: true,
      includeOpenFiles: false,
    });
  }

  private getContextOptions(message: WebviewMessage): ContextOptions {
    return {
      includeActiveFile: message.includeActiveFile ?? true,
      includeOpenFiles: message.includeOpenFiles ?? false,
    };
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
    contextOptions: ContextOptions,
  ): Promise<void> {
    const config = getExtensionConfig();
    const provider = createProvider(config);

    try {
      const context = await buildChatContext(config.contextMode, contextOptions);

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

  private async sendContextPreview(webviewView: vscode.WebviewView, contextOptions: ContextOptions): Promise<void> {
    const config = getExtensionConfig();
    const context = await buildChatContext(config.contextMode, contextOptions);

    webviewView.webview.postMessage({
      type: 'contextPreview',
      mode: config.contextMode,
      activeFilePath: context.activeFile?.path,
      openFilesCount: context.openFiles.length,
    });
  }
}
