import { DiffLine, PatchCandidate, PatchStatus } from '.';

export type PatchPreview = {
  candidate: PatchCandidate;
  diffLines: DiffLine[];
  status: PatchStatus;
};
