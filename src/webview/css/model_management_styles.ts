export function getModelManagementStyles(): string {
  return `
#model-card {
  padding: 10px;
  border: 1px solid var(--vscode-panel-border);
  border-radius: 6px;
  background: var(--vscode-editor-background);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

#active-model,
#model-error {
  opacity: 0.85;
  font-size: 0.9em;
  word-break: break-all;
}

#model-error {
  color: var(--vscode-errorForeground);
}

#model-select,
#model-input {
  width: 100%;
  padding: 5px 8px;
  background: var(--vscode-input-background);
  color: var(--vscode-input-foreground);
  border: 1px solid var(--vscode-input-border);
  border-radius: 4px;
}

#model-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

#refresh-models,
#save-model {
  padding: 5px 10px;
  background: var(--vscode-button-secondaryBackground);
  color: var(--vscode-button-secondaryForeground);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

#refresh-models:hover,
#save-model:hover {
  background: var(--vscode-button-secondaryHoverBackground);
}
`;
}
