import * as vscode from 'vscode';

import { ChatManager } from '../chat/chat_manager';
import { ChatStorage } from '../chat/chat_storage';
import { getExtensionConfig } from '../config/extension_config';
import { buildChatContext } from '../context/context_builder';
import { ModelManager } from '../models/model_manager';
import { applyPatchCandidate } from '../patch/patch_applier';
import { detectPatchPreviews } from '../patch/patch_detector';
import { PatchPreview } from '../patch/patch_preview';
import { createProvider } from '../providers/provider_factory';
import { getChatHtml } from './html/chat_html';

type WebviewMessage = {
  type: string;
  text?: string;
  patchId?: string;
  sessionId?: string;
  title?: string;
  model?: string;
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
        await this.testConnection(webviewView);
        await this.sendModelState(webviewView);
        return;
      }

      if (message.type === 'refreshModels') {
        await this.sendModelState(webviewView);
        return;
      }

      if (message.type === 'changeModel') {
        if (message.model) {
          await this.modelManager.setActiveModel(message.model);
          await this.sendModelState(webviewView);
        }

        return;
      }

      if (message.type === 'refreshContextPreview') {
        await this.sendContextPreview(webviewView, this.getContextOptions(message));
        return;
      }

      if (message.type === 'newChat') {
        await this.chatManager.createSession();
        this.patchPreviews.clear();

        this.sendChatStore(webviewView);
        webviewView.webview.postMessage({ type: 'patchPreviews', previews: [] });
        return;
      }

      if (message.type === 'switchChatSession') {
        if (message.sessionId) {
          await this.chatManager.setActiveSession(message.sessionId);
          this.patchPreviews.clear();

          this.sendChatStore(webviewView);
          webviewView.webview.postMessage({ type: 'patchPreviews', previews: [] });
        }

        return;
      }

      if (message.type === 'renameChatSession') {
        if (message.sessionId && message.title) {
          await this.chatManager.renameSession(message.sessionId, message.title);
          this.sendChatStore(webviewView);
        }

        return;
      }

      if (message.type === 'deleteChatSession') {
        if (message.sessionId) {
          await this.chatManager.deleteSession(message.sessionId);
          this.patchPreviews.clear();

          this.sendChatStore(webviewView);
          webviewView.webview.postMessage({ type: 'patchPreviews', previews: [] });
        }

        return;
      }

      if (message.type === 'clearHistory') {
        await this.chatManager.clearActiveSession();
        this.patchPreviews.clear();

        this.sendChatStore(webviewView);
        webviewView.webview.postMessage({ type: 'patchPreviews', previews: [] });
        return;
      }

      if (message.type === 'stopGeneration') {
        this.stopGeneration();
        return;
      }

      if (message.type === 'acceptPatch') {
        await this.acceptPatch(webviewView, message.patchId);
        return;
      }

      if (message.type === 'rejectPatch') {
        this.rejectPatch(webviewView, message.patchId);
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

    this.sendChatStore(webviewView);

    await this.testConnection(webviewView);
    await this.sendModelState(webviewView);

    await this.sendContextPreview(webviewView, {
      includeActiveFile: true,
      includeOpenFiles: false,
      includeSelectedText: true,
      includeWorkspaceTree: false,
    });
  }

  private sendChatStore(webviewView: vscode.WebviewView): void {
    const store = this.chatManager.getStore();
    const activeSession = this.chatManager.getActiveSession();

    webviewView.webview.postMessage({
      type: 'chatStoreRestored',
      activeSessionId: store.activeSessionId,
      sessions: store.sessions.map((session) => ({
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messageCount: session.messages.length,
      })),
      messages: activeSession.messages,
    });
  }

  private async sendModelState(webviewView: vscode.WebviewView): Promise<void> {
    const state = await this.modelManager.getState();

    webviewView.webview.postMessage({
      type: 'modelState',
      ...state,
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
      this.sendChatStore(webviewView);

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
        this.sendChatStore(webviewView);
        this.detectAndSendPatchPreviews(webviewView, assistantText);
      }
    } catch (error) {
      if (abortController.signal.aborted) {
        if (assistantText.trim()) {
          await this.chatManager.addMessage('assistant', assistantText);
          this.sendChatStore(webviewView);
          this.detectAndSendPatchPreviews(webviewView, assistantText);
        }

        webviewView.webview.postMessage({
          type: 'responseStopped',
        });
        return;
      }

      const errorText = `Error: ${String(error)}`;

      await this.chatManager.addMessage('assistant', errorText);
      this.sendChatStore(webviewView);

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

  private detectAndSendPatchPreviews(webviewView: vscode.WebviewView, assistantText: string): void {
    const patchPreviews = detectPatchPreviews(assistantText);

    if (patchPreviews.length === 0) {
      return;
    }

    for (const preview of patchPreviews) {
      this.patchPreviews.set(preview.candidate.id, preview);
    }

    webviewView.webview.postMessage({
      type: 'patchPreviews',
      previews: patchPreviews,
    });
  }

  private async acceptPatch(webviewView: vscode.WebviewView, patchId: string | undefined): Promise<void> {
    if (!patchId) {
      return;
    }

    const preview = this.patchPreviews.get(patchId);

    if (!preview || preview.status !== 'pending') {
      return;
    }

    const result = await applyPatchCandidate(preview.candidate);

    if (!result.success) {
      webviewView.webview.postMessage({
        type: 'patchStatus',
        patchId,
        status: 'pending',
        error: result.error ?? 'Failed to apply patch.',
      });
      return;
    }

    preview.status = 'accepted';
    this.patchPreviews.set(patchId, preview);

    webviewView.webview.postMessage({
      type: 'patchStatus',
      patchId,
      status: 'accepted',
    });
  }

  private rejectPatch(webviewView: vscode.WebviewView, patchId: string | undefined): void {
    if (!patchId) {
      return;
    }

    const preview = this.patchPreviews.get(patchId);

    if (!preview || preview.status !== 'pending') {
      return;
    }

    preview.status = 'rejected';
    this.patchPreviews.set(patchId, preview);

    webviewView.webview.postMessage({
      type: 'patchStatus',
      patchId,
      status: 'rejected',
    });
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
