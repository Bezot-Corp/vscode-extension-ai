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
    providerUrl: normalizeProviderUrl(config.get<string>('providerUrl', DEFAULT_PROVIDER_URL)),
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

export async function updateExtensionProvider(provider: AiProviderKind): Promise<void> {
  await vscode.workspace
    .getConfiguration('bezotcorpAi')
    .update('provider', provider, vscode.ConfigurationTarget.Global);
}

export async function updateExtensionProviderUrl(providerUrl: string): Promise<void> {
  const cleanProviderUrl = normalizeProviderUrl(providerUrl);

  if (!cleanProviderUrl) {
    return;
  }

  await vscode.workspace
    .getConfiguration('bezotcorpAi')
    .update('providerUrl', cleanProviderUrl, vscode.ConfigurationTarget.Global);
}

export async function updateExtensionProviderSettings(provider: AiProviderKind, providerUrl: string): Promise<void> {
  await updateExtensionProvider(provider);
  await updateExtensionProviderUrl(providerUrl);
}

function normalizeProviderUrl(providerUrl: string): string {
  return providerUrl.trim().replace(/\/$/, '');
}
