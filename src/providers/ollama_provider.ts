import { ExtensionConfig } from '../config/extension_config';
import { ContextFile, ContextSelection } from '../context';
import { ChatContext } from '../context/chat_context';
import { AiProvider, ChatRequest, ChatResult, ChatStreamHandler } from './ai_provider';
import { ProviderStatus } from './provider_status';

type OllamaResponse = {
  message?: {
    content?: string;
  };
  error?: string;
};

type OllamaStreamResponse = {
  message?: {
    content?: string;
  };
  error?: string;
  done?: boolean;
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
        messages: buildMessages(request),
      }),
    });

    const data = (await response.json()) as OllamaResponse;

    return {
      text: data.message?.content ?? data.error ?? 'no response',
    };
  }

  async streamChat(request: ChatRequest, handler: ChatStreamHandler, signal?: AbortSignal): Promise<void> {
    const response = await fetch(`${this.config.providerUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        model: this.config.model,
        stream: true,
        messages: buildMessages(request),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Streaming response body is empty');
    }

    handler.onStart();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = '';

    while (true) {
      if (signal?.aborted) {
        throw new Error('Generation aborted');
      }

      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          continue;
        }

        const data = JSON.parse(trimmedLine) as OllamaStreamResponse;

        if (data.error) {
          throw new Error(data.error);
        }

        const chunk = data.message?.content;

        if (chunk) {
          handler.onChunk(chunk);
        }

        if (data.done) {
          handler.onEnd();
          return;
        }
      }
    }

    handler.onEnd();
  }
}

function buildMessages(request: ChatRequest) {
  return [
    {
      role: 'system',
      content: buildSystemPrompt(request.context),
    },
    {
      role: 'user',
      content: request.message,
    },
  ];
}

function buildSystemPrompt(context: ChatContext): string {
  const parts = [
    'You are BezotCorp AI, a coding assistant inside VS Code.',
    'Answer clearly and focus on practical code help.',
  ];

  if (context.selectedText) {
    parts.push(formatSelection(context.selectedText));
  }

  if (context.activeFile) {
    parts.push(formatFile('Active file', context.activeFile));
  }

  if (context.openFiles.length > 0) {
    parts.push('Open files:', ...context.openFiles.map((file) => formatFile('Open file', file)));
  }

  if (context.workspaceFiles.length > 0) {
    parts.push(`Workspace files:\n${context.workspaceFiles.map((file) => `- ${file}`).join('\n')}`);
  }

  return parts.join('\n\n');
}

function formatSelection(selection: ContextSelection): string {
  return `Selected text: ${selection.path}
Language: ${selection.languageId}

\`\`\`${selection.languageId}
${selection.text}
\`\`\``;
}

function formatFile(label: string, file: ContextFile): string {
  return `${label}: ${file.path}
Language: ${file.languageId}

\`\`\`${file.languageId}
${file.content}
\`\`\``;
}
