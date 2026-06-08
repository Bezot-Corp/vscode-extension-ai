export type DiffLineKind = 'unchanged' | 'removed' | 'added';

export type DiffLine = {
  kind: DiffLineKind;
  content: string;
};
