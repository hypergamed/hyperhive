# Hyperhive

A provider-agnostic LLM Agent SDK wrapper library for building AI-powered applications.

[![CI](https://github.com/Hypergamed/Hyperhive/actions/workflows/ci.yml/badge.svg)](https://github.com/Hypergamed/Hyperhive/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@hyperhive/colony.svg)](https://www.npmjs.com/package/@hyperhive/colony)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Nomenclature

Hyperhive uses bee-inspired naming:

| Term         | Meaning                                                                |
| ------------ | ---------------------------------------------------------------------- |
| **AIColony** | The colony controller - manages all drones across providers            |
| **Drone**    | Autonomous agent that executes tasks (e.g., `claudeDrone`, `gptDrone`) |
| **buzz()**   | How drones communicate - sending prompts to the LLM                    |

## Packages

| Package                                                 | Description    | npm                                                                                                                           |
| ------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| [@hyperhive/colony](./packages/colony)                  | Core library   | [![npm](https://img.shields.io/npm/v/@hyperhive/colony.svg)](https://www.npmjs.com/package/@hyperhive/colony)                 |
| [@hyperhive/plugin-fastify](./packages/plugins/fastify) | Fastify plugin | [![npm](https://img.shields.io/npm/v/@hyperhive/plugin-fastify.svg)](https://www.npmjs.com/package/@hyperhive/plugin-fastify) |

## Quick Start

### Installation

```bash
# Core library
npm install @hyperhive/colony

# With Fastify
npm install @hyperhive/colony @hyperhive/plugin-fastify fastify
```

### Basic Usage

```typescript
import { AIColony } from "@hyperhive/colony";

// Create the colony controller
const colony = new AIColony({
  apiKey: process.env.ANTHROPIC_API_KEY,
  provider: "claude",
});

// Hatch a Drone (create LLM session)
const claudeDrone = await colony.hatch({
  cwd: "/path/to/project",
});

// Listen to messages
claudeDrone.on("message", (msg) => {
  console.log("AI:", msg.content);
});

// Send a prompt with buzz()
await claudeDrone.buzz("Fix the authentication bug");
```

### Fastify Integration

```typescript
import Fastify from "fastify";
import { colonyPlugin } from "@hyperhive/plugin-fastify";

const app = Fastify();

await app.register(colonyPlugin, {
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Access via app.colony
const drone = await app.colony.hatch({ cwd: "/project" });

await app.listen({ port: 3000 });
```

## Development

### Prerequisites

- Node.js 22+
- pnpm 9+

### Setup

```bash
# Clone repository
git clone https://github.com/Hypergamed/Hyperhive.git
cd Hyperhive

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Scripts

| Script           | Description                       |
| ---------------- | --------------------------------- |
| `pnpm build`     | Build all packages                |
| `pnpm test`      | Run all tests                     |
| `pnpm lint`      | Lint all packages                 |
| `pnpm format`    | Format code with Prettier         |
| `pnpm typecheck` | Run TypeScript type checking      |
| `pnpm changeset` | Create a changeset for versioning |

### Creating a Changeset

When making changes that should be released:

```bash
pnpm changeset
```

Follow the prompts to:

1. Select changed packages
2. Choose version bump type (major/minor/patch)
3. Write a summary of changes

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `chore:` Maintenance tasks
- `refactor:` Code refactoring
- `test:` Test additions/changes

## License

MIT
