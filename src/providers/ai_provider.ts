import { ChatContext } from '../context/chat_context';
import { ProviderStatus } from './provider_status';

export type ChatRequest = {
  message: string;
  context: ChatContext;
};

export type ChatResult = {
  text: string;
};

export type ChatStreamHandler = {
  onStart(): void;
  onChunk(chunk: string): void;
  onEnd(): void;
};

export interface AiProvider {
  health(): Promise<ProviderStatus>;
  chat(request: ChatRequest): Promise<ChatResult>;
  streamChat(request: ChatRequest, handler: ChatStreamHandler, signal?: AbortSignal): Promise<void>;
}
