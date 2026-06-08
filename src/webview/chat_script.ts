import { getContextPreviewScript } from '.';
import { getMessageListScript } from './message_list_script';
import { getPatchPreviewScript } from './patch_preview_script';

export function getChatScript(): string {
  return `
const vscode = acquireVsCodeApi();

let activeSessionId = undefined;
let chatSessions = [];

${getMessageListScript()}

${getContextPreviewScript()}

${getPatchPreviewScript()}
`;
}
