import { PatchCandidate } from './patch_candidate';

export type PatchPreview = {
  candidate: PatchCandidate;
  status: 'pending' | 'accepted' | 'rejected';
};
