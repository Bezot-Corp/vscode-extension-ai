import * as vscode from 'vscode';

type WebviewMessage = {
  type: string;
  text?: string;
};

type ChatResponse = {
  content?: string;
  error?: string;
};

export class ChatViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this.getHtml();

    webviewView.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
      if (message.type !== 'chat') {
        return;
      }

      const config = vscode.workspace.getConfiguration('bezotcorpAi');
      const backendMode = config.get<string>('backendMode', 'custom');
      const backendUrl = config.get<string>('backendUrl', 'http://127.0.0.1:4188');

      if (backendMode === 'bezotcorp') {
        webviewView.webview.postMessage({
          type: 'response',
          text: 'BezotCorp hosted backend is not available yet. Please use a custom backend for now.',
        });
        return;
      }

      try {
        const response = await fetch(`${backendUrl.replace(/\/$/, '')}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message.text ?? '' }),
        });

        const data = (await response.json()) as ChatResponse;

        webviewView.webview.postMessage({
          type: 'response',
          text: data.content ?? data.error ?? 'no response',
        });
      } catch (error) {
        webviewView.webview.postMessage({
          type: 'response',
          text: `Error: ${String(error)}`,
        });
      }
    });
  }

  private getHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--vscode-font-family);
  font-size: var(--vscode-font-size);
  color: var(--vscode-foreground);
  background: var(--vscode-editor-background);
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 8px;
  gap: 8px;
}
#messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.message {
  padding: 8px 12px;
  border-radius: 6px;
  max-width: 90%;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}
.user {
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  align-self: flex-end;
}
.assistant {
  background: var(--vscode-editor-inactiveSelectionBackground);
  align-self: flex-start;
}
#input-area {
  display: flex;
  gap: 6px;
}
#input {
  flex: 1;
  padding: 6px 10px;
  background: var(--vscode-input-background);
  color: var(--vscode-input-foreground);
  border: 1px solid var(--vscode-input-border);
  border-radius: 4px;
  font-family: inherit;
  font-size: inherit;
  resize: none;
  min-height: 36px;
  max-height: 120px;
}
#input:focus { outline: none; border-color: var(--vscode-focusBorder); }
#send {
  padding: 6px 14px;
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: inherit;
}
#send:hover { background: var(--vscode-button-hoverBackground); }
#send:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
</head>
<body>
<div id="messages"></div>
<div id="input-area">
  <textarea id="input" placeholder="Ask anything..." rows="1"></textarea>
  <button id="send">Send</button>
</div>
<script>
const vscode = acquireVsCodeApi();
const messages = document.getElementById('messages');
const input = document.getElementById('input');
const send = document.getElementById('send');

function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = 'message ' + role;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, 'user');
  input.value = '';
  input.style.height = 'auto';
  send.disabled = true;

  vscode.postMessage({ type: 'chat', text });
}

send.addEventListener('click', sendMessage);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = input.scrollHeight + 'px';
});

window.addEventListener('message', (event) => {
  const msg = event.data;

  if (msg.type === 'response') {
    addMessage(msg.text, 'assistant');
    send.disabled = false;
  }
});
</script>
</body>
</html>`;
  }
}
