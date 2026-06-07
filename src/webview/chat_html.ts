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
  </div>
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
