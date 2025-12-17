# @hyperhive/plugin-fastify

Fastify plugin for Hyperhive - integrates the AIColony controller with Fastify applications.

## Installation

```bash
npm install @hyperhive/plugin-fastify @hyperhive/colony fastify
# or
pnpm add @hyperhive/plugin-fastify @hyperhive/colony fastify
# or
yarn add @hyperhive/plugin-fastify @hyperhive/colony fastify
```

## Usage

```typescript
import Fastify from "fastify";
import { colonyPlugin } from "@hyperhive/plugin-fastify";

const app = Fastify();

await app.register(colonyPlugin, {
  apiKey: process.env.ANTHROPIC_API_KEY,
  provider: "claude",
});

// Access the AIColony controller
app.post("/chat", async (request, reply) => {
  const { prompt, projectPath } = request.body;

  const drone = await app.colony.hatch({
    cwd: projectPath,
  });

  drone.on("message", (msg) => {
    // Stream responses...
  });

  await drone.buzz(prompt);

  return { status: "ok" };
});

await app.listen({ port: 3000 });
```

## Options

| Option          | Type                   | Default          | Description                |
| --------------- | ---------------------- | ---------------- | -------------------------- |
| `apiKey`        | `string`               | (required)       | Your API key               |
| `provider`      | `"claude" \| "openai"` | `"claude"`       | LLM provider               |
| `baseUrl`       | `string`               | Provider default | API base URL               |
| `timeout`       | `number`               | `30000`          | Request timeout in ms      |
| `decoratorName` | `string`               | `"colony"`       | Name for Fastify decorator |

## TypeScript

For TypeScript support, extend Fastify's type definitions:

```typescript
import { AIColony } from "@hyperhive/colony";

declare module "fastify" {
  interface FastifyInstance {
    colony: AIColony;
  }
}
```

## License

MIT
