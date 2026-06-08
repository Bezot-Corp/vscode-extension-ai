export function getModelManagementScript(): string {
  return `
const providerSelect = document.getElementById('provider-select');
const providerUrlInput = document.getElementById('provider-url-input');
const applyProviderSettings = document.getElementById('apply-provider-settings');
const modelSelect = document.getElementById('model-select');
const modelInput = document.getElementById('model-input');
const refreshModels = document.getElementById('refresh-models');
const saveModel = document.getElementById('save-model');
const activeModel = document.getElementById('active-model');
const modelError = document.getElementById('model-error');

function renderModelState(state) {
  providerSelect.value = state.provider;
  providerUrlInput.value = state.providerUrl;
  activeModel.textContent =
    'Provider: ' + state.provider +
    ' | URL: ' + state.providerUrl +
    ' | Model: ' + state.activeModel;

  modelInput.value = state.activeModel;
  modelError.textContent = state.error ? 'Model loading error: ' + state.error : '';

  modelSelect.textContent = '';

  for (const model of state.models ?? []) {
    const option = document.createElement('option');

    option.value = model.id;
    option.textContent = model.name;
    option.selected = model.id === state.activeModel;

    modelSelect.appendChild(option);
  }
}

function changeModel(model) {
  if (!model || !model.trim()) {
    return;
  }

  vscode.postMessage({
    type: 'changeModel',
    model: model.trim(),
  });
}

function updateProviderSettings() {
  const provider = providerSelect.value;
  const providerUrl = providerUrlInput.value.trim();

  if (!provider || !providerUrl) {
    return;
  }

  vscode.postMessage({
    type: 'updateProviderSettings',
    provider,
    providerUrl,
  });
}

applyProviderSettings.addEventListener('click', updateProviderSettings);

refreshModels.addEventListener('click', () => {
  vscode.postMessage({ type: 'refreshModels' });
});

modelSelect.addEventListener('change', () => {
  changeModel(modelSelect.value);
});

saveModel.addEventListener('click', () => {
  changeModel(modelInput.value);
});

window.addEventListener('message', (event) => {
  const msg = event.data;

  if (msg.type === 'modelState') {
    renderModelState(msg);
  }
});
`;
}
