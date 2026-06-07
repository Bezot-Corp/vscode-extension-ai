import * as vscode from 'vscode';

import { ContextMode } from '../config/extension_config';
import { ChatContext, ContextFile } from './chat_context';

const MAX_FILE_CHARS = 40_000;
const MAX_OPEN_FILES = 8;

export type ContextBuildOptions = {
  includeActiveFile: boolean;
};

export async function buildChatContext(mode: ContextMode, options: ContextBuildOptions): Promise<ChatContext> {
  const activeFile = options.includeActiveFile ? getActiveFile() : undefined;

  if (mode === 'basic') {
    return {
      mode,
      activeFile,
      openFiles: [],
    };
  }

  return {
    mode,
    activeFile,
    openFiles: getOpenFiles(activeFile?.path),
  };
}

function getActiveFile(): ContextFile | undefined {
  const editor = vscode.window.activeTextEditor;

  if (!editor || editor.document.isUntitled || editor.document.uri.scheme !== 'file') {
    return undefined;
  }

  return documentToContextFile(editor.document);
}

function getOpenFiles(activeFilePath?: string): ContextFile[] {
  return vscode.workspace.textDocuments
    .filter((document) => !document.isUntitled && document.uri.scheme === 'file')
    .filter((document) => document.uri.fsPath !== activeFilePath)
    .slice(0, MAX_OPEN_FILES)
    .map(documentToContextFile);
}

function documentToContextFile(document: vscode.TextDocument): ContextFile {
  const content = document.getText();

  return {
    path: document.uri.fsPath,
    languageId: document.languageId,
    content: truncateContent(content),
  };
}

function truncateContent(content: string): string {
  if (content.length <= MAX_FILE_CHARS) {
    return content;
  }

  return `${content.slice(0, MAX_FILE_CHARS)}\n\n/* Content truncated by BezotCorp AI */`;
}
