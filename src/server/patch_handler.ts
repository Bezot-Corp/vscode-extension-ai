import * as http from 'node:http';
import * as vscode from 'vscode';

type PatchPayload = {
  path: string;
  old: string;
  new: string;
};

export function handlePatch(req: http.IncomingMessage, res: http.ServerResponse): void {
  let body = '';

  req.on('data', (chunk: Buffer) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const payload = JSON.parse(body) as PatchPayload;

      const uri = vscode.Uri.file(payload.path);
      const doc = await vscode.workspace.openTextDocument(uri);
      const content = doc.getText();

      if (!content.includes(payload.old)) {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'old text not found' }));
        return;
      }

      const newContent = content.replace(payload.old, payload.new);
      const edit = new vscode.WorkspaceEdit();
      const fullRange = new vscode.Range(doc.positionAt(0), doc.positionAt(content.length));

      edit.replace(uri, fullRange, newContent);

      await vscode.workspace.applyEdit(edit);
      await doc.save();

      res.writeHead(200);
      res.end(JSON.stringify({ success: true, path: payload.path }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: String(error) }));
    }
  });
}
