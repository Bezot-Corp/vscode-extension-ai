export function getPatchPreviewScript(): string {
  return `
function renderPatchPreviews(previews) {
  patchPreviewContainer.textContent = '';

  for (const preview of previews) {
    patchPreviewContainer.appendChild(createPatchPreviewCard(preview));
  }
}

function createPatchPreviewCard(preview) {
  const card = document.createElement('div');
  card.className = 'patch-preview-card';
  card.dataset.patchId = preview.candidate.id;

  const header = document.createElement('div');
  header.className = 'patch-preview-header';

  const title = document.createElement('strong');
  title.textContent = 'Patch Preview';

  const status = document.createElement('div');
  status.className = 'patch-preview-status';
  status.textContent = 'Status: ' + preview.status;

  header.appendChild(title);
  header.appendChild(status);

  const file = document.createElement('div');
  file.className = 'patch-preview-file';
  file.textContent = preview.candidate.path;

  const diffLabel = document.createElement('div');
  diffLabel.className = 'patch-preview-label';
  diffLabel.textContent = 'Diff';

  const diff = document.createElement('pre');
  diff.className = 'patch-preview-diff';

  for (const line of preview.diffLines ?? []) {
    diff.appendChild(createDiffLine(line));
  }

  const error = document.createElement('div');
  error.className = 'patch-preview-error';
  error.hidden = true;

  const actions = document.createElement('div');
  actions.className = 'patch-preview-actions';

  const accept = document.createElement('button');
  accept.textContent = 'Accept';
  accept.dataset.action = 'accept';

  const reject = document.createElement('button');
  reject.textContent = 'Reject';
  reject.dataset.action = 'reject';

  accept.addEventListener('click', () => {
    setPatchCardBusy(card, true);

    vscode.postMessage({
      type: 'acceptPatch',
      patchId: preview.candidate.id,
    });
  });

  reject.addEventListener('click', () => {
    setPatchCardBusy(card, true);

    vscode.postMessage({
      type: 'rejectPatch',
      patchId: preview.candidate.id,
    });
  });

  actions.appendChild(accept);
  actions.appendChild(reject);

  card.appendChild(header);
  card.appendChild(file);
  card.appendChild(diffLabel);
  card.appendChild(diff);
  card.appendChild(error);
  card.appendChild(actions);

  updatePatchCardStatus(card, preview.status);

  return card;
}

function createDiffLine(line) {
  const span = document.createElement('span');
  span.className = 'patch-diff-line patch-diff-line-' + line.kind;

  const prefix = {
    unchanged: '  ',
    removed: '- ',
    added: '+ ',
  }[line.kind] ?? '  ';

  span.textContent = prefix + line.content + '\\n';

  return span;
}

function setPatchCardBusy(card, isBusy) {
  const buttons = card.querySelectorAll('button');

  for (const button of buttons) {
    button.disabled = isBusy;
  }
}

function updatePatchCardStatus(card, status, errorText) {
  const statusElement = card.querySelector('.patch-preview-status');
  const errorElement = card.querySelector('.patch-preview-error');
  const buttons = card.querySelectorAll('button');

  statusElement.textContent = 'Status: ' + status;

  if (errorText) {
    errorElement.hidden = false;
    errorElement.textContent = errorText;
  } else {
    errorElement.hidden = true;
    errorElement.textContent = '';
  }

  for (const button of buttons) {
    button.disabled = status !== 'pending';
  }

  card.classList.toggle('patch-preview-accepted', status === 'accepted');
  card.classList.toggle('patch-preview-rejected', status === 'rejected');
}

function updatePatchStatus(patchId, status, errorText) {
  const card = patchPreviewContainer.querySelector('[data-patch-id="' + patchId + '"]');

  if (!card) {
    return;
  }

  updatePatchCardStatus(card, status, errorText);
}
`;
}
