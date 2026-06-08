export function getModelManagementHtml(): string {
  return `
<div id="model-card">
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
