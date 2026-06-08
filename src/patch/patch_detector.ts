import { buildDiffLines } from './diff_builder';
import { PatchPreview } from './patch_preview';
import { parsePatchCandidates } from './patch_parser';

export function detectPatchPreviews(text: string): PatchPreview[] {
  return parsePatchCandidates(text).map((candidate) => ({
    candidate,
    diffLines: buildDiffLines(candidate.oldText, candidate.newText),
    status: 'pending',
  }));
}
