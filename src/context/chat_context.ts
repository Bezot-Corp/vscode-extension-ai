export type ContextFile = {
  path: string;
  languageId: string;
  content: string;
};

export type ChatContext = {
  mode: 'basic' | 'rich';
  activeFile?: ContextFile;
  openFiles: ContextFile[];
};
