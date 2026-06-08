export function getPatchStyles(): string {
  return `
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
}`;
}
