import { getChatScript } from './chat_script';
import { getChatStyles } from './chat_styles';

export function getChatHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
${getChatStyles()}
</style>
</head>
<body>
<div id="welcome">
  <strong>BezotCorp AI</strong>
  <p>Use Ollama, your own backend, or the future BezotCorp backend.</p>

  <div id="backend-card">
    <div id="backend-status">🟡 Connecting...</div>
    <div id="backend-url"></div>
    <button id="test-connection">Test Connection</button>
    <button id="settings">Open Settings</button>
    <button id="clear-history">Clear History</button>
  </div>
</div>

<div id="context-card">
  <label>
    <input id="include-active-file" type="checkbox" checked>
    Include active file
  </label>
  <div id="active-file-status">Active file will be attached when available.</div>

  <label>
    <input id="include-open-files" type="checkbox">
    Include open files
  </label>
  <div id="open-files-status">Open files disabled.</div>
</div>

<div id="context-preview-card">
  <strong>Context</strong>
  <div id="context-mode">Mode: basic</div>
  <div id="context-preview-active-file">Active file: none</div>
  <div id="context-preview-open-files">Open files: 0</div>
</div>

<div id="messages"></div>

<div id="input-area">
  <textarea id="input" placeholder="Ask anything..." rows="1"></textarea>
  <button id="send">Send</button>
</div>

<script>
${getChatScript()}
</script>
</body>
</html>`;
}
