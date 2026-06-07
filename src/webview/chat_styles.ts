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

#context-card {
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

#active-file-status {
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
#test-connection {
  padding: 5px 10px;
  background: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

#settings:hover,
#test-connection:hover {
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

#send {
  padding: 6px 14px;
  background: var(--vscode-button-background);
  color: var(--vscode-button-foreground);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: inherit;
}

#send:hover {
  background: var(--vscode-button-hoverBackground);
}

#send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;
}
