import { DiffLineKind } from '.';

export type DiffLine = {
  kind: DiffLineKind;
  content: string;
};
