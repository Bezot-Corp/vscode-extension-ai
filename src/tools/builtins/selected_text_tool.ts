import { ContextSelection } from '../../context';
import { Tool, ToolExecutionResult } from '../tool';

export class SelectedTextTool implements Tool {
  readonly id = 'selectedText';
  readonly name = 'Selected Text';
  readonly description = 'Provides the current VS Code selected text context.';

  constructor(private readonly getSelection: () => ContextSelection | undefined) {}

  async execute(): Promise<ToolExecutionResult> {
    const selection = this.getSelection();

    if (!selection) {
      return {
        success: false,
        error: 'No selected text available.',
      };
    }

    return {
      success: true,
      content: selection.text,
    };
  }
}
