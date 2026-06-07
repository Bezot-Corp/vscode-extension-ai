import { ExtensionConfig } from '../config/extension_config';
import { AiProvider, ChatRequest, ChatResult, ChatStreamHandler, ProviderStatus } from './ai_provider';

type CustomBackendResponse = {
  content?: string;
  error?: string;
};

export class CustomBackendProvider implements AiProvider {
  constructor(private readonly config: ExtensionConfig) {}

  async health(): Promise<ProviderStatus> {
    try {
      const response = await fetch(`${this.config.providerUrl}/health`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return {
        status: 'connected',
        providerUrl: this.config.providerUrl,
        text: 'Connected',
      };
    } catch (error) {
      return {
        status: 'disconnected',
        providerUrl: this.config.providerUrl,
        text: `Disconnected: ${String(error)}`,
      };
    }
  }

  async chat(request: ChatRequest): Promise<ChatResult> {
    const response = await fetch(`${this.config.providerUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const data = (await response.json()) as CustomBackendResponse;

    return {
      text: data.content ?? data.error ?? 'no response',
    };
  }

  async streamChat(request: ChatRequest, handler: ChatStreamHandler): Promise<void> {
    handler.onStart();

    const result = await this.chat(request);

    handler.onChunk(result.text);
    handler.onEnd();
  }
}
