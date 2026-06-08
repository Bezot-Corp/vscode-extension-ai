import * as vscode from 'vscode';

import { ChatManager } from '../chat/chat_manager';
import { ChatStorage } from '../chat/chat_storage';
import { ModelManager } from '../models/model_manager';
import { PatchPreview } from '../patch/patch_preview';
import { getChatHtml } from './html/chat_html';
import { ContextOptions } from './context_options';
import { WebviewMessage } from '.';
import { sendChatStore } from './chat_store_presenter';
import { sendModelState, testConnection } from './model_state_presenter';
import { sendContextPreview } from './context_preview_presenter';
import { acceptPatch, detectAndSendPatchPreviews, rejectPatch } from './patch_preview_controller';
import { GenerationController } from './generation_controller';
import { getContextOptions } from './context_options_mapper';

export class ChatViewProvider implements vscode.WebviewViewProvider {
  private readonly chatManager: ChatManager;
  private readonly modelManager = new ModelManager();
  private readonly patchPreviews = new Map<string, PatchPreview>();
  private readonly generationController: GenerationController;

  constructor(
    private readonly extensionUri: vscode.Uri,
    storageUri: vscode.Uri,
  ) {
    this.chatManager = new ChatManager(new ChatStorage(storageUri));
    this.generationController = new GenerationController(this.chatManager, this.patchPreviews);
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
        await sendContextPreview(webviewView, getContextOptions(message));
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
        this.generationController.stopGeneration();
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
        const contextOptions = getContextOptions(message);

        await sendContextPreview(webviewView, contextOptions);
        await this.generationController.sendChatMessage(webviewView, message.text ?? '', contextOptions);
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
}
