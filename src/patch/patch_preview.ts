import { DiffLine } from './diff_line';
import { PatchCandidate } from './patch_candidate';

export type PatchPreview = {
  candidate: PatchCandidate;
  diffLines: DiffLine[];
  status: 'pending' | 'accepted' | 'rejected';
};
