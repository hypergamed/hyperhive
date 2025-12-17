# @hyperhive/colony

Core library for Hyperhive - an LLM Agent SDK wrapper.

## Nomenclature

- **AIColony**: The central controller that manages all LLM sessions
- **Drone**: An autonomous agent - the active LLM session (e.g., `claudeDrone`, `gptDrone`)
- **buzz()**: Method to send prompts to the LLM

## Installation

```bash
npm install @hyperhive/colony
# or
pnpm add @hyperhive/colony
# or
yarn add @hyperhive/colony
```

## Usage

```typescript
import { AIColony } from "@hyperhive/colony";

// Create the central controller
const colony = new AIColony({
  apiKey: process.env.ANTHROPIC_API_KEY,
  provider: "claude", // or "openai"
});

// Hatch a Drone (create LLM session)
const claudeDrone = await colony.hatch({
  cwd: "/path/to/project",
  model: "balanced",
});

// Listen to events
claudeDrone.on("message", (msg) => {
  console.log("AI:", msg.content);
});

claudeDrone.on("tool:start", ({ tool }) => {
  console.log(`Running ${tool}...`);
});

claudeDrone.on("complete", ({ usage }) => {
  console.log(`Cost: $${usage.costUsd.toFixed(4)}`);
});

// Send a prompt with buzz()
await claudeDrone.buzz("Fix the authentication bug in auth.ts");

// Get conversation history
const messages = claudeDrone.getMessages();

// Clean up
await colony.retire(claudeDrone.id);
```

## Configuration

### AIColony Options

| Option     | Type                   | Default          | Description           |
| ---------- | ---------------------- | ---------------- | --------------------- |
| `apiKey`   | `string`               | (required)       | Your API key          |
| `provider` | `"claude" \| "openai"` | `"claude"`       | LLM provider          |
| `baseUrl`  | `string`               | Provider default | API base URL          |
| `timeout`  | `number`               | `30000`          | Request timeout in ms |

### Drone Options

| Option         | Type                                 | Default      | Description       |
| -------------- | ------------------------------------ | ------------ | ----------------- |
| `cwd`          | `string`                             | (required)   | Working directory |
| `model`        | `"fast" \| "balanced" \| "powerful"` | `"balanced"` | Model tier        |
| `tools`        | `string[]`                           | `[]`         | Available tools   |
| `systemPrompt` | `string`                             | `""`         | System prompt     |
| `metadata`     | `Record<string, unknown>`            | `{}`         | Custom metadata   |

## Events

### Drone Events

| Event        | Payload            | Description              |
| ------------ | ------------------ | ------------------------ |
| `message`    | `AssistantMessage` | New message from the LLM |
| `tool:start` | `ToolStartEvent`   | Tool execution started   |
| `tool:end`   | `ToolEndEvent`     | Tool execution completed |
| `status`     | `DroneStatus`      | Status changed           |
| `complete`   | `CompleteEvent`    | Operation completed      |
| `error`      | `Error`            | Error occurred           |

### AIColony Events

| Event           | Payload         | Description        |
| --------------- | --------------- | ------------------ |
| `drone:hatched` | `Drone`         | New Drone hatched  |
| `drone:retired` | `string`        | Drone retired (ID) |
| `error`         | `Error, Drone?` | Error occurred     |

## License

MIT
