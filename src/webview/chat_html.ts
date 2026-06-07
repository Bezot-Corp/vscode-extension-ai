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
  <p>Use your own compatible backend today. The official BezotCorp backend is coming later.</p>
  <button id="settings">Open Settings</button>
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
