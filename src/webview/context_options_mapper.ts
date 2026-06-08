import { ContextOptions } from './context_options';
import { WebviewMessage } from '.';

export function getContextOptions(message: WebviewMessage): ContextOptions {
  return {
    includeActiveFile: message.includeActiveFile ?? true,
    includeOpenFiles: message.includeOpenFiles ?? false,
    includeSelectedText: message.includeSelectedText ?? true,
    includeWorkspaceTree: message.includeWorkspaceTree ?? false,
  };
}
