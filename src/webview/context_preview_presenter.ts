import * as vscode from 'vscode';

import { getExtensionConfig } from '../config/extension_config';
import { buildChatContext } from '../context/context_builder';
import { ContextOptions } from './context_options';

export async function sendContextPreview(
  webviewView: vscode.WebviewView,
  contextOptions: ContextOptions,
): Promise<void> {
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
