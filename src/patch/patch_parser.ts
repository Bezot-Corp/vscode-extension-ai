import { randomUUID } from 'node:crypto';
import { PatchCandidate } from '.';

const PATCH_BLOCK_REGEX = /```patch\s*([\s\S]*?)```/g;

export function parsePatchCandidates(text: string): PatchCandidate[] {
  const candidates: PatchCandidate[] = [];

  for (const match of text.matchAll(PATCH_BLOCK_REGEX)) {
    const candidate = parsePatchBlock(match[1]);

    if (candidate) {
      candidates.push(candidate);
    }
  }

  return candidates;
}

function parsePatchBlock(block: string): PatchCandidate | undefined {
  const fileMatch = block.match(/FILE:\s*(.+)/);
  const oldMatch = block.match(/OLD:\s*([\s\S]*?)\nNEW:/);
  const newMatch = block.match(/NEW:\s*([\s\S]*)/);

  const path = fileMatch?.[1]?.trim();
  const oldText = oldMatch?.[1]?.trim();
  const newText = newMatch?.[1]?.trim();

  if (!path || !oldText || !newText) {
    return undefined;
  }

  return {
    id: randomUUID(),
    path,
    oldText,
    newText,
    createdAt: new Date().toISOString(),
  };
}
