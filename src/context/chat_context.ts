import { ContextFile, ContextSelection } from '.';

export type ChatContext = {
  mode: 'basic' | 'rich';
  selectedText?: ContextSelection;
  activeFile?: ContextFile;
  openFiles: ContextFile[];
  workspaceFiles: string[];
};
