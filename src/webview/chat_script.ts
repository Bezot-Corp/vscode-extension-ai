export function getChatScript(): string {
  return `
const vscode = acquireVsCodeApi();

const messages = document.getElementById('messages');
const input = document.getElementById('input');
const send = document.getElementById('send');
const settings = document.getElementById('settings');
const testConnection = document.getElementById('test-connection');
const clearHistory = document.getElementById('clear-history');
const backendStatus = document.getElementById('backend-status');
const backendUrl = document.getElementById('backend-url');
const includeActiveFile = document.getElementById('include-active-file');
const includeOpenFiles = document.getElementById('include-open-files');
const activeFileStatus = document.getElementById('active-file-status');
const openFilesStatus = document.getElementById('open-files-status');
const contextMode = document.getElementById('context-mode');
const contextPreviewActiveFile = document.getElementById('context-preview-active-file');
const contextPreviewOpenFiles = document.getElementById('context-preview-open-files');

let currentAssistantMessage = null;

function getContextOptions() {
  return {
    includeActiveFile: includeActiveFile.checked,
    includeOpenFiles: includeOpenFiles.checked,
  };
}

function addMessage(text, role) {
  const div = document.createElement('div');
  div.className = 'message ' + role;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

function clearMessages() {
  messages.textContent = '';
  currentAssistantMessage = null;
}

function restoreHistory(restoredMessages) {
  clearMessages();

  for (const message of restoredMessages) {
    addMessage(message.content, message.role);
  }
}

function startAssistantMessage() {
  currentAssistantMessage = addMessage('', 'assistant');
}

function appendAssistantChunk(text) {
  if (!currentAssistantMessage) {
    startAssistantMessage();
  }

  currentAssistantMessage.textContent += text;
  messages.scrollTop = messages.scrollHeight;
}

function endAssistantMessage() {
  currentAssistantMessage = null;
  send.disabled = false;
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
    ...getContextOptions(),
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

function updateContextStatus(activeFilePath, openFilesCount) {
  if (!includeActiveFile.checked) {
    activeFileStatus.textContent = 'Active file disabled.';
  } else {
    activeFileStatus.textContent = activeFilePath
      ? 'Attached: ' + activeFilePath
      : 'No active file attached.';
  }

  if (!includeOpenFiles.checked) {
    openFilesStatus.textContent = 'Open files disabled.';
  } else {
    openFilesStatus.textContent = 'Open files attached: ' + openFilesCount;
  }
}

function updateContextPreview(mode, activeFilePath, openFilesCount) {
  contextMode.textContent = 'Mode: ' + mode;

  contextPreviewActiveFile.textContent = activeFilePath
    ? 'Active file: ' + activeFilePath
    : 'Active file: none';

  contextPreviewOpenFiles.textContent = 'Open files: ' + openFilesCount;

  updateContextStatus(activeFilePath, openFilesCount);
}

function refreshContextPreview() {
  vscode.postMessage({
    type: 'refreshContextPreview',
    ...getContextOptions(),
  });
}

settings.addEventListener('click', () => {
  vscode.postMessage({ type: 'openSettings' });
});

testConnection.addEventListener('click', () => {
  vscode.postMessage({ type: 'testConnection' });
});

clearHistory.addEventListener('click', () => {
  vscode.postMessage({ type: 'clearHistory' });
});

includeActiveFile.addEventListener('change', refreshContextPreview);
includeOpenFiles.addEventListener('change', refreshContextPreview);

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

  if (msg.type === 'historyRestored') {
    restoreHistory(msg.messages);
  }

  if (msg.type === 'response') {
    addMessage(msg.text, 'assistant');
    send.disabled = false;
  }

  if (msg.type === 'responseStart') {
    startAssistantMessage();
  }

  if (msg.type === 'responseChunk') {
    appendAssistantChunk(msg.text);
  }

  if (msg.type === 'responseEnd') {
    endAssistantMessage();
  }

  if (msg.type === 'backendStatus') {
    updateBackendStatus(msg.status, msg.text, msg.backendUrl);
  }

  if (msg.type === 'contextPreview') {
    updateContextPreview(msg.mode, msg.activeFilePath, msg.openFilesCount);
  }
});

refreshContextPreview();
`;
}
