# BezotCorp AI

![BezotCorp AI](assets/banner.png)

**A configurable AI coding assistant for VS Code.**

BezotCorp AI connects VS Code to AI backends, allowing you to chat with your codebase, inspect files, generate modifications and integrate your own local or remote AI infrastructure.

Use your own backend today. Connect to the official BezotCorp platform in the future.

---

## Features

### AI Chat

Interact with AI directly from VS Code.

- Natural language conversations
- Context-aware responses
- Backend agnostic design

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

### Flexible Backends

Choose how BezotCorp AI connects.

- Local self-hosted backend
- Remote backend
- Custom infrastructure
- Future BezotCorp managed backend

---

## Installation

Install the extension from:

- Visual Studio Marketplace
- Open VSX Registry

---

## Configuration

BezotCorp AI supports multiple backend modes.

### Custom Backend

Configure your own backend URL:

```json
{
  "bezotcorpAi.backendMode": "custom",
  "bezotcorpAi.backendUrl": "http://127.0.0.1:4188"
}
```

### BezotCorp Backend

```json
{
  "bezotcorpAi.backendMode": "bezotcorp"
}
```

The hosted BezotCorp backend is planned but not available yet.

---

## Architecture

```text
VS Code Extension
        │
        ▼
  Configurable Backend
        │
        ├── Local Backend
        ├── Remote Backend
        └── Future BezotCorp Backend
```

The extension acts as a lightweight integration layer between VS Code and AI systems.

---

## Privacy

BezotCorp AI does not require any cloud service.

Privacy depends on the backend you choose.

- Self-hosted backend → your data stays under your control
- Remote backend → privacy depends on your provider
- Future BezotCorp backend → policy will be documented separately

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
