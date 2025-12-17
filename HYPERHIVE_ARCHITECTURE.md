# Hyperhive - Architecture Document

## Project Overview

| Property | Value |
|----------|-------|
| **Name** | Hyperhive |
| **npm Package** | `@hyperhive/colony` |
| **GitHub** | `github.com/Hypergamed/Hyperhive` |
| **License** | MIT |
| **Description** | A TypeScript library wrapping the Claude Agent SDK with clean, event-driven API |

### Why "Hyperhive"?

- **Hyper** - Enhanced, supercharged, high-performance
- **Hive** - Collective intelligence, coordinated agents working together (fauna reference)
- Together: A supercharged AI agent swarm for building intelligent applications

---

## Executive Summary

A TypeScript library that provides a clean, event-driven abstraction layer over the official Claude Agent SDK. Unlike standalone servers, this library is designed to be **embedded into existing applications**, giving developers full control over authentication, storage, and transport while handling the complexity of session management, streaming, and configuration.

### Core Philosophy

```
┌─────────────────────────────────────────────────────────────────┐
│                      DESIGN PRINCIPLES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. COMPOSABLE      - Works with any Node.js application        │
│  2. TRANSPORT-FREE  - No opinions on WebSocket, SSE, HTTP       │
│  3. STORAGE-FREE    - No opinions on database or cache          │
│  4. AUTH-FREE       - No opinions on authentication             │
│  5. LAYERED         - Use only what you need                    │
│  6. PLUGGABLE       - Extend with adapters and plugins          │
│  7. TYPE-SAFE       - Full TypeScript support                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Problem Statement

The official Claude Agent SDK is powerful but low-level:
- Returns async iterators requiring manual message handling
- No built-in session management across multiple instances
- Configuration must be passed on every call
- No event-based API for easy UI integration
- Developers rebuild the same abstractions repeatedly

Existing community solutions are **standalone servers** that:
- Dictate authentication mechanisms
- Bundle specific storage solutions
- Couple WebSocket implementations
- Don't integrate cleanly into existing applications

### Solution

A **middleware library** that:
- Wraps Claude Agent SDK with clean, event-driven API
- Manages session lifecycle
- Provides configuration layering
- Remains completely agnostic to transport, storage, and auth
- Integrates into any Node.js application as a dependency

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           YOUR APPLICATION                                   │
│              (Fastify, Express, Next.js, NestJS, Hono, etc.)                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│   │   Your Auth  │  │ Your Storage │  │  Your APIs   │  │Your WebSocket│   │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│          │                 │                 │                 │            │
│          └─────────────────┴─────────────────┴─────────────────┘            │
│                                      │                                       │
│                                      │ uses                                  │
│                                      ▼                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                      │   │
│   │                        @hyperhive/colony                             │   │
│   │                                                                      │   │
│   │   ┌─────────────────────────────────────────────────────────────┐   │   │
│   │   │                       AIColony                               │   │   │
│   │   │                                                              │   │   │
│   │   │  • Drone factory (hatch, recall, retire)                    │   │   │
│   │   │  • Configuration management                                  │   │   │
│   │   │  • Plugin system                                            │   │   │
│   │   │  • Global event bus                                          │   │   │
│   │   └─────────────────────────────────────────────────────────────┘   │   │
│   │                                │                                     │   │
│   │                                │ manages                             │   │
│   │                                ▼                                     │   │
│   │   ┌─────────────────────────────────────────────────────────────┐   │   │
│   │   │                        Drone                                 │   │   │
│   │   │                                                              │   │   │
│   │   │  • Event emitter (message, tool:start, tool:end, etc.)      │   │   │
│   │   │  • Prompt handling (buzz, interrupt)                        │   │   │
│   │   │  • Message history                                          │   │   │
│   │   │  • Status tracking                                          │   │   │
│   │   │  • Serialization                                            │   │   │
│   │   └─────────────────────────────────────────────────────────────┘   │   │
│   │                                │                                     │   │
│   └────────────────────────────────│─────────────────────────────────────┘   │
│                                    │                                         │
└────────────────────────────────────│─────────────────────────────────────────┘
                                     │ wraps
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      @anthropic-ai/claude-agent-sdk                          │
│                                                                              │
│                    (Official Anthropic SDK - unchanged)                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Roadmap

### Phase Overview

```
Phase 8: Advanced AI Features
    │
Phase 7: Testing & Development Tools
    │
Phase 6: Multi-Agent & Orchestration
    │
Phase 5: Security & Isolation
    │
Phase 4: Observability
    │
Phase 3: Persistence & State
    │
Phase 2: Framework Integrations
    │
Phase 1: MVP + Quick Wins   ← START HERE
```

Each phase builds on previous phases. Later phases can be developed in parallel once MVP is stable.

---

## Phase 1: MVP + Quick Wins

### 1.1 MVP - Core Library

The minimum viable implementation that provides value over raw SDK usage.

#### Goals
- Clean, event-based API for session interaction
- Session lifecycle management
- Configuration with sensible defaults
- In-memory message history
- Full TypeScript support

#### Core Classes

##### AIColony

The colony controller - main entry point for managing drones.

```typescript
interface ColonyConfig {
  // Default configuration applied to all drones
  defaults?: {
    model?: 'sonnet' | 'opus' | 'haiku';
    tools?: string[];
    permissionMode?: 'acceptEdits' | 'plan' | 'bypassPermissions';
    maxThinkingTokens?: number;
  };

  // Custom agents available to all drones
  agents?: Record<string, AgentDefinition>;

  // Global hooks
  hooks?: {
    beforeHatch?: (options: DroneConfig) => DroneConfig | Promise<DroneConfig>;
    afterHatch?: (drone: Drone) => void | Promise<void>;
    beforeBuzz?: (prompt: string, drone: Drone) => string | Promise<string>;
    afterComplete?: (result: CompleteResult, drone: Drone) => void | Promise<void>;
  };
}

class AIColony {
  constructor(options?: ColonyConfig);

  // Drone management
  hatch(options: DroneConfig): Promise<Drone>;
  recall(droneId: string, options?: Partial<DroneConfig>): Promise<Drone>;
  getDrone(droneId: string): Drone | undefined;
  retire(droneId: string): Promise<void>;
  listDrones(): DroneInfo[];

  // Configuration
  getDefaults(): ColonyConfig['defaults'];
  setDefaults(defaults: ColonyConfig['defaults']): void;

  // Global events (all drones)
  on(event: 'drone:hatched', handler: (drone: Drone) => void): this;
  on(event: 'drone:retired', handler: (droneId: string) => void): this;
  on(event: 'error', handler: (error: Error, drone?: Drone) => void): this;
}
```

##### Drone

Represents an active LLM session - an autonomous agent that executes tasks.

```typescript
interface DroneConfig {
  // Required
  cwd: string;

  // Optional overrides
  model?: 'sonnet' | 'opus' | 'haiku';
  tools?: string[];
  permissionMode?: 'acceptEdits' | 'plan' | 'bypassPermissions';
  maxThinkingTokens?: number;
  systemPrompt?: string;

  // Custom agents for this drone
  agents?: Record<string, AgentDefinition>;

  // MCP servers
  mcpServers?: McpServerConfig[];

  // Metadata (passed through, not used by library)
  metadata?: Record<string, unknown>;
}

interface AgentDefinition {
  description: string;
  prompt?: string;
  tools?: string[];
  model?: 'sonnet' | 'opus' | 'haiku';
}

interface McpServerConfig {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

type DroneStatus = 'idle' | 'thinking' | 'tool_running' | 'error';

class Drone extends EventEmitter {
  // Properties
  readonly id: string;
  readonly cwd: string;
  readonly status: DroneStatus;
  readonly createdAt: Date;
  readonly metadata: Record<string, unknown>;

