import * as vscode from 'vscode';

import { SystemBackend } from '../backend/system';

let backend: SystemBackend | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  backend = new SystemBackend();
  const port = await backend.start();

  console.log(`BezotCorp AI backend started on ws://127.0.0.1:${port}`);

  context.subscriptions.push({
    dispose: () => {
      void backend?.stop();
      backend = undefined;
    },
  });
}

export function deactivate(): void {
  void backend?.stop();
  backend = undefined;
}
