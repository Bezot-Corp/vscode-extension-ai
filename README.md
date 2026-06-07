# BezotCorp AI

![BezotCorp AI](assets/banner.png)

**A configurable AI coding assistant for VS Code.**

BezotCorp AI connects VS Code to local or remote AI providers and gives AI assistants access to your workspace context directly inside VS Code.

Use Ollama today, connect your own backend, or integrate future BezotCorp services.

---

## Features

### AI Chat

Chat directly with AI inside VS Code.

- Streaming responses
- Context-aware conversations
- Provider abstraction
- Backend health monitoring

### Workspace Context

Provide useful context to the AI.

- Active file support
- Open files support
- Rich workspace context
- Context preview before requests

### AI Providers

Supported providers:

- Ollama
- Custom Backend
- Future BezotCorp Backend

### Connection Management

Built-in backend monitoring.

- Connection testing
- Status indicator
- Provider diagnostics

### Local First

Keep full control of your infrastructure.

- Self-hosted AI support
- Local models with Ollama
- Remote backends supported
- No mandatory cloud dependency

---

## Installation

Install the extension from:

- Visual Studio Marketplace
- Open VSX Registry

---

## Configuration

### To Ollama

```json
{
  "bezotcorpAi.provider": "ollama",
  "bezotcorpAi.providerUrl": "http://127.0.0.1:11434",
  "bezotcorpAi.model": "qwen2.5-coder:7b"
}
```

### To Custom Backend

```json
{
  "bezotcorpAi.provider": "customBackend",
  "bezotcorpAi.providerUrl": "http://127.0.0.1:4188"
}
```

### To Context Mode

```json
{
  "bezotcorpAi.contextMode": "basic"
}
```

Available modes:

- `basic`
- `rich`

---

## Commands

### Open Chat

```text
BezotCorp AI: Open Chat
```

### Open Settings

```text
BezotCorp AI: Open Settings
```

---

## Architecture

```text
VS Code Extension
        │
        ▼
    AI Provider
        │
        ├── Ollama
        ├── Custom Backend
        └── Future BezotCorp Backend
```

The extension manages context collection, provider integration and streaming responses directly inside VS Code.

---

## Privacy

BezotCorp AI does not require any cloud service.

Privacy depends on the provider you choose.

### Ollama

- Local execution
- Local models
- Local data

### Custom Backend

- Privacy depends on your infrastructure

### Future BezotCorp Backend

- Policy will be documented separately

---

## Current Features

### Implemented

- AI chat
- Streaming responses
- Active file context
- Open files context
- Context preview
- Backend status monitoring
- Connection testing
- Ollama integration
- Custom backend integration
- VS Code commands

### Planned

- Chat history persistence
- Patch preview
- Multi-file editing
- Workspace semantic graph
- Tool calling
- Agent orchestration
- Memory integration

### Future

- Multi-agent collaboration
- Autonomous coding workflows
- Project knowledge graph
- Native Rust ecosystem integration

---

## License

MIT License

Copyright (c) BezotCorp
