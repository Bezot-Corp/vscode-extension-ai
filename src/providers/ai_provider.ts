import { ChatContext } from '../context/chat_context';

export type ProviderStatus = {
  status: 'connected' | 'disconnected' | 'connecting';
  text: string;
  providerUrl: string;
};

export type ChatRequest = {
  message: string;
  context: ChatContext;
};

export type ChatResult = {
  text: string;
};

export interface AiProvider {
  health(): Promise<ProviderStatus>;
  chat(request: ChatRequest): Promise<ChatResult>;
}