  // Interaction
  buzz(prompt: string): Promise<void>;
  interrupt(): Promise<void>;
  retire(): Promise<void>;

  // History
  getMessages(options?: { limit?: number; offset?: number }): Message[];
  getLastMessage(): Message | undefined;
  clearMessages(): void;

  // Events
  on(event: 'message', handler: (message: AssistantMessage) => void): this;
  on(event: 'tool:start', handler: (data: ToolStartEvent) => void): this;
  on(event: 'tool:end', handler: (data: ToolEndEvent) => void): this;
  on(event: 'status', handler: (status: DroneStatus) => void): this;
  on(event: 'complete', handler: (data: CompleteEvent) => void): this;
  on(event: 'error', handler: (error: Error) => void): this;
}
```

##### Event Types

```typescript
interface AssistantMessage {
  id: string;
  role: 'assistant';
  content: string;
  timestamp: Date;
}

interface ToolStartEvent {
  id: string;
  tool: string;
  input: Record<string, unknown>;
  timestamp: Date;
}

interface ToolEndEvent {
  id: string;
  tool: string;
  input: Record<string, unknown>;
  result: unknown;
  isError: boolean;
  durationMs: number;
  timestamp: Date;
}

interface CompleteEvent {
  success: boolean;
  usage: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
  };
  durationMs: number;
  timestamp: Date;
}

type Message = AssistantMessage | ToolUseMessage | ToolResultMessage;
```

#### Usage Example

```typescript
import { AIColony } from '@hyperhive/colony';

// Initialize once in your app
const colony = new AIColony({
  defaults: {
    model: 'sonnet',
    tools: ['Read', 'Edit', 'Bash', 'Glob', 'Grep', 'Task'],
    permissionMode: 'acceptEdits',
  },
});

// Hatch a Drone (create LLM session)
const claudeDrone = await colony.hatch({
  cwd: '/path/to/project',
  metadata: { userId: 'user-123' },
});

// Listen to events
claudeDrone.on('message', (msg) => {
  console.log('Claude:', msg.content);
});

claudeDrone.on('tool:start', ({ tool, input }) => {
  console.log(`Running ${tool}...`);
});

claudeDrone.on('tool:end', ({ tool, durationMs }) => {
  console.log(`${tool} completed in ${durationMs}ms`);
});

claudeDrone.on('complete', ({ usage }) => {
  console.log(`Done! Cost: $${usage.costUsd.toFixed(4)}`);
});

claudeDrone.on('error', (err) => {
  console.error('Error:', err.message);
});

// Send prompt with buzz()
await claudeDrone.buzz('Fix the authentication bug in auth.ts');

// Get history
const messages = claudeDrone.getMessages();

// Cleanup
await claudeDrone.retire();
```

#### File Structure

```
src/
├── index.ts                 # Public exports
├── colony.ts                # AIColony class
├── drone.ts                 # Drone class
├── types.ts                 # TypeScript interfaces
├── errors.ts                # Custom error classes
└── utils/
    ├── id.ts                # ID generation
    └── events.ts            # Event helpers
```

#### Implementation Notes

1. **SDK Integration**: Use `query()` function from `@anthropic-ai/claude-agent-sdk`, iterate over async generator, emit events for each message type.

2. **Drone Tracking**: Simple `Map<string, Drone>` for MVP. No persistence.

3. **Message History**: Array in memory, with configurable max size to prevent memory issues.

4. **Error Handling**: Wrap SDK errors in custom error classes with context.

5. **Interruption**: Use SDK's `interrupt()` method on the query instance.

---

### 1.2 Quick Wins

Enhancements that add significant value with minimal effort, built on MVP foundation.

#### Partial Message Streaming

Enable token-by-token streaming for real-time UI updates.

```typescript
// Enable in drone options
const claudeDrone = await colony.hatch({
  cwd: '/project',
  streaming: {
    partial: true,  // Enable partial messages
  },
});

// Listen to partial updates
claudeDrone.on('message:partial', (chunk: string) => {
  process.stdout.write(chunk);
});

// Full message still emitted when complete
claudeDrone.on('message', (msg) => {
  console.log('\nComplete:', msg.content);
});
```

**Implementation**: Use `includePartialMessages` option in SDK query.

#### Convenience Methods

High-level methods for common operations.

```typescript
class Drone {
  // Ask and get string response
  async ask(question: string): Promise<string>;

  // Edit files and get list of changed files
  async edit(instruction: string): Promise<{ filesChanged: string[] }>;

  // Run command and get output
  async run(command: string): Promise<{ exitCode: number; output: string }>;

  // Review code and get structured feedback
  async review(instruction: string): Promise<{
    approved: boolean;
    comments: string[];
  }>;
}

// Usage
const answer = await claudeDrone.ask('What does the auth module do?');
const { filesChanged } = await claudeDrone.edit('Add input validation to login form');
const { exitCode } = await claudeDrone.run('npm test');
```

**Implementation**: Wrapper methods that call `buzz()` and parse the response.

#### Drone Serialization

Enable drone state to be saved and restored.

```typescript
// Serialize drone state
const snapshot = claudeDrone.serialize();
// Returns: { id, cwd, messages, config, sdkSessionId }

// Save to your storage
await db.drones.update(claudeDrone.id, { snapshot });

// Later: restore drone
const restored = await colony.restoreDrone(snapshot);

// Or use SDK's native resume
const recalled = await colony.recall(snapshot.sdkSessionId);
```

**Implementation**: Serialize drone config and use SDK's session resumption feature.

#### Prompt Templates

Pre-built templates for common agent types.

```typescript
import { templates } from '@hyperhive/colony';

const claudeDrone = await colony.hatch({
  cwd: '/project',
  systemPrompt: templates.codeReviewer({
    language: 'typescript',
    strictness: 'high',
    focusAreas: ['security', 'performance'],
  }),
});

// Available templates
templates.codeReviewer(options)
templates.bugFixer(options)
templates.testWriter(options)
templates.documentationWriter(options)
templates.refactorer(options)
templates.securityAuditor(options)
```

**Implementation**: String template functions that generate system prompts.

#### Configuration Validation

Validate options and provide helpful error messages.

```typescript
import { validateConfig, ConfigError } from '@hyperhive/colony';

try {
  const claudeDrone = await colony.hatch({
    cwd: '/nonexistent/path',  // Error: path doesn't exist
    tools: ['InvalidTool'],     // Error: unknown tool
    model: 'gpt-4',             // Error: invalid model
  });
} catch (err) {
  if (err instanceof ConfigError) {
    console.log(err.field);    // 'cwd'
    console.log(err.message);  // 'Directory does not exist: /nonexistent/path'
    console.log(err.suggestion); // 'Check that the path exists and is accessible'
  }
}
```

**Implementation**: Validation layer before passing to SDK.

---

## Phase 2: Framework Integrations

Optional packages that provide ready-to-use integrations with popular frameworks.

### 2.1 Fastify Plugin

```typescript
// Package: @hyperhive/plugin-fastify

import fastify from 'fastify';
import { colonyPlugin } from '@hyperhive/plugin-fastify';
import { AIColony } from '@hyperhive/colony';

const colony = new AIColony({ /* ... */ });
const app = fastify();

app.register(colonyPlugin, {
  colony,
  prefix: '/api/colony',

  // Required: Your authorization logic
  authorize: async (request) => {
    const user = await verifyToken(request.headers.authorization);
    if (!user) throw new Error('Unauthorized');

    return {
      userId: user.id,
      // Restrict which paths this user can access
      allowedPaths: [`/projects/${user.id}`],
      // Custom metadata attached to drones
      metadata: { userId: user.id, plan: user.plan },
    };
  },

  // Optional: Lifecycle hooks
  hooks: {
    onDroneHatched: async (drone, context) => {
      await db.drones.create({
        id: drone.id,
        userId: context.userId,
        projectPath: drone.cwd,
      });
    },

    onDroneRetired: async (droneId, context) => {
      await db.drones.delete(droneId);
    },

    onMessage: async (drone, message, context) => {
      // Optionally persist messages
      await db.messages.create({
        droneId: drone.id,
        ...message,
      });
    },

    onComplete: async (drone, result, context) => {
      // Track usage
      await db.usage.create({
        userId: context.userId,
        droneId: drone.id,
        tokens: result.usage.inputTokens + result.usage.outputTokens,
        cost: result.usage.costUsd,
      });
    },
  },
});

