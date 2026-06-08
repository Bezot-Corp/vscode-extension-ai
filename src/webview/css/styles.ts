import { getAllStyles, getBodyStyles, getChatStyles, getModelManagementStyles, getPatchStyles } from '.';

export function getStyles(): string {
  return `
${getAllStyles()}
${getBodyStyles()}
${getChatStyles()}
${getModelManagementStyles()}
${getPatchStyles()}`;
}
