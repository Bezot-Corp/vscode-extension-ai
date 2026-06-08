export type ToolExecutionResult = {
  success: boolean;
  content?: string;
  error?: string;
};

export interface Tool {
  id: string;
  name: string;
  description: string;
  execute(input: unknown): Promise<ToolExecutionResult>;
}
