import * as vscode from 'vscode';

import { ChatManager } from '../chat/chat_manager';
import { ChatStorage } from '../chat/chat_storage';
import { buildChatContext } from '../context/context_builder';
import { ModelManager } from '../models/model_manager';
import { PatchPreview } from '../patch/patch_preview';
import { getChatHtml } from './html/chat_html';
import { ContextOptions } from './context_options';
import { WebviewMessage } from '.';
import { sendChatStore } from './chat_store_presenter';
import { sendModelState, testConnection } from './model_state_presenter';
import { getExtensionConfig } from '../config/extension_config';
import { createProvider } from '../providers/provider_factory';
import { sendContextPreview } from './context_preview_presenter';
import { acceptPatch, detectAndSendPatchPreviews, rejectPatch } from './patch_preview_controller';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  private readonly chatManager: ChatManager;
  private readonly modelManager = new ModelManager();
  private readonly patchPreviews = new Map<string, PatchPreview>();
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
        await testConnection(webviewView);
        await sendModelState(webviewView, this.modelManager);
        return;
      }

      if (message.type === 'refreshModels') {
        await sendModelState(webviewView, this.modelManager);
        return;
      }

      if (message.type === 'updateProviderSettings') {
        if (message.provider && message.providerUrl) {
          await this.modelManager.updateProviderSettings(message.provider, message.providerUrl);
          await testConnection(webviewView);
          await sendModelState(webviewView, this.modelManager);
        }

        return;
      }

      if (message.type === 'changeModel') {
        if (message.model) {
          await this.modelManager.setActiveModel(message.model);
          await sendModelState(webviewView, this.modelManager);
        }

        return;
      }

      if (message.type === 'refreshContextPreview') {
        await sendContextPreview(webviewView, this.getContextOptions(message));
        return;
      }

      if (message.type === 'newChat') {
        await this.chatManager.createSession();
        this.patchPreviews.clear();

        sendChatStore(webviewView, this.chatManager);
        webviewView.webview.postMessage({ type: 'patchPreviews', previews: [] });
        return;
      }

      if (message.type === 'switchChatSession') {
        if (message.sessionId) {
          await this.chatManager.setActiveSession(message.sessionId);
          this.patchPreviews.clear();

          sendChatStore(webviewView, this.chatManager);
          webviewView.webview.postMessage({ type: 'patchPreviews', previews: [] });
        }

        return;
      }

      if (message.type === 'renameChatSession') {
        if (message.sessionId && message.title) {
          await this.chatManager.renameSession(message.sessionId, message.title);
          sendChatStore(webviewView, this.chatManager);
        }

        return;
      }

      if (message.type === 'deleteChatSession') {
        if (message.sessionId) {
          await this.chatManager.deleteSession(message.sessionId);
          this.patchPreviews.clear();

          sendChatStore(webviewView, this.chatManager);
          webviewView.webview.postMessage({ type: 'patchPreviews', previews: [] });
        }

        return;
      }

      if (message.type === 'clearHistory') {
        await this.chatManager.clearActiveSession();
        this.patchPreviews.clear();

        sendChatStore(webviewView, this.chatManager);
        webviewView.webview.postMessage({ type: 'patchPreviews', previews: [] });
        return;
      }

      if (message.type === 'stopGeneration') {
        this.stopGeneration();
        return;
      }

      if (message.type === 'acceptPatch') {
        await acceptPatch(webviewView, this.patchPreviews, message.patchId);
        return;
      }

      if (message.type === 'rejectPatch') {
        rejectPatch(webviewView, this.patchPreviews, message.patchId);
        return;
      }

      if (message.type === 'chat') {
        const contextOptions = this.getContextOptions(message);

        await sendContextPreview(webviewView, contextOptions);
        await this.sendChatMessage(webviewView, message.text ?? '', contextOptions);
      }
    });

    void this.initialize(webviewView);
  }

  private async initialize(webviewView: vscode.WebviewView): Promise<void> {
    await this.chatManager.load();

    sendChatStore(webviewView, this.chatManager);

    await testConnection(webviewView);
    await sendModelState(webviewView, this.modelManager);

    await sendContextPreview(webviewView, {
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
      sendChatStore(webviewView, this.chatManager);

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
        sendChatStore(webviewView, this.chatManager);
        detectAndSendPatchPreviews(webviewView, this.patchPreviews, assistantText);
      }
    } catch (error) {
      if (abortController.signal.aborted) {
        if (assistantText.trim()) {
          await this.chatManager.addMessage('assistant', assistantText);
          sendChatStore(webviewView, this.chatManager);
          detectAndSendPatchPreviews(webviewView, this.patchPreviews, assistantText);
        }

        webviewView.webview.postMessage({
          type: 'responseStopped',
        });
        return;
      }

      const errorText = `Error: ${String(error)}`;

      await this.chatManager.addMessage('assistant', errorText);
      sendChatStore(webviewView, this.chatManager);

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
}
