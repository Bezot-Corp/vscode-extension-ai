import * as http from 'node:http';
import * as vscode from 'vscode';

export function handleActiveFile(res: http.ServerResponse): void {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'no active file' }));
    return;
  }

  res.writeHead(200);
  res.end(
    JSON.stringify({
      path: editor.document.uri.fsPath,
      content: editor.document.getText(),
    }),
  );
}
