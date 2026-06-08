import * as http from 'node:http';
import * as vscode from 'vscode';

export function handleOpenFiles(res: http.ServerResponse): void {
  const files = vscode.workspace.textDocuments
    .filter((doc) => !doc.isUntitled && doc.uri.scheme === 'file')
    .map((doc) => ({
      path: doc.uri.fsPath,
      content: doc.getText(),
    }));

  res.writeHead(200);
  res.end(JSON.stringify({ files }));
}
