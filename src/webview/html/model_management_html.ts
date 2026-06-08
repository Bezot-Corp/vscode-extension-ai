export function getModelManagementHtml(): string {
  return `
<div id="model-card">
  <strong>AI Backend</strong>

  <label for="provider-select">Provider</label>
  <select id="provider-select">
    <option value="ollama">Ollama</option>
    <option value="customBackend">Custom Backend</option>
    <option value="bezotcorp">BezotCorp</option>
  </select>

  <label for="provider-url-input">Backend URL</label>
  <input id="provider-url-input" type="text" placeholder="http://127.0.0.1:11434">

  <div id="provider-actions">
    <button id="apply-provider-settings">Apply Backend</button>
  </div>

  <strong>Model</strong>
  <div id="active-model">Model: loading...</div>

  <select id="model-select"></select>
  <input id="model-input" type="text" placeholder="Manual model name">

  <div id="model-actions">
    <button id="refresh-models">Refresh Models</button>
    <button id="save-model">Use Model</button>
  </div>

  <div id="model-error"></div>
</div>`;
}
