export function getChatScript(): string {
  return `
const vscode = acquireVsCodeApi();

const messages = document.getElementById('messages');
const input = document.getElementById('input');
const send = document.getElementById('send');
const stop = document.getElementById('stop');
const settings = document.getElementById('settings');
const testConnection = document.getElementById('test-connection');
const clearHistory = document.getElementById('clear-history');
const backendStatus = document.getElementById('backend-status');
const backendUrl = document.getElementById('backend-url');
const includeSelectedText = document.getElementById('include-selected-text');
const includeActiveFile = document.getElementById('include-active-file');
const includeOpenFiles = document.getElementById('include-open-files');
const includeWorkspaceTree = document.getElementById('include-workspace-tree');
const selectedTextStatus = document.getElementById('selected-text-status');
const activeFileStatus = document.getElementById('active-file-status');
const openFilesStatus = document.getElementById('open-files-status');
const workspaceTreeStatus = document.getElementById('workspace-tree-status');
const contextMode = document.getElementById('context-mode');
const contextPreviewSelectedText = document.getElementById('context-preview-selected-text');
const contextPreviewActiveFile = document.getElementById('context-preview-active-file');
const contextPreviewOpenFiles = document.getElementById('context-preview-open-files');
const contextPreviewWorkspaceFiles = document.getElementById('context-preview-workspace-files');

let currentAssistantMessage = null;

function getContextOptions() {
  return {
    includeSelectedText: includeSelectedText.checked,
    includeActiveFile: includeActiveFile.checked,
    includeOpenFiles: includeOpenFiles.checked,
    includeWorkspaceTree: includeWorkspaceTree.checked,
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

function setGenerating(isGenerating) {
  send.disabled = isGenerating;
  stop.disabled = !isGenerating;
}

function startAssistantMessage() {
  currentAssistantMessage = addMessage('', 'assistant');
  setGenerating(true);
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
  setGenerating(false);
}

function sendMessage() {
  const text = input.value.trim();

  if (!text) {
    return;
  }

  addMessage(text, 'user');
  input.value = '';
  input.style.height = 'auto';
  setGenerating(true);

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

function updateContextStatus(selectedTextLength, activeFilePath, openFilesCount, workspaceFilesCount) {
  if (!includeSelectedText.checked) {
    selectedTextStatus.textContent = 'Selected text disabled.';
  } else {
    selectedTextStatus.textContent = selectedTextLength > 0
      ? 'Selected text attached: ' + selectedTextLength + ' chars'
      : 'No selected text attached.';
  }

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

  if (!includeWorkspaceTree.checked) {
    workspaceTreeStatus.textContent = 'Workspace tree disabled.';
  } else {
    workspaceTreeStatus.textContent = 'Workspace files attached: ' + workspaceFilesCount;
  }
}

function updateContextPreview(mode, activeFilePath, selectedTextLength, openFilesCount, workspaceFilesCount) {
  contextMode.textContent = 'Mode: ' + mode;

  contextPreviewSelectedText.textContent = selectedTextLength > 0
    ? 'Selected text: ' + selectedTextLength + ' chars'
    : 'Selected text: none';

  contextPreviewActiveFile.textContent = activeFilePath
    ? 'Active file: ' + activeFilePath
    : 'Active file: none';

  contextPreviewOpenFiles.textContent = 'Open files: ' + openFilesCount;
  contextPreviewWorkspaceFiles.textContent = 'Workspace files: ' + workspaceFilesCount;

  updateContextStatus(selectedTextLength, activeFilePath, openFilesCount, workspaceFilesCount);
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

stop.addEventListener('click', () => {
  vscode.postMessage({ type: 'stopGeneration' });
});

includeSelectedText.addEventListener('change', refreshContextPreview);
includeActiveFile.addEventListener('change', refreshContextPreview);
includeOpenFiles.addEventListener('change', refreshContextPreview);
includeWorkspaceTree.addEventListener('change', refreshContextPreview);

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
    setGenerating(false);
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

  if (msg.type === 'responseStopped') {
    endAssistantMessage();
  }

  if (msg.type === 'backendStatus') {
    updateBackendStatus(msg.status, msg.text, msg.backendUrl);
  }

  if (msg.type === 'contextPreview') {
    updateContextPreview(
      msg.mode,
      msg.activeFilePath,
      msg.selectedTextLength,
      msg.openFilesCount,
      msg.workspaceFilesCount,
    );
  }
});

refreshContextPreview();
`;
}
