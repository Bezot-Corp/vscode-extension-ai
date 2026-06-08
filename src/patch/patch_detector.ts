import { PatchPreview } from './patch_preview';
import { parsePatchCandidates } from './patch_parser';

export function detectPatchPreviews(text: string): PatchPreview[] {
  return parsePatchCandidates(text).map((candidate) => ({
    candidate,
    status: 'pending',
  }));
}
