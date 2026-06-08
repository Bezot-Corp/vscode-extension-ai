export function getBodyStyles(): string {
  return `body {
  font-family: var(--vscode-font-family);
  font-size: var(--vscode-font-size);
  color: var(--vscode-foreground);
  background: var(--vscode-editor-background);
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 8px;
  gap: 8px;
}`;
}
