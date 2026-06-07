export function getChatScript(): string {
  return `
const vscode = acquireVsCodeApi();

const messages = document.getElementById('messages');
const input = document.getElementById('input');
const send = document.getElementById('send');
const settings = document.getElementById('settings');
const testConnection = document.getElementById('test-connection');
const backendStatus = document.getElementById('backend-status');
const backendUrl = document.getElementById('backend-url');
const includeActiveFile = document.getElementById('include-active-file');
const activeFileStatus = document.getElementById('active-file-status');

function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = 'message ' + role;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function sendMessage() {
  const text = input.value.trim();

  if (!text) {
    return;
  }

  addMessage(text, 'user');
  input.value = '';
  input.style.height = 'auto';
  send.disabled = true;

  vscode.postMessage({
    type: 'chat',
    text,
    includeActiveFile: includeActiveFile.checked,
  });
}

function updateBackendStatus(status, text, url) {
  const icons = {
    connected: '🟢',
    disconnected: '🔴',
    connecting: '🟡',
  };

  backendStatus.textContent = (icons[status] ?? '🟡') + ' ' + text;
  backendUrl.textContent = url ? 'Backend: ' + url : '';
}

function updateContextStatus(activeFilePath) {
  if (!includeActiveFile.checked) {
    activeFileStatus.textContent = 'Active file disabled.';
    return;
  }

  activeFileStatus.textContent = activeFilePath
    ? 'Attached: ' + activeFilePath
    : 'No active file attached.';
}

settings.addEventListener('click', () => {
  vscode.postMessage({ type: 'openSettings' });
});

testConnection.addEventListener('click', () => {
  vscode.postMessage({ type: 'testConnection' });
});

includeActiveFile.addEventListener('change', () => {
  updateContextStatus(undefined);
});

send.addEventListener('click', sendMessage);

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
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

  if (msg.type === 'backendStatus') {
    updateBackendStatus(msg.status, msg.text, msg.backendUrl);
  }

  if (msg.type === 'contextStatus') {
    updateContextStatus(msg.activeFilePath);
  }
});
`;
}
