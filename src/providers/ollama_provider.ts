import { ExtensionConfig } from '../config/extension_config';
import { ChatContext, ContextFile } from '../context/chat_context';
import { AiProvider, ChatRequest, ChatResult, ProviderStatus } from './ai_provider';

type OllamaResponse = {
  message?: {
    content?: string;
  };
  error?: string;
};

export class OllamaProvider implements AiProvider {
  constructor(private readonly config: ExtensionConfig) {}

  async health(): Promise<ProviderStatus> {
    try {
      const response = await fetch(`${this.config.providerUrl}/api/tags`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return {
        status: 'connected',
        providerUrl: this.config.providerUrl,
        text: 'Connected to Ollama',
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
    const response = await fetch(`${this.config.providerUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        stream: false,
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(request.context),
          },
          {
            role: 'user',
            content: request.message,
          },
        ],
      }),
    });

    const data = (await response.json()) as OllamaResponse;

    return {
      text: data.message?.content ?? data.error ?? 'no response',
    };
  }
}

function buildSystemPrompt(context: ChatContext): string {
  const parts = [
    'You are BezotCorp AI, a coding assistant inside VS Code.',
    'Answer clearly and focus on practical code help.',
  ];

  if (context.activeFile) {
    parts.push(formatFile('Active file', context.activeFile));
  }

  if (context.openFiles.length > 0) {
    parts.push('Open files:', ...context.openFiles.map((file) => formatFile('Open file', file)));
  }

  return parts.join('\n\n');
}

function formatFile(label: string, file: ContextFile): string {
  return `${label}: ${file.path}
Language: ${file.languageId}

\`\`\`${file.languageId}
${file.content}
\`\`\``;
}
