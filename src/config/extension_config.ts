import * as vscode from 'vscode';

export type AiProviderKind = 'ollama' | 'customBackend' | 'bezotcorp';
export type ContextMode = 'basic' | 'rich';

export const DEFAULT_PROVIDER: AiProviderKind = 'ollama';
export const DEFAULT_PROVIDER_URL = 'http://127.0.0.1:11434';
export const DEFAULT_MODEL = 'qwen2.5-coder:7b';
export const DEFAULT_CONTEXT_MODE: ContextMode = 'basic';

export type ExtensionConfig = {
  provider: AiProviderKind;
  providerUrl: string;
  model: string;
  contextMode: ContextMode;
};

export function getExtensionConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration('bezotcorpAi');

  return {
    provider: config.get<AiProviderKind>('provider', DEFAULT_PROVIDER),
    providerUrl: config.get<string>('providerUrl', DEFAULT_PROVIDER_URL).replace(/\/$/, ''),
    model: config.get<string>('model', DEFAULT_MODEL),
    contextMode: config.get<ContextMode>('contextMode', DEFAULT_CONTEXT_MODE),
  };
}

export async function updateExtensionModel(model: string): Promise<void> {
  const cleanModel = model.trim();

  if (!cleanModel) {
    return;
  }

  await vscode.workspace.getConfiguration('bezotcorpAi').update('model', cleanModel, vscode.ConfigurationTarget.Global);
}