await app.listen({ port: 3000 });
```

#### Generated Routes

```yaml
POST /api/colony/drones
  Body: { projectPath: string, config?: DroneConfig }
  Response: { droneId: string, status: string }

GET /api/colony/drones
  Response: { drones: DroneInfo[] }

GET /api/colony/drones/:id
  Response: { drone: DroneInfo, messages: Message[] }

DELETE /api/colony/drones/:id
  Response: { success: boolean }

POST /api/colony/drones/:id/buzz
  Body: { content: string }
  Response: { acknowledged: boolean }

POST /api/colony/drones/:id/interrupt
  Response: { interrupted: boolean }

# WebSocket
GET /api/colony/drones/:id/ws
  Upgrade: websocket
  Messages:
    Client -> Server: { type: 'buzz', content: string }
    Client -> Server: { type: 'interrupt' }
    Server -> Client: { type: 'message', data: AssistantMessage }
    Server -> Client: { type: 'tool:start', data: ToolStartEvent }
    Server -> Client: { type: 'tool:end', data: ToolEndEvent }
    Server -> Client: { type: 'status', data: DroneStatus }
    Server -> Client: { type: 'complete', data: CompleteEvent }
    Server -> Client: { type: 'error', data: { message: string } }
```

#### WebSocket Protocol

```typescript
// Client -> Server
interface ClientMessage {
  type: 'buzz' | 'interrupt' | 'ping';
  content?: string;
}

// Server -> Client
interface ServerMessage {
  type: 'connected' | 'message' | 'message:partial' | 'tool:start' |
        'tool:end' | 'status' | 'complete' | 'error' | 'pong';
  data: unknown;
  timestamp: string;
}
```

---

### 2.2 Express Middleware

```typescript
// Package: @hyperhive/plugin-express

import express from 'express';
import { createColonyRouter } from '@hyperhive/plugin-express';
import { AIColony } from '@hyperhive/colony';

const colony = new AIColony({ /* ... */ });
const app = express();

app.use('/api/colony', createColonyRouter(colony, {
  authorize: async (req) => {
    // Same interface as Fastify
  },
  hooks: { /* ... */ },
}));

app.listen(3000);
```

---

### 2.3 Next.js Integration

```typescript
// Package: @hyperhive/plugin-nextjs

// app/api/colony/[...path]/route.ts
import { createNextHandler } from '@hyperhive/plugin-nextjs';
import { colony } from '@/lib/colony';

export const { GET, POST, DELETE } = createNextHandler(colony, {
  authorize: async (request) => {
    const session = await getServerSession(authOptions);
    if (!session) throw new Error('Unauthorized');
    return { userId: session.user.id };
  },
});

// Client-side hook
// components/Chat.tsx
'use client';
import { useDrone } from '@hyperhive/plugin-nextjs/client';

export function Chat({ droneId }: { droneId: string }) {
  const {
    messages,
    status,
    buzz,
    interrupt,
    isConnected,
  } = useDrone(droneId);

  return (
    <div>
      {messages.map(m => <Message key={m.id} {...m} />)}
      <form onSubmit={(e) => {
        e.preventDefault();
        buzz(e.currentTarget.prompt.value);
      }}>
        <input name="prompt" />
        <button type="submit" disabled={status !== 'idle'}>Send</button>
        {status !== 'idle' && (
          <button type="button" onClick={interrupt}>Stop</button>
        )}
      </form>
    </div>
  );
}
```

---

### 2.4 tRPC Integration

```typescript
// Package: @hyperhive/plugin-trpc

import { initTRPC } from '@trpc/server';
import { createColonyRouter } from '@hyperhive/plugin-trpc';
import { colony } from './colony';

const t = initTRPC.context<Context>().create();

export const appRouter = t.router({
  colony: createColonyRouter(t, colony, {
    authorize: async ({ ctx }) => ({ userId: ctx.user.id }),
  }),
});

// Client usage
const utils = trpc.useUtils();

// Hatch drone
const hatchDrone = trpc.colony.hatch.useMutation();
const drone = await hatchDrone.mutateAsync({
  projectPath: '/my/project'
});

// Subscribe to messages (WebSocket)
trpc.colony.messages.useSubscription(
  { droneId: drone.id },
  {
    onData: (message) => {
      // Handle real-time messages
    },
  }
);

// Buzz prompt
const buzz = trpc.colony.buzz.useMutation();
await buzz.mutateAsync({
  droneId: drone.id,
  content: 'Fix the bug'
});
```

---

### 2.5 NestJS Module

```typescript
// Package: @hyperhive/plugin-nestjs

import { Module } from '@nestjs/common';
import { ColonyModule } from '@hyperhive/plugin-nestjs';

@Module({
  imports: [
    ColonyModule.forRoot({
      defaults: {
        model: 'sonnet',
        tools: ['Read', 'Edit', 'Bash'],
      },
    }),
  ],
})
export class AppModule {}

// In a service
@Injectable()
export class CodingService {
  constructor(private colony: ColonyService) {}

  async reviewCode(projectPath: string) {
    const drone = await this.colony.hatch({ cwd: projectPath });

    drone.on('complete', (result) => {
      // Handle completion
    });

    await drone.buzz('Review the code for security issues');
  }
}

// With guards
@Controller('colony')
@UseGuards(ColonyAuthGuard)
export class ColonyController {
  constructor(private colony: ColonyService) {}

  @Post('drones')
  async hatchDrone(@Body() dto: HatchDroneDto, @User() user: UserEntity) {
    return this.colony.hatch({
      cwd: dto.projectPath,
      metadata: { userId: user.id },
    });
  }
}
```

---

### 2.6 Hono Integration

```typescript
// Package: @hyperhive/plugin-hono

import { Hono } from 'hono';
import { createColonyRoutes } from '@hyperhive/plugin-hono';
import { colony } from './colony';

const app = new Hono();

app.route('/api/colony', createColonyRoutes(colony, {
  authorize: async (c) => {
    const user = c.get('user');
    return { userId: user.id };
  },
}));

export default app;
```

---

## Phase 3: Persistence & State

Enable drones and messages to survive restarts and scale across multiple instances.

### 3.1 Storage Adapter Interface

```typescript
// Core library defines the interface
interface DroneStore {
  // Drone state
  save(drone: SerializedDrone): Promise<void>;
  load(droneId: string): Promise<SerializedDrone | null>;
  delete(droneId: string): Promise<void>;
  list(filter?: DroneFilter): Promise<SerializedDrone[]>;

  // Distributed locking (for multi-instance)
  acquireLock(droneId: string, ttlMs: number): Promise<boolean>;
  releaseLock(droneId: string): Promise<void>;

  // Pub/Sub (for multi-instance event sync)
  publish(droneId: string, event: DroneEvent): Promise<void>;
  subscribe(droneId: string, handler: (event: DroneEvent) => void): () => void;
}

interface MessageStore {
  append(droneId: string, message: Message): Promise<void>;
  getMessages(droneId: string, options?: { limit?: number; before?: string }): Promise<Message[]>;
  clear(droneId: string): Promise<void>;
  delete(droneId: string): Promise<void>;
}

