import { Tool, ToolExecutionResult } from '../tool';

export class WorkspaceTreeTool implements Tool {
  readonly id = 'workspaceTree';
  readonly name = 'Workspace Tree';
  readonly description = 'Provides a bounded list of workspace files.';

  constructor(private readonly getWorkspaceFiles: () => Promise<string[]>) {}

  async execute(): Promise<ToolExecutionResult> {
    const files = await this.getWorkspaceFiles();

    return {
      success: true,
      content: files.map((file) => `- ${file}`).join('\n'),
    };
  }
}
