export function getContextPreviewScript(): string {
  return `
function getContextOptions() {
  return {
    includeSelectedText: includeSelectedText.checked,
    includeActiveFile: includeActiveFile.checked,
    includeOpenFiles: includeOpenFiles.checked,
    includeWorkspaceTree: includeWorkspaceTree.checked,
  };
}

function updateContextStatus(selectedTextLength, activeFilePath, openFilesCount, workspaceFilesCount) {
  if (!includeSelectedText.checked) {
    selectedTextStatus.textContent = 'Selected text disabled.';
  } else {
    selectedTextStatus.textContent = selectedTextLength > 0
      ? 'Selected text attached: ' + selectedTextLength + ' chars'
      : 'No selected text attached.';
  }

  if (!includeActiveFile.checked) {
    activeFileStatus.textContent = 'Active file disabled.';
  } else {
    activeFileStatus.textContent = activeFilePath
      ? 'Attached: ' + activeFilePath
      : 'No active file attached.';
  }

  if (!includeOpenFiles.checked) {
    openFilesStatus.textContent = 'Open files disabled.';
  } else {
    openFilesStatus.textContent = 'Open files attached: ' + openFilesCount;
  }

  if (!includeWorkspaceTree.checked) {
    workspaceTreeStatus.textContent = 'Workspace tree disabled.';
  } else {
    workspaceTreeStatus.textContent = 'Workspace files attached: ' + workspaceFilesCount;
  }
}

function updateContextPreview(mode, activeFilePath, selectedTextLength, openFilesCount, workspaceFilesCount) {
  contextMode.textContent = 'Mode: ' + mode;

  contextPreviewSelectedText.textContent = selectedTextLength > 0
    ? 'Selected text: ' + selectedTextLength + ' chars'
    : 'Selected text: none';

  contextPreviewActiveFile.textContent = activeFilePath
    ? 'Active file: ' + activeFilePath
    : 'Active file: none';

  contextPreviewOpenFiles.textContent = 'Open files: ' + openFilesCount;
  contextPreviewWorkspaceFiles.textContent = 'Workspace files: ' + workspaceFilesCount;

  updateContextStatus(selectedTextLength, activeFilePath, openFilesCount, workspaceFilesCount);
}

function refreshContextPreview() {
  vscode.postMessage({
    type: 'refreshContextPreview',
    ...getContextOptions(),
  });
}
`;
}
