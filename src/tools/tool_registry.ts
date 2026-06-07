import { Tool } from './tool';

export class ToolRegistry {
  private readonly tools = new Map<string, Tool>();

  register(tool: Tool): void {
    this.tools.set(tool.id, tool);
  }

  get(toolId: string): Tool | undefined {
    return this.tools.get(toolId);
  }

  list(): Tool[] {
    return [...this.tools.values()];
  }
}