interface SerializedDrone {
  id: string;
  cwd: string;
  status: DroneStatus;
  config: DroneConfig;
  sdkSessionId?: string;
  createdAt: string;
  lastActivityAt: string;
  metadata: Record<string, unknown>;
}
```

### 3.2 Redis Adapter

```typescript
// Package: @hyperhive/storage-redis

import { AIColony } from '@hyperhive/colony';
import { RedisDroneStore, RedisMessageStore } from '@hyperhive/storage-redis';

const colony = new AIColony({
  droneStore: new RedisDroneStore({
    url: 'redis://localhost:6379',
    prefix: 'colony:drones:',
    ttl: 3600 * 24, // 24 hours
  }),

  messageStore: new RedisMessageStore({
    url: 'redis://localhost:6379',
    prefix: 'colony:messages:',
    maxMessages: 1000, // Per drone
  }),
});

// Drones now survive restarts
// Messages are persisted automatically
// Multiple instances can share drones via pub/sub
```

#### Redis Data Structures

```
# Drone state (Hash)
colony:drones:{droneId}
  id: string
  cwd: string
  status: string
  config: JSON
  sdkSessionId: string
  createdAt: ISO timestamp
  lastActivityAt: ISO timestamp
  metadata: JSON

# Drone lock (String with TTL)
colony:drones:{droneId}:lock -> instanceId

# Messages (List, capped with LTRIM)
colony:messages:{droneId}
  [0]: JSON message
  [1]: JSON message
  ...

# Pub/Sub channels
colony:events:{droneId}
```

---

### 3.3 PostgreSQL Adapter

```typescript
// Package: @hyperhive/storage-postgres

import { AIColony } from '@hyperhive/colony';
import { PostgresDroneStore, PostgresMessageStore } from '@hyperhive/storage-postgres';

const colony = new AIColony({
  droneStore: new PostgresDroneStore({
    connectionString: process.env.DATABASE_URL,
    tableName: 'colony_drones',
  }),

  messageStore: new PostgresMessageStore({
    connectionString: process.env.DATABASE_URL,
    tableName: 'colony_messages',
  }),
});
```

#### Schema

```sql
-- Drones table
CREATE TABLE colony_drones (
  id UUID PRIMARY KEY,
  cwd TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  config JSONB NOT NULL DEFAULT '{}',
  sdk_session_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- For multi-instance locking
  locked_by TEXT,
  locked_until TIMESTAMPTZ
);

