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
const patchPreviewContainer = document.getElementById('patch-preview-container');

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
  patchPreviewContainer.textContent = '';
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

function renderPatchPreviews(previews) {
  patchPreviewContainer.textContent = '';

  for (const preview of previews) {
    patchPreviewContainer.appendChild(createPatchPreviewCard(preview));
  }
}

function createPatchPreviewCard(preview) {
  const card = document.createElement('div');
  card.className = 'patch-preview-card';
  card.dataset.patchId = preview.candidate.id;

  const header = document.createElement('div');
  header.className = 'patch-preview-header';

  const title = document.createElement('strong');
  title.textContent = 'Patch Preview';

  const status = document.createElement('div');
  status.className = 'patch-preview-status';
  status.textContent = 'Status: ' + preview.status;

  header.appendChild(title);
  header.appendChild(status);

  const file = document.createElement('div');
  file.className = 'patch-preview-file';
  file.textContent = preview.candidate.path;

  const diffLabel = document.createElement('div');
  diffLabel.className = 'patch-preview-label';
  diffLabel.textContent = 'Diff';

  const diff = document.createElement('pre');
  diff.className = 'patch-preview-diff';

  for (const line of buildDiffLines(preview.candidate.oldText, preview.candidate.newText)) {
    diff.appendChild(createDiffLine(line));
  }

  const error = document.createElement('div');
  error.className = 'patch-preview-error';
  error.hidden = true;

  const actions = document.createElement('div');
  actions.className = 'patch-preview-actions';

  const accept = document.createElement('button');
  accept.textContent = 'Accept';
  accept.dataset.action = 'accept';

  const reject = document.createElement('button');
  reject.textContent = 'Reject';
  reject.dataset.action = 'reject';

  accept.addEventListener('click', () => {
    setPatchCardBusy(card, true);

    vscode.postMessage({
      type: 'acceptPatch',
      patchId: preview.candidate.id,
    });
  });

  reject.addEventListener('click', () => {
    setPatchCardBusy(card, true);

    vscode.postMessage({
      type: 'rejectPatch',
      patchId: preview.candidate.id,
    });
  });

  actions.appendChild(accept);
  actions.appendChild(reject);

  card.appendChild(header);
  card.appendChild(file);
  card.appendChild(diffLabel);
  card.appendChild(diff);
  card.appendChild(error);
  card.appendChild(actions);

  updatePatchCardStatus(card, preview.status);

  return card;
}

function buildDiffLines(oldText, newText) {
  const oldLines = oldText.split('\\n');
  const newLines = newText.split('\\n');

  if (oldText === newText) {
    return oldLines.map((content) => ({
      kind: 'unchanged',
      content,
    }));
  }

  const commonPrefixLength = getCommonPrefixLength(oldLines, newLines);
  const commonSuffixLength = getCommonSuffixLength(oldLines, newLines, commonPrefixLength);

  const prefix = oldLines.slice(0, commonPrefixLength).map((content) => ({
    kind: 'unchanged',
    content,
  }));

  const removed = oldLines
    .slice(commonPrefixLength, oldLines.length - commonSuffixLength)
    .map((content) => ({
      kind: 'removed',
      content,
    }));

  const added = newLines
    .slice(commonPrefixLength, newLines.length - commonSuffixLength)
    .map((content) => ({
      kind: 'added',
      content,
    }));

  const suffix = oldLines.slice(oldLines.length - commonSuffixLength).map((content) => ({
    kind: 'unchanged',
    content,
  }));

  return [...prefix, ...removed, ...added, ...suffix];
}

function getCommonPrefixLength(oldLines, newLines) {
  const maxLength = Math.min(oldLines.length, newLines.length);

  for (let index = 0; index < maxLength; index += 1) {
    if (oldLines[index] !== newLines[index]) {
      return index;
    }
  }

  return maxLength;
}

function getCommonSuffixLength(oldLines, newLines, prefixLength) {
  const maxLength = Math.min(oldLines.length, newLines.length) - prefixLength;

  for (let index = 0; index < maxLength; index += 1) {
    const oldLine = oldLines[oldLines.length - 1 - index];
    const newLine = newLines[newLines.length - 1 - index];

    if (oldLine !== newLine) {
      return index;
    }
  }

  return maxLength;
}

function createDiffLine(line) {
  const span = document.createElement('span');
  span.className = 'patch-diff-line patch-diff-line-' + line.kind;

  const prefix = {
    unchanged: '  ',
    removed: '- ',
    added: '+ ',
  }[line.kind];

  span.textContent = prefix + line.content + '\\n';

  return span;
}

function setPatchCardBusy(card, isBusy) {
  const buttons = card.querySelectorAll('button');

  for (const button of buttons) {
    button.disabled = isBusy;
  }
}

function updatePatchCardStatus(card, status, errorText) {
  const statusElement = card.querySelector('.patch-preview-status');
  const errorElement = card.querySelector('.patch-preview-error');
  const buttons = card.querySelectorAll('button');

  statusElement.textContent = 'Status: ' + status;

  if (errorText) {
    errorElement.hidden = false;
    errorElement.textContent = errorText;
  } else {
    errorElement.hidden = true;
    errorElement.textContent = '';
  }

  for (const button of buttons) {
    button.disabled = status !== 'pending';
  }

  card.classList.toggle('patch-preview-accepted', status === 'accepted');
  card.classList.toggle('patch-preview-rejected', status === 'rejected');
}

function updatePatchStatus(patchId, status, errorText) {
  const card = patchPreviewContainer.querySelector('[data-patch-id="' + patchId + '"]');

  if (!card) {
    return;
  }

  updatePatchCardStatus(card, status, errorText);
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

  if (msg.type === 'patchPreviews') {
    renderPatchPreviews(msg.previews);
  }

  if (msg.type === 'patchStatus') {
    updatePatchStatus(msg.patchId, msg.status, msg.error);
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
