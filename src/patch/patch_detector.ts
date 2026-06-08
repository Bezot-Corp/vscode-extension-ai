import { buildDiffLines, parsePatchCandidates, PatchPreview } from '.';

export function detectPatchPreviews(text: string): PatchPreview[] {
  return parsePatchCandidates(text).map((candidate) => ({
    candidate,
    diffLines: buildDiffLines(candidate.oldText, candidate.newText),
    status: 'pending',
  }));
}