-- Messages table
CREATE TABLE colony_messages (
  id UUID PRIMARY KEY,
  drone_id UUID NOT NULL REFERENCES colony_drones(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content JSONB NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- For pagination
  sequence_num SERIAL
);

CREATE INDEX idx_messages_drone_seq ON colony_messages(drone_id, sequence_num DESC);

-- Pub/Sub via LISTEN/NOTIFY
CREATE OR REPLACE FUNCTION notify_drone_event()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('colony_events', json_build_object(
    'drone_id', NEW.drone_id,
    'type', TG_ARGV[0],
    'data', row_to_json(NEW)
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

### 3.4 SQLite Adapter (Development/Single Instance)

```typescript
// Package: @hyperhive/storage-sqlite

import { SqliteStore } from '@hyperhive/storage-sqlite';

const colony = new AIColony({
  droneStore: new SqliteStore({
    path: './colony-drones.db',
  }),
  messageStore: new SqliteStore({
    path: './colony-drones.db',
  }),
});
```

---

### 3.5 Drone Checkpoints & Forking

Advanced drone state management.

```typescript
// Create checkpoint (saves current state)
const checkpoint = await claudeDrone.checkpoint('before-refactor');
// Returns: { id: 'chk_xxx', name: 'before-refactor', timestamp: Date }

// List checkpoints
const checkpoints = await claudeDrone.listCheckpoints();

// Restore to checkpoint (discards current state)
await claudeDrone.restore(checkpoint.id);

// Fork drone (create new drone from checkpoint)
const fork = await claudeDrone.fork({
  checkpoint: checkpoint.id, // Optional: fork from checkpoint
  name: 'alternative-approach',
});

// Now you have two independent drones
await claudeDrone.buzz('Refactor using classes');
await fork.buzz('Refactor using functions');

// Compare results
const droneResult = claudeDrone.getMessages();
const forkResult = fork.getMessages();
```

**Implementation**: Store checkpoint as snapshot of drone state and message history. Fork creates new drone with copied state.

---

## Phase 4: Observability

Comprehensive monitoring, metrics, and tracing capabilities.

### 4.1 Built-in Metrics

```typescript
// Core library provides metrics interface
interface Metrics {
  // Counters
  dronesHatched: Counter;
  dronesRetired: Counter;
  buzzSent: Counter;
  toolExecutions: Counter<{ tool: string; status: 'success' | 'error' }>;

  // Gauges
  activeDrones: Gauge;

  // Histograms
  buzzDuration: Histogram;
  toolDuration: Histogram<{ tool: string }>;
  tokenUsage: Histogram<{ type: 'input' | 'output' }>;

  // Cost tracking
  costTotal: Counter<{ model: string }>;
}

// Enable metrics collection
const colony = new AIColony({
  metrics: {
    enabled: true,
    prefix: 'hyperhive_',
  },
});

// Access metrics
const metrics = colony.getMetrics();
console.log('Active drones:', metrics.activeDrones.get());
console.log('Total cost:', metrics.costTotal.get());
```

---

### 4.2 Prometheus Exporter

```typescript
// Package: @hyperhive/observability-prometheus

import { PrometheusExporter } from '@hyperhive/observability-prometheus';

const colony = new AIColony({
  metrics: new PrometheusExporter({
    port: 9090,
    path: '/metrics',
    prefix: 'hyperhive_',
  }),
});

// Or integrate with existing Prometheus registry
import { Registry } from 'prom-client';

const registry = new Registry();
const colony = new AIColony({
  metrics: new PrometheusExporter({ registry }),
});

// Expose with your app
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
});
```

#### Exported Metrics

```prometheus
# HELP hyperhive_drones_active Number of active drones
# TYPE hyperhive_drones_active gauge
hyperhive_drones_active 5

# HELP hyperhive_drones_total Total drones created
# TYPE hyperhive_drones_total counter
hyperhive_drones_total{status="hatched"} 150
hyperhive_drones_total{status="completed"} 140
hyperhive_drones_total{status="error"} 10

# HELP hyperhive_buzz_total Total buzzes sent
# TYPE hyperhive_buzz_total counter
hyperhive_buzz_total{model="sonnet"} 1200

# HELP hyperhive_buzz_duration_seconds Buzz processing duration
# TYPE hyperhive_buzz_duration_seconds histogram
hyperhive_buzz_duration_seconds_bucket{le="5"} 800
hyperhive_buzz_duration_seconds_bucket{le="30"} 1150
hyperhive_buzz_duration_seconds_bucket{le="+Inf"} 1200

# HELP hyperhive_tool_executions_total Tool execution count
# TYPE hyperhive_tool_executions_total counter
hyperhive_tool_executions_total{tool="Bash",status="success"} 3400
hyperhive_tool_executions_total{tool="Read",status="success"} 8200
hyperhive_tool_executions_total{tool="Edit",status="success"} 2100

# HELP hyperhive_tokens_total Token usage
# TYPE hyperhive_tokens_total counter
hyperhive_tokens_total{type="input",model="sonnet"} 5000000
hyperhive_tokens_total{type="output",model="sonnet"} 2000000

# HELP hyperhive_cost_usd_total Total cost in USD
# TYPE hyperhive_cost_usd_total counter
hyperhive_cost_usd_total{model="sonnet"} 125.50
```

---

### 4.3 OpenTelemetry Integration

```typescript
// Package: @hyperhive/observability-otel

import { OTelPlugin } from '@hyperhive/observability-otel';

const colony = new AIColony({
  plugins: [
    new OTelPlugin({
      serviceName: 'my-app',
      // Optional: custom exporter
      exporter: new OTLPTraceExporter({
        url: 'http://jaeger:4318/v1/traces',
      }),
    }),
  ],
});
```

#### Trace Structure

```
Trace: drone:hatch
├── Span: drone:initialize
│   └── Attributes: droneId, cwd, model
│
└── Trace: buzz:send
    ├── Span: buzz:process
    │   └── Attributes: promptLength, droneId
    │
    ├── Span: tool:execute (Bash)
    │   ├── Attributes: command, cwd
    │   └── Events: stdout, stderr
    │
    ├── Span: tool:execute (Read)
    │   └── Attributes: filePath, bytesRead
    │
    ├── Span: tool:execute (Edit)
    │   └── Attributes: filePath, linesChanged
    │
    └── Span: buzz:complete
        └── Attributes: tokensIn, tokensOut, cost, duration
```

---

### 4.4 Structured Logging

```typescript
// Built into core, configurable
const colony = new AIColony({
  logging: {
    level: 'info', // 'debug' | 'info' | 'warn' | 'error'
    format: 'json', // 'json' | 'pretty'

    // Optional: custom logger
    logger: pino({ /* ... */ }),
  },
});
```

#### Log Format

```json
{
  "level": "info",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "service": "hyperhive",
  "droneId": "drone_abc123",
  "event": "tool:executed",
  "data": {
    "tool": "Bash",
    "command": "npm test",
    "exitCode": 0,
    "durationMs": 7500
  }
}
```

---

### 4.5 Cost & Usage Analytics

```typescript
// Get usage statistics
const stats = await colony.getUsageStats({
  from: new Date('2025-01-01'),
  to: new Date('2025-01-31'),
  groupBy: 'day', // 'hour' | 'day' | 'week' | 'month'
});

// Returns:
{
  totalCost: 125.50,
  totalTokens: { input: 5000000, output: 2000000 },
  totalDrones: 150,
  totalBuzzes: 1200,
  byPeriod: [
    { period: '2025-01-01', cost: 4.25, tokens: { input: 170000, output: 68000 } },
    { period: '2025-01-02', cost: 5.10, tokens: { input: 204000, output: 81600 } },
    // ...
  ],
  byModel: {
    sonnet: { cost: 100.00, tokens: { input: 4000000, output: 1600000 } },
    opus: { cost: 25.50, tokens: { input: 1000000, output: 400000 } },
  },
  byTool: {
    Bash: { count: 3400, avgDuration: 2500 },
    Read: { count: 8200, avgDuration: 50 },
    Edit: { count: 2100, avgDuration: 100 },
  },
}

// Per-drone tracking (via metadata)
const claudeDrone = await colony.hatch({
  cwd: '/project',
  metadata: { userId: 'user-123', projectId: 'proj-456' },
});

// Query by metadata
const userStats = await colony.getUsageStats({
  filter: { 'metadata.userId': 'user-123' },
});
```

---

## Phase 5: Security & Isolation

Features for running Claude safely in multi-tenant or untrusted environments.

### 5.1 Path & Command Restrictions

```typescript
const claudeDrone = await colony.hatch({
  cwd: '/projects/user-123/app',

  security: {
    // Restrict file access to these paths only
    allowedPaths: [
      '/projects/user-123',
      '/shared/libraries', // Read-only shared resources
    ],

    // Block specific paths even within allowed paths
    blockedPaths: [
      '/projects/user-123/.env',
      '/projects/user-123/secrets',
    ],

    // Block dangerous command patterns
    blockedCommands: [
      /rm\s+(-rf?|--recursive)\s+\//,
      /curl.*\|.*sh/,
      /wget.*\|.*sh/,
      /chmod\s+777/,
      /> \/dev\/sd/,
    ],

    // Allow only specific commands (whitelist mode)
    allowedCommands: [
      /^npm\s+(test|run|install)/,
      /^git\s+(status|diff|log|add|commit)/,
      /^cat\s+/,
      /^ls\s+/,
    ],

    // Timeout for all commands
    commandTimeout: 60_000, // 60 seconds

    // Maximum output size
    maxOutputSize: 1_000_000, // 1MB

    // Read-only mode (disables Write, Edit, Bash)
    readOnly: false,
  },
});
```

**Implementation**: Tool interception hooks that validate paths/commands before execution.

---

### 5.2 Tool Interception

```typescript
const colony = new AIColony({
  hooks: {
    // Intercept before tool execution
    beforeToolUse: async (tool, input, drone) => {
      // Log all tool usage
      auditLog.record({
        droneId: drone.id,
        userId: drone.metadata.userId,
        tool,
        input,
        timestamp: new Date(),
      });

      // Modify input
      if (tool === 'Bash' && input.command) {
        // Add timeout to all commands
        input.command = `timeout 60 ${input.command}`;
      }

      // Block tool (throw to prevent execution)
      if (tool === 'Write' && input.path?.includes('.env')) {
        throw new SecurityError('Cannot write to .env files');
      }

      // Return modified input (or original)
      return input;
    },

    // Intercept after tool execution
    afterToolUse: async (tool, input, result, drone) => {
      // Redact sensitive data from output
      if (typeof result === 'string') {
        result = redactSecrets(result);
      }

      return result;
    },
  },
});
```

---

### 5.3 Remote Executor

For running the library in Docker while executing tools on the host.

```typescript
// Package: @hyperhive/security-executor

// In Docker container (Colony service)
import { AIColony } from '@hyperhive/colony';
import { RemoteExecutor } from '@hyperhive/security-executor';

const colony = new AIColony({
  executor: new RemoteExecutor({
    url: 'http://host.docker.internal:3101',
    secret: process.env.EXECUTOR_SECRET,

    // Which tools to route remotely
    tools: ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep'],

    // Timeout for executor requests
    timeout: 120_000,
  }),
});

// On host machine (Executor service)
import { ExecutorServer } from '@hyperhive/security-executor/server';

const executor = new ExecutorServer({
  port: 3101,
  host: '127.0.0.1', // Localhost only
  secret: process.env.EXECUTOR_SECRET,

  // Security settings
  allowedPaths: ['/projects'],
  blockedCommands: [/* ... */],
});

await executor.start();
```

**Architecture:**
```
┌─────────────────────────────────────────┐
│         Docker Container                 │
│  ┌───────────────────────────────────┐  │
│  │   Hyperhive (@hyperhive/colony)   │  │
│  │                                   │  │
│  │  Drone: "Run npm test"           │  │
│  │          ↓                       │  │
│  │  RemoteExecutor intercepts       │  │
│  │          ↓                       │  │
│  │  HTTP POST to executor           │  │
│  └───────────────────────────────────┘  │
└──────────────────│──────────────────────┘
                   │
                   ▼ HTTP (host.docker.internal:3101)
┌─────────────────────────────────────────┐
│              Host Machine                │
│  ┌───────────────────────────────────┐  │
│  │       Executor Server             │  │
│  │                                   │  │
│  │  Validates request                │  │
│  │  Executes: npm test              │  │
│  │  Returns result                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  /projects/app (with node_modules)     │
└─────────────────────────────────────────┘
```

---

### 5.4 Sandboxed Execution

Run tools in isolated containers for maximum security.

```typescript
// Package: @hyperhive/security-docker

import { DockerSandbox } from '@hyperhive/security-docker';

const claudeDrone = await colony.hatch({
  cwd: '/project',

  sandbox: new DockerSandbox({
    // Base image with tools
    image: 'node:22-bookworm',

    // Resource limits
    memory: '2g',
    cpus: 2,

    // Timeout
    timeout: 300_000, // 5 minutes

    // Network access
    network: 'none', // or 'bridge' for internet access

    // Mount project read-write
    mounts: [
      { source: '/project', target: '/workspace', readonly: false },
    ],

    // Additional packages to install
    setup: `
      apt-get update && apt-get install -y ripgrep
      npm install
    `,
  }),
});

// All tools now execute inside container
await claudeDrone.buzz('Run the tests and fix any failures');
```

---

### 5.5 E2B Sandbox Integration

```typescript
// Package: @hyperhive/security-e2b

import { E2BSandbox } from '@hyperhive/security-e2b';

const claudeDrone = await colony.hatch({
  cwd: '/project',

  sandbox: new E2BSandbox({
    apiKey: process.env.E2B_API_KEY,
    template: 'node-22', // Pre-built template
    timeout: 300_000,
  }),
});
```

---

## Phase 6: Multi-Agent & Orchestration

Coordinate multiple Claude sessions for complex workflows.

### 6.1 Drone Pools

```typescript
// Create a pool of similar drones
const reviewerPool = colony.createPool({
  name: 'code-reviewers',
  size: 3,

  // Shared configuration
  config: {
    systemPrompt: templates.codeReviewer({ strictness: 'high' }),
    tools: ['Read', 'Grep', 'Glob'],
    model: 'sonnet',
  },

  // Pool behavior
  strategy: 'round-robin', // or 'least-busy', 'random'
  maxQueueSize: 100,
  queueTimeout: 60_000,
});

// Distribute work across pool
const files = ['auth.ts', 'api.ts', 'db.ts', 'utils.ts'];

const results = await Promise.all(
  files.map(file => reviewerPool.run({
    cwd: '/project',
    prompt: `Review ${file} for security issues`,
  }))
);

// Pool stats
const stats = reviewerPool.getStats();
// { activeDrones: 3, queuedTasks: 0, completedTasks: 4, avgDuration: 15000 }

// Cleanup
await reviewerPool.retire();
```

---

### 6.2 Workflows

Define multi-step workflows with dependencies, retries, and error handling.

```typescript
// Package: @hyperhive/orchestration-workflows

import { Workflow, Step } from '@hyperhive/orchestration-workflows';

const deployWorkflow = new Workflow({
  name: 'deploy-to-production',

  steps: [
    new Step({
      id: 'lint',
      name: 'Run Linter',
      prompt: 'Run the linter and fix any issues automatically',
      tools: ['Read', 'Edit', 'Bash'],
      retries: 2,
    }),

    new Step({
      id: 'test',
      name: 'Run Tests',
      prompt: 'Run all tests. If any fail, analyze and fix them.',
      tools: ['Read', 'Edit', 'Bash'],
      retries: 3,
      dependsOn: ['lint'],
    }),

    new Step({
      id: 'security',
      name: 'Security Scan',
      prompt: 'Run security scan and fix any critical vulnerabilities',
      tools: ['Read', 'Edit', 'Bash', 'WebSearch'],
      model: 'opus', // Use more capable model
      dependsOn: ['lint'],
      // Runs in parallel with 'test'
    }),

    new Step({
      id: 'build',
      name: 'Build',
      prompt: 'Build the project for production',
      tools: ['Bash'],
      dependsOn: ['test', 'security'], // Wait for both
    }),

    new Step({
      id: 'deploy',
      name: 'Deploy',
      prompt: 'Deploy to production environment',
      tools: ['Bash'],
      dependsOn: ['build'],
      // Requires manual approval
      requiresApproval: true,
    }),
  ],

  // Global settings
  onStepComplete: async (step, result) => {
    await notifySlack(`Step ${step.name} completed`);
  },

  onStepFailed: async (step, error) => {
    await notifySlack(`Step ${step.name} failed: ${error.message}`);
  },
});

// Execute workflow
const run = await deployWorkflow.execute({
  cwd: '/project',
  metadata: { deployedBy: 'user-123' },
});

// Listen to events
run.on('step:start', ({ step }) => {
  console.log(`Starting: ${step.name}`);
});

run.on('step:complete', ({ step, result }) => {
  console.log(`Completed: ${step.name}`);
});

run.on('approval:required', async ({ step }) => {
  // Show approval UI
  const approved = await getApproval(step);
  if (approved) {
    run.approve(step.id);
  } else {
    run.reject(step.id, 'Rejected by user');
  }
});

run.on('complete', ({ results }) => {
  console.log('Workflow completed!', results);
});

run.on('failed', ({ step, error }) => {
  console.error(`Workflow failed at ${step.name}:`, error);
});

// Get status
const status = run.getStatus();
// {
//   status: 'running',
//   currentStep: 'test',
//   completedSteps: ['lint'],
//   pendingSteps: ['security', 'build', 'deploy'],
//   failedSteps: [],
// }

// Cancel if needed
await run.cancel();
```

---

### 6.3 Drone Coordination

Coordinate multiple specialized drones working together.

```typescript
// Define specialized drones
const architect = await colony.hatch({
  cwd: '/project',
  systemPrompt: `You are a software architect. You design systems and create implementation plans.
                 You do NOT write code - you create detailed specifications for developers.`,
  tools: ['Read', 'Glob', 'Grep'],
});

const developer = await colony.hatch({
  cwd: '/project',
  systemPrompt: `You are a senior developer. You implement features based on specifications.
                 Follow the architect's plan exactly.`,
  tools: ['Read', 'Write', 'Edit', 'Bash'],
});

const reviewer = await colony.hatch({
  cwd: '/project',
  systemPrompt: `You are a code reviewer. Review code for bugs, security issues, and best practices.
                 Be thorough but constructive.`,
  tools: ['Read', 'Grep'],
});

// Coordinate
async function buildFeature(requirement: string) {
  // 1. Architect creates plan
  const plan = await architect.ask(`
    Create a detailed implementation plan for: ${requirement}
    Include file structure, interfaces, and step-by-step instructions.
  `);

  // 2. Developer implements
  await developer.buzz(`
    Implement the following plan:
    ${plan}

    Create all necessary files and write complete, working code.
  `);

  // 3. Reviewer reviews
  const review = await reviewer.ask(`
    Review all changes made in the last commit.
    List any issues found and whether they are critical.
  `);

  // 4. Check if approved
  if (review.toLowerCase().includes('approved') ||
      !review.toLowerCase().includes('critical')) {
    // 5. Developer addresses feedback if any
    if (review.toLowerCase().includes('suggestion')) {
      await developer.buzz(`Address this feedback: ${review}`);
    }
    return { success: true, plan, review };
  } else {
    // Iterate
    await developer.buzz(`Fix these critical issues: ${review}`);
    return buildFeature(requirement); // Recursively until approved
  }
}

const result = await buildFeature('Add user authentication with JWT');
```

---

### 6.4 Drone Communication (Message Passing)

```typescript
// Package: @hyperhive/orchestration-swarm

import { DroneSwarm } from '@hyperhive/orchestration-swarm';

const swarm = new DroneSwarm();

// Define drones
const planner = swarm.createDrone({
  name: 'planner',
  systemPrompt: 'You create implementation plans...',
  tools: ['Read', 'Grep'],

  // Can send messages to these drones
  canMessageTo: ['developer', 'reviewer'],
});

const developer = swarm.createDrone({
  name: 'developer',
  systemPrompt: 'You implement features...',
  tools: ['Read', 'Write', 'Edit', 'Bash'],
  canMessageTo: ['reviewer', 'planner'],
});

const reviewer = swarm.createDrone({
  name: 'reviewer',
  systemPrompt: 'You review code...',
  tools: ['Read', 'Grep'],
  canMessageTo: ['developer', 'planner'],
});

// Message passing
planner.on('message:out', ({ to, content }) => {
  console.log(`Planner -> ${to}: ${content}`);
});

// Start with initial prompt
await swarm.run({
  cwd: '/project',
  initialDrone: 'planner',
  initialPrompt: 'Design and implement a caching system',

  // Max iterations before stopping
  maxIterations: 10,

  // Stop condition
  stopWhen: (messages) => {
    return messages.some(m => m.content.includes('TASK_COMPLETE'));
  },
});
```

---

## Phase 7: Testing & Development Tools

Tools to make developing with Hyperhive easier.

### 7.1 Mock Client

```typescript
// Package: @hyperhive/tools-testing

import { MockColony, createMockDrone } from '@hyperhive/tools-testing';

describe('My feature', () => {
  let colony: MockColony;

  beforeEach(() => {
    colony = new MockColony();
  });

  it('handles code review', async () => {
    // Mock specific prompt responses
    colony.mockBuzz('Review the auth module', {
      messages: [
        { role: 'assistant', content: 'I found 3 issues...' },
      ],
      tools: [
        { tool: 'Read', input: { path: 'auth.ts' }, result: 'file contents...' },
      ],
    });

    const drone = await colony.hatch({ cwd: '/test' });
    await drone.buzz('Review the auth module');

    const messages = drone.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toContain('3 issues');
  });

  it('handles errors', async () => {
    colony.mockBuzz('Delete everything', {
      error: new Error('Dangerous operation blocked'),
    });

    const drone = await colony.hatch({ cwd: '/test' });

    await expect(drone.buzz('Delete everything'))
      .rejects.toThrow('Dangerous operation blocked');
  });

  it('verifies tool usage', async () => {
    colony.mockBuzz('Fix the bug', {
      messages: [{ role: 'assistant', content: 'Fixed!' }],
      tools: [
        { tool: 'Read', input: { path: 'bug.ts' } },
        { tool: 'Edit', input: { path: 'bug.ts', oldString: 'bug', newString: 'fix' } },
      ],
    });

    const drone = await colony.hatch({ cwd: '/test' });
    await drone.buzz('Fix the bug');

    // Verify tools were called
    expect(colony.getToolCalls()).toEqual([
      expect.objectContaining({ tool: 'Read', input: { path: 'bug.ts' } }),
      expect.objectContaining({ tool: 'Edit' }),
    ]);
  });
});
```

---

### 7.2 Drone Recording & Replay

```typescript
// Record a drone session
const claudeDrone = await colony.hatch({
  cwd: '/project',
  recording: {
    enabled: true,
    includeTiming: true, // Record delays between events
  },
});

await claudeDrone.buzz('Implement user authentication');

// Save recording
const recording = claudeDrone.getRecording();
await fs.writeFile('auth-drone.json', JSON.stringify(recording, null, 2));

// Replay later
const replayed = await colony.replayDrone('./auth-drone.json', {
  speed: 2, // 2x speed
  onEvent: (event) => {
    console.log(event.type, event.timestamp);
  },
});

// Use recordings for:
// - Debugging issues
// - Creating demos
// - Regression testing
// - Training/documentation
```

#### Recording Format

```json
{
  "version": "1.0",
  "droneId": "drone_abc123",
  "cwd": "/project",
  "config": { /* ... */ },
  "startedAt": "2025-01-15T10:30:00Z",
  "events": [
    {
      "type": "buzz",
      "timestamp": 0,
      "data": { "content": "Implement user authentication" }
    },
    {
      "type": "status",
      "timestamp": 50,
      "data": { "status": "thinking" }
    },
    {
      "type": "message:partial",
      "timestamp": 1000,
      "data": { "chunk": "I'll start by" }
    },
    {
      "type": "tool:start",
      "timestamp": 3000,
      "data": { "tool": "Read", "input": { "path": "src/auth.ts" } }
    },
    {
      "type": "tool:end",
      "timestamp": 3100,
      "data": { "tool": "Read", "result": "..." }
    },
    // ...
  ]
}
```

---

### 7.3 CLI Development Tool

```bash
# Package: @hyperhive/tools-cli

# Interactive development mode
npx @hyperhive/tools-cli dev --project ./my-app
# Opens REPL with live reload, debugging tools

# Run single prompt
npx @hyperhive/tools-cli run "Fix the tests" --project ./my-app --model sonnet

# Replay a recorded drone session
npx @hyperhive/tools-cli replay ./drone.json --speed 1

# Validate configuration
npx @hyperhive/tools-cli validate ./hyperhive.config.ts

# Generate TypeScript types from your config
npx @hyperhive/tools-cli types --output ./types/hyperhive.d.ts

# Debug mode (verbose logging)
npx @hyperhive/tools-cli dev --project ./my-app --debug
```

---

### 7.4 VS Code Extension

```
hyperhive-vscode/
├── Drone explorer (tree view of active drones)
├── Message inspector (view drone messages)
├── Recording player (replay drone sessions)
├── Config IntelliSense (autocomplete for config)
└── Debugging tools (breakpoints on tool calls)
```

---

## Phase 8: Advanced AI Features

Sophisticated features that enhance Claude's capabilities.

### 8.1 Context Management

Intelligent context window management for large codebases.

```typescript
// Package: @hyperhive/ai-context

import { ContextManager } from '@hyperhive/ai-context';

const context = new ContextManager({
  // Automatic context selection
  auto: {
    // Include files related to the prompt
    relevance: true,

    // Include recently modified files
    recency: true,

    // Include files with errors/warnings
    diagnostics: true,
  },

  // RAG for large codebases
  rag: {
    enabled: true,
    provider: 'chroma', // or 'pinecone', 'weaviate'
    embeddingModel: 'text-embedding-3-small',

    // Index settings
    chunkSize: 1000,
    chunkOverlap: 200,

    // Retrieval settings
    topK: 10,
    minScore: 0.7,
  },

  // Context window management
  maxTokens: 100_000, // Leave room for response

  // Priority rules
  priority: [
    { pattern: '**/*.test.ts', weight: 0.5 }, // Tests are less important
    { pattern: '**/README.md', weight: 0.3 },
    { pattern: '**/node_modules/**', weight: 0 }, // Exclude
  ],
});

const claudeDrone = await colony.hatch({
  cwd: '/large-monorepo',
  context,
});

// Context manager automatically:
// 1. Indexes codebase on first run
// 2. Retrieves relevant files for each buzz
// 3. Manages context window efficiently
// 4. Updates index as files change
```

---

### 8.2 Memory Systems

Persistent memory across drones.

```typescript
// Package: @hyperhive/ai-memory

import { SemanticMemory } from '@hyperhive/ai-memory';

const memory = new SemanticMemory({
  // Storage backend
  store: new PostgresStore({ connectionString: '...' }),

  // Embedding model
  embeddingModel: 'text-embedding-3-small',

  // What to remember
  remember: {
    decisions: true,     // "We decided to use JWT because..."
    patterns: true,      // "This codebase uses repository pattern"
    preferences: true,   // "User prefers functional style"
    errors: true,        // "This approach failed because..."
  },

  // Retrieval settings
  retrieval: {
    topK: 5,
    minRelevance: 0.7,
  },
});

const claudeDrone = await colony.hatch({
  cwd: '/project',
  memory,
});

// Memory is automatically:
// 1. Queried at start of each buzz
// 2. Updated with new learnings
// 3. Shared across drones (same project)

// Manual memory operations
await memory.remember({
  type: 'decision',
  content: 'Using PostgreSQL instead of MongoDB for ACID compliance',
  context: { project: '/project', date: new Date() },
});

const relevant = await memory.recall('database choice');
```

---

### 8.3 Custom Drone Types

Define reusable, specialized drone configurations.

```typescript
// Define drone type
colony.defineDroneType('security-auditor', {
  systemPrompt: `You are a security expert specializing in web application security.

                 Your responsibilities:
                 - Identify OWASP Top 10 vulnerabilities
                 - Check for authentication/authorization issues
                 - Review cryptography usage
                 - Identify injection vulnerabilities
                 - Check for sensitive data exposure

                 Always provide:
                 1. Severity rating (Critical/High/Medium/Low)
                 2. Affected files and line numbers
                 3. Detailed explanation of the vulnerability
                 4. Recommended fix with code example`,

  tools: ['Read', 'Grep', 'Glob', 'WebSearch'],
  model: 'opus',

  // Preprocessing
  beforeBuzz: async (prompt, drone) => {
    // Always include security context
    const securityFiles = await glob('**/*.{env,key,pem,secret}*', { cwd: drone.cwd });
    return `${prompt}\n\nNote: Found ${securityFiles.length} potential secret files.`;
  },

  // Postprocessing
  afterComplete: async (result, drone) => {
    // Generate security report
    const report = generateSecurityReport(result);
    await fs.writeFile(`${drone.cwd}/SECURITY_REPORT.md`, report);
  },

  // Validation
  validateResponse: async (response) => {
    // Ensure response includes severity ratings
    if (!response.includes('Severity:')) {
      return { valid: false, reason: 'Missing severity ratings' };
    }
    return { valid: true };
  },
});

// Use drone type
const auditor = await colony.hatch({
  cwd: '/project',
  droneType: 'security-auditor',
});

await auditor.buzz('Perform a comprehensive security audit');
```

---

### 8.4 Buzz Chains

Chain multiple buzzes with data flow.

```typescript
// Package: @hyperhive/ai-chains

import { Chain, buzz, extract, condition } from '@hyperhive/ai-chains';

const refactorChain = new Chain()
  // Step 1: Analyze current code
  .add(buzz('Analyze {file} and identify code smells'))
  .add(extract({
    codeSmells: 'array of identified issues',
    complexity: 'number from 1-10',
  }))

  // Step 2: Conditional - only refactor if complex
  .add(condition(
    ({ complexity }) => complexity > 5,
    // If complex, refactor
    buzz('Refactor {file} to address: {codeSmells}'),
    // If simple, skip
    buzz('Code is already clean, no refactoring needed'),
  ))

  // Step 3: Verify
  .add(buzz('Run tests and verify the refactoring works'));

// Execute chain
const result = await refactorChain.execute(claudeDrone, {
  file: 'src/complex-module.ts',
});

console.log(result.codeSmells);  // ['God class', 'Deep nesting']
console.log(result.complexity);   // 8
```

---

### 8.5 Self-Improving Drones

Drones that learn from feedback.

```typescript
// Package: @hyperhive/ai-learning

import { LearningDrone } from '@hyperhive/ai-learning';

const learner = new LearningDrone({
  colony,

  // Feedback collection
  feedback: {
    // Automatic feedback from tool results
    auto: {
      testFailures: true,  // Learn from test failures
      lintErrors: true,    // Learn from lint errors
      buildErrors: true,   // Learn from build errors
    },

    // Manual feedback
    manual: true, // Enable drone.feedback() method
  },

  // Learning storage
  store: new PostgresStore({ connectionString: '...' }),
});

const claudeDrone = await learner.hatch({ cwd: '/project' });

// After completion, provide feedback
await claudeDrone.feedback({
  rating: 4, // 1-5
  comments: 'Good solution but missed edge case with empty arrays',
  correctOutput: '// Example of correct handling...',
});

// Drone learns from feedback and improves over time
// Feedback is stored and used to improve future responses
```

---

## Package Structure

```
hyperhive/
├── packages/
│   ├── colony/                        # @hyperhive/colony - Main library (Phase 1)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── colony.ts
│   │   │   ├── drone.ts
│   │   │   ├── types.ts
│   │   │   └── errors.ts
│   │   └── package.json
│   │
│   ├── plugins/                       # Framework plugins (Phase 2)
│   │   ├── fastify/                   # @hyperhive/plugin-fastify
│   │   ├── express/                   # @hyperhive/plugin-express
│   │   ├── nextjs/                    # @hyperhive/plugin-nextjs
│   │   ├── trpc/                      # @hyperhive/plugin-trpc
│   │   ├── nestjs/                    # @hyperhive/plugin-nestjs
│   │   └── hono/                      # @hyperhive/plugin-hono
│   │
│   ├── storages/                      # Storage adapters (Phase 3)
│   │   ├── redis/                     # @hyperhive/storage-redis
│   │   ├── postgres/                  # @hyperhive/storage-postgres
│   │   └── sqlite/                    # @hyperhive/storage-sqlite
│   │
│   ├── observability/                 # Observability (Phase 4)
│   │   ├── prometheus/                # @hyperhive/observability-prometheus
│   │   └── otel/                      # @hyperhive/observability-otel
│   │
│   ├── security/                      # Security & Isolation (Phase 5)
│   │   ├── executor/                  # @hyperhive/security-executor
│   │   ├── docker/                    # @hyperhive/security-docker
│   │   └── e2b/                       # @hyperhive/security-e2b
│   │
│   ├── orchestration/                 # Multi-Agent & Orchestration (Phase 6)
│   │   ├── workflows/                 # @hyperhive/orchestration-workflows
│   │   └── swarm/                     # @hyperhive/orchestration-swarm
│   │
│   ├── tools/                         # Testing & Dev Tools (Phase 7)
│   │   ├── testing/                   # @hyperhive/tools-testing
│   │   └── cli/                       # @hyperhive/tools-cli
│   │
│   ├── ai/                            # Advanced AI Features (Phase 8)
│   │   ├── context/                   # @hyperhive/ai-context
│   │   ├── memory/                    # @hyperhive/ai-memory
│   │   ├── chains/                    # @hyperhive/ai-chains
│   │   └── learning/                  # @hyperhive/ai-learning
│   │
│   └── configs/                       # Shared configs
│       ├── typescript/                # @hyperhive/config-typescript
│       └── eslint/                    # @hyperhive/config-eslint
│
├── examples/
│   ├── basic/                         # Basic usage
│   ├── fastify-app/                   # Fastify example
│   ├── nextjs-app/                    # Next.js example
│   ├── multi-drone/                   # Multi-drone example
│   └── workflow/                      # Workflow example
│
├── docs/
│   ├── getting-started.md
│   ├── configuration.md
│   ├── framework-integrations.md
│   ├── persistence.md
│   ├── security.md
│   ├── multi-drone.md
│   └── api-reference.md
│
└── README.md
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| npm weekly downloads | 10,000+ |
| GitHub stars | 1,000+ |
| Framework integrations | 5+ |
| Storage adapters | 3+ |
| Community plugins | 10+ |
| Documentation coverage | 100% |
| Test coverage | 90%+ |
| TypeScript coverage | 100% |

---

## Competitive Positioning

```
                    Flexibility
                         ▲
                         │
    Raw SDK              │              Hyperhive
    (Maximum             │              (Balanced)
     flexibility,        │                   ★
     no abstractions)    │
                         │
                         │
    ─────────────────────┼─────────────────────► Ease of Use
                         │
                         │
    Standalone           │              Framework-specific
    Servers              │              Libraries
    (agcluster, etc.)    │
                         │
                         │
```

**Hyperhive** occupies the unique position of:
- More abstraction than raw SDK (easier to use)
- More flexibility than standalone servers (composable)
- More portable than framework-specific libraries (works everywhere)

---

## Next Steps

1. **Create repository** - Set up monorepo at `github.com/Hypergamed/Hyperhive`
2. **Claim npm scope** - Register `@hyperhive` organization on npm
3. **Implement MVP** - Core library (`@hyperhive/colony`, ~600 lines)
4. **Write documentation** - Getting started, API reference
5. **Create examples** - Basic usage, framework integrations
6. **Publish to npm** - Initial release `@hyperhive/colony@0.1.0`
7. **Gather feedback** - From early adopters
8. **Iterate** - Based on real-world usage
