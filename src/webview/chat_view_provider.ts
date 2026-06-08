import * as vscode from 'vscode';

import { ChatManager } from '../chat/chat_manager';
import { ChatStorage } from '../chat/chat_storage';
import { getExtensionConfig } from '../config/extension_config';
import { buildChatContext } from '../context/context_builder';
import { createProvider } from '../providers/provider_factory';
import { getChatHtml } from './chat_html';

type WebviewMessage = {
  type: string;
  text?: string;
  includeActiveFile?: boolean;
  includeOpenFiles?: boolean;
  includeSelectedText?: boolean;
  includeWorkspaceTree?: boolean;
};

type ContextOptions = {
  includeActiveFile: boolean;
  includeOpenFiles: boolean;
  includeSelectedText: boolean;
  includeWorkspaceTree: boolean;
};

export class ChatViewProvider implements vscode.WebviewViewProvider {
  private readonly chatManager: ChatManager;
  private currentAbortController: AbortController | undefined;

  constructor(
    private readonly extensionUri: vscode.Uri,
    storageUri: vscode.Uri,
  ) {
    this.chatManager = new ChatManager(new ChatStorage(storageUri));
  }

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

      if (message.type === 'clearHistory') {
        await this.chatManager.clear();
        webviewView.webview.postMessage({ type: 'historyRestored', messages: [] });
        return;
      }

      if (message.type === 'stopGeneration') {
        this.stopGeneration();
        return;
      }

      if (message.type === 'chat') {
        const contextOptions = this.getContextOptions(message);

        await this.sendContextPreview(webviewView, contextOptions);
        await this.sendChatMessage(webviewView, message.text ?? '', contextOptions);
      }
    });

    void this.initialize(webviewView);
  }

  private async initialize(webviewView: vscode.WebviewView): Promise<void> {
    await this.chatManager.load();

    webviewView.webview.postMessage({
      type: 'historyRestored',
      messages: this.chatManager.getMessages(),
    });

    await this.testConnection(webviewView);

    await this.sendContextPreview(webviewView, {
      includeActiveFile: true,
      includeOpenFiles: false,
      includeSelectedText: true,
      includeWorkspaceTree: false,
    });
  }

  private getContextOptions(message: WebviewMessage): ContextOptions {
    return {
      includeActiveFile: message.includeActiveFile ?? true,
      includeOpenFiles: message.includeOpenFiles ?? false,
      includeSelectedText: message.includeSelectedText ?? true,
      includeWorkspaceTree: message.includeWorkspaceTree ?? false,
    };
  }

  private stopGeneration(): void {
    this.currentAbortController?.abort();
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
    const abortController = new AbortController();

    this.currentAbortController?.abort();
    this.currentAbortController = abortController;

    let assistantText = '';

    try {
      const context = await buildChatContext(config.contextMode, contextOptions);

      webviewView.webview.postMessage({
        type: 'contextStatus',
        activeFilePath: context.activeFile?.path,
      });

      await this.chatManager.addMessage('user', text);

      await provider.streamChat(
        {
          message: text,
          context,
        },
        {
          onStart: () => {
            webviewView.webview.postMessage({
              type: 'responseStart',
            });
          },
          onChunk: (chunk: string) => {
            assistantText += chunk;

            webviewView.webview.postMessage({
              type: 'responseChunk',
              text: chunk,
            });
          },
          onEnd: () => {
            webviewView.webview.postMessage({
              type: 'responseEnd',
            });
          },
        },
        abortController.signal,
      );

      if (assistantText.trim()) {
        await this.chatManager.addMessage('assistant', assistantText);
      }
    } catch (error) {
      if (abortController.signal.aborted) {
        if (assistantText.trim()) {
          await this.chatManager.addMessage('assistant', assistantText);
        }

        webviewView.webview.postMessage({
          type: 'responseStopped',
        });
        return;
      }

      const errorText = `Error: ${String(error)}`;

      await this.chatManager.addMessage('assistant', errorText);

      webviewView.webview.postMessage({
        type: 'response',
        text: errorText,
      });

      webviewView.webview.postMessage({
        type: 'backendStatus',
        status: 'disconnected',
        backendUrl: config.providerUrl,
        text: `Disconnected: ${String(error)}`,
      });
    } finally {
      if (this.currentAbortController === abortController) {
        this.currentAbortController = undefined;
      }
    }
  }

  private async sendContextPreview(webviewView: vscode.WebviewView, contextOptions: ContextOptions): Promise<void> {
    const config = getExtensionConfig();
    const context = await buildChatContext(config.contextMode, contextOptions);

    webviewView.webview.postMessage({
      type: 'contextPreview',
      mode: config.contextMode,
      activeFilePath: context.activeFile?.path,
      selectedTextLength: context.selectedText?.text.length ?? 0,
      openFilesCount: context.openFiles.length,
      workspaceFilesCount: context.workspaceFiles.length,
    });
  }
}
