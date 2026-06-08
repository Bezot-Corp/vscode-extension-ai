export type ContextFile = {
  path: string;
  languageId: string;
  content: string;
};

export type ContextSelection = {
  path: string;
  languageId: string;
  text: string;
};

export type ChatContext = {
  mode: 'basic' | 'rich';
  selectedText?: ContextSelection;
  activeFile?: ContextFile;
  openFiles: ContextFile[];
  workspaceFiles: string[];
};
