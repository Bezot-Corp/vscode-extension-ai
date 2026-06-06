# BezotCorp AI

![BezotCorp AI](assets/banner.png)

**Your local AI coding assistant for VS Code.**

BezotCorp AI connects VS Code to your local AI infrastructure, allowing you to chat with your codebase, inspect files, generate modifications and keep full control over your data.

No cloud dependency. No vendor lock-in. Your code stays on your machine.

---

## Features

### AI Chat

Interact with your local AI directly from VS Code.

- Natural language conversations
- Context-aware responses
- Fast local execution

### Workspace Integration

Access information from your current workspace.

- Active file inspection
- Open files access
- Project-aware assistance

### Code Modifications

Apply changes directly from AI responses.

- Patch existing files
- Replace code blocks
- Save changes automatically

### Local First

Designed for developers who want complete control.

- No external API required
- Self-hosted infrastructure
- Privacy-first architecture

---

## Installation

Install the extension from:

- Visual Studio Marketplace
- Open VSX Registry

---

## Requirements

A running BezotCorp AI backend is required.

Default endpoints:

| Service           | Port |
| ----------------- | ---- |
| VS Code Extension | 4190 |
| IDE Bridge        | 4188 |

---

## Architecture

```text
VS Code Extension
        │
        ▼
   IDE Bridge
        │
        ▼
  BezotCorp AI
        │
        ▼
 Local Models
```

The extension acts as a lightweight bridge between VS Code and the local BezotCorp AI ecosystem.

---

## Privacy

BezotCorp AI is built with a local-first philosophy.

- Source code remains on your machine
- No mandatory cloud services
- No code sent to third parties

---

## Roadmap

### Planned

- Workspace semantic graph
- Multi-file editing
- Agent orchestration
- Local memory integration
- Code review mode
- Refactoring workflows
- Tool calling system

### Future

- Multi-agent collaboration
- Project knowledge graph
- Autonomous coding workflows
- Native Rust ecosystem integration

---

## License

MIT License

Copyright (c) BezotCorp
