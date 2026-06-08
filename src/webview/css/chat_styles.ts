import { getModelManagementStyles } from './model_management_styles';

export function getChatStyles(): string {
  return `
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

#welcome {
  padding: 10px;
  border: 1px solid var(--vscode-panel-border);
  border-radius: 6px;
  background: var(--vscode-editor-inactiveSelectionBackground);
}

#welcome p {
  margin: 6px 0 10px;
  line-height: 1.4;
}

#chat-session-card {
  padding: 10px;
  border: 1px solid var(--vscode-panel-border);
  border-radius: 6px;
  background: var(--vscode-editor-background);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

#chat-session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

#chat-session-select {
  width: 100%;
  padding: 5px 8px;
  background: var(--vscode-dropdown-background);
  color: var(--vscode-dropdown-foreground);
  border: 1px solid var(--vscode-dropdown-border);
  border-radius: 4px;
}

#chat-session-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

#context-card,
#context-preview-card {
  padding: 10px;
  border: 1px solid var(--vscode-panel-border);
  border-radius: 6px;
  background: var(--vscode-editor-background);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

#context-card label {
  display: flex;
  align-items: center;
  gap: 6px;
}

#selected-text-status,
#active-file-status,
#open-files-status,
#workspace-tree-status,
#context-mode,
#context-preview-selected-text,
#context-preview-active-file,
#context-preview-open-files,
#context-preview-workspace-files {
  opacity: 0.8;
  font-size: 0.9em;
  word-break: break-all;
}

#backend-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

#backend-status {
  font-weight: 600;
}

#backend-url {
  opacity: 0.8;
  font-size: 0.9em;
  word-break: break-all;
}

#settings,
#test-connection,
#new-chat,
#rename-chat,
#delete-chat,
#clear-history {
  padding: 5px 10px;
  background: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

#settings:hover,
#test-connection:hover,
#new-chat:hover,
#rename-chat:hover,
#delete-chat:hover,
#clear-history:hover {
  background: var(--vscode-button-secondaryHoverBackground);
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

#input:focus {
  outline: none;
  border-color: var(--vscode-focusBorder);
}

#send,
#stop {
  padding: 6px 14px;
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: inherit;
}

#send:hover,
#stop:hover {
  background: var(--vscode-button-hoverBackground);
}

#send:disabled,
#stop:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

#patch-preview-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.patch-preview-card {
  padding: 10px;
  border: 1px solid var(--vscode-panel-border);
  border-radius: 6px;
  background: var(--vscode-editor-background);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.patch-preview-header {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.patch-preview-status {
  opacity: 0.85;
  font-size: 0.9em;
}

.patch-preview-file,
.patch-preview-label {
  opacity: 0.85;
  font-size: 0.9em;
  word-break: break-all;
}

.patch-preview-label {
  font-weight: 600;
}

.patch-preview-diff {
  padding: 8px;
  border-radius: 4px;
  background: var(--vscode-textCodeBlock-background);
  color: var(--vscode-editor-foreground);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: var(--vscode-editor-font-family);
  font-size: var(--vscode-editor-font-size);
  line-height: 1.45;
}

.patch-diff-line {
  display: block;
}

.patch-diff-line-unchanged {
  opacity: 0.9;
}

.patch-diff-line-removed {
  background: var(--vscode-diffEditor-removedTextBackground);
}

.patch-diff-line-added {
  background: var(--vscode-diffEditor-insertedTextBackground);
}

.patch-preview-error {
  padding: 8px;
  border-radius: 4px;
  background: var(--vscode-inputValidation-errorBackground);
  color: var(--vscode-inputValidation-errorForeground);
  border: 1px solid var(--vscode-inputValidation-errorBorder);
  font-size: 0.9em;
}

.patch-preview-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.patch-preview-actions button {
  padding: 5px 10px;
  background: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.patch-preview-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.patch-preview-accepted {
  border-color: var(--vscode-testing-iconPassed);
}

.patch-preview-rejected {
  opacity: 0.65;
}

${getModelManagementStyles()}
`;
}
