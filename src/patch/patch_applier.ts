import * as path from 'node:path';
import * as vscode from 'vscode';

import { PatchCandidate } from './patch_candidate';

export type PatchApplyResult = {
  success: boolean;
  error?: string;
};

export async function applyPatchCandidate(candidate: PatchCandidate): Promise<PatchApplyResult> {
  const uri = resolvePatchUri(candidate.path);
  const document = await vscode.workspace.openTextDocument(uri);
  const content = document.getText();

  if (!content.includes(candidate.oldText)) {
    return {
      success: false,
      error: `Old text not found in ${candidate.path}`,
    };
  }

  const newContent = content.replace(candidate.oldText, candidate.newText);
  const edit = new vscode.WorkspaceEdit();
  const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(content.length));

  edit.replace(uri, fullRange, newContent);

  const applied = await vscode.workspace.applyEdit(edit);

  if (!applied) {
    return {
      success: false,
      error: `VS Code refused to apply patch for ${candidate.path}`,
    };
  }

  await document.save();

  return {
    success: true,
  };
}

function resolvePatchUri(candidatePath: string): vscode.Uri {
  if (path.isAbsolute(candidatePath)) {
    return vscode.Uri.file(candidatePath);
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (!workspaceFolder) {
    return vscode.Uri.file(candidatePath);
  }

  return vscode.Uri.joinPath(workspaceFolder.uri, candidatePath);
}
