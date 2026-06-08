export function getMessageListScript(): string {
  return `
let currentAssistantMessage = null;

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
`;
}
