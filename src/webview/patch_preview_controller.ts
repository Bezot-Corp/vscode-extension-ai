import * as vscode from 'vscode';

import { applyPatchCandidate } from '../patch/patch_applier';
import { detectPatchPreviews } from '../patch/patch_detector';
import { PatchPreview } from '../patch/patch_preview';

export function detectAndSendPatchPreviews(
  webviewView: vscode.WebviewView,
  patchPreviewsStore: Map<string, PatchPreview>,
  assistantText: string,
): void {
  const patchPreviews = detectPatchPreviews(assistantText);

  if (patchPreviews.length === 0) {
    return;
  }

  for (const preview of patchPreviews) {
    patchPreviewsStore.set(preview.candidate.id, preview);
  }

  webviewView.webview.postMessage({
    type: 'patchPreviews',
    previews: patchPreviews,
  });
}

export async function acceptPatch(
  webviewView: vscode.WebviewView,
  patchPreviewsStore: Map<string, PatchPreview>,
  patchId: string | undefined,
): Promise<void> {
  if (!patchId) {
    return;
  }

  const preview = patchPreviewsStore.get(patchId);

  if (!preview || preview.status !== 'pending') {
    return;
  }

  const result = await applyPatchCandidate(preview.candidate);

  if (!result.success) {
    webviewView.webview.postMessage({
      type: 'patchStatus',
      patchId,
      status: 'pending',
      error: result.error ?? 'Failed to apply patch.',
    });
    return;
  }

  preview.status = 'accepted';
  patchPreviewsStore.set(patchId, preview);

  webviewView.webview.postMessage({
    type: 'patchStatus',
    patchId,
    status: 'accepted',
  });
}

export function rejectPatch(
  webviewView: vscode.WebviewView,
  patchPreviewsStore: Map<string, PatchPreview>,
  patchId: string | undefined,
): void {
  if (!patchId) {
    return;
  }

  const preview = patchPreviewsStore.get(patchId);

  if (!preview || preview.status !== 'pending') {
    return;
  }

  preview.status = 'rejected';
  patchPreviewsStore.set(patchId, preview);

  webviewView.webview.postMessage({
    type: 'patchStatus',
    patchId,
    status: 'rejected',
  });
}
