import * as vscode from 'vscode';

export type AiProviderKind = 'ollama' | 'customBackend' | 'bezotcorp';
export type ContextMode = 'basic' | 'rich';

export type ExtensionConfig = {
  provider: AiProviderKind;
  providerUrl: string;
  model: string;
  contextMode: ContextMode;
};

export function getExtensionConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration('bezotcorpAi');

  return {
    provider: config.get<AiProviderKind>('provider', 'ollama'),
    providerUrl: config.get<string>('providerUrl', 'http://127.0.0.1:11434').replace(/\/$/, ''),
    model: config.get<string>('model', 'qwen2.5-coder:7b'),
    contextMode: config.get<ContextMode>('contextMode', 'basic'),
  };
}
