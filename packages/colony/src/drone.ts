import { EventEmitter } from "events";
import type {
  DroneConfig,
  DroneStatus,
  AssistantMessage,
  ToolStartEvent,
  ToolEndEvent,
  CompleteEvent,
} from "./types.js";

/**
 * Drone represents an active LLM session.
 *
 * The Drone is an autonomous agent - an active connection to an LLM provider
 * that can process prompts, execute tools, and maintain conversation history.
 *
 * @example
 * ```typescript
 * const claudeDrone = await colony.hatch({ provider: 'claude', cwd: '/project' });
 *
 * claudeDrone.on('message', (msg) => console.log('Claude:', msg.content));
 * claudeDrone.on('tool:start', ({ tool }) => console.log(`Running ${tool}...`));
 *
 * await claudeDrone.buzz('Fix the authentication bug');
 * ```
 */
export class Drone extends EventEmitter {
  readonly id: string;
  readonly cwd: string;
  readonly metadata: Record<string, unknown>;

  private _status: DroneStatus = "idle";
  private readonly _messages: AssistantMessage[] = [];
  private readonly _config: Required<Omit<DroneConfig, "metadata">> & {
    metadata: Record<string, unknown>;
  };
  private readonly _createdAt: Date;

  constructor(id: string, config: DroneConfig) {
    super();
    this.id = id;
    this.cwd = config.cwd;
    this.metadata = config.metadata ?? {};
    this._createdAt = new Date();

    this._config = {
      cwd: config.cwd,
      model: config.model ?? "balanced",
      tools: config.tools ?? [],
      systemPrompt: config.systemPrompt ?? "",
      metadata: config.metadata ?? {},
    };
  }

  /**
   * Gets the current status of the Drone.
   */
  get status(): DroneStatus {
    return this._status;
  }

  /**
   * Gets when this Drone was created.
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Gets the configured model tier.
   */
  get model(): string {
    return this._config.model;
  }

  /**
   * Sends a prompt to the LLM for processing (buzz).
   *
   * @param prompt - The prompt to send
   */
  buzz(prompt: string): Promise<void> {
    if (this._status !== "idle") {
      return Promise.reject(new Error(`Cannot buzz while Drone is ${this._status}`));
    }

    this._status = "thinking";
    this.emit("status", this._status);

    // TODO: Implement actual LLM integration
    // For now, this is a placeholder that simulates a response

    const message: AssistantMessage = {
      id: `msg_${String(Date.now())}`,
      role: "assistant",
      content: `Received prompt: ${prompt}`,
      timestamp: new Date(),
    };

    this._messages.push(message);
    this.emit("message", message);

    this._status = "idle";
    this.emit("status", this._status);

    const completeEvent: CompleteEvent = {
      success: true,
      usage: {
        inputTokens: prompt.length,
        outputTokens: message.content.length,
        costUsd: 0,
      },
      durationMs: 100,
      timestamp: new Date(),
    };

    this.emit("complete", completeEvent);

    return Promise.resolve();
  }

  /**
   * Interrupts the current operation.
   */
  interrupt(): Promise<void> {
    if (this._status === "idle") {
      return Promise.resolve();
    }

    // TODO: Implement actual interruption
    this._status = "idle";
    this.emit("status", this._status);

    return Promise.resolve();
  }

  /**
   * Retires this Drone and cleans up resources.
   */
  async retire(): Promise<void> {
    await this.interrupt();
    this.removeAllListeners();
  }

  /**
   * Gets message history.
   *
   * @param options - Pagination options
   */
  getMessages(options?: { limit?: number; offset?: number }): AssistantMessage[] {
    const { limit, offset = 0 } = options ?? {};
    const messages = this._messages.slice(offset);
    return limit ? messages.slice(0, limit) : messages;
  }

  /**
   * Gets the last message.
   */
  getLastMessage(): AssistantMessage | undefined {
    return this._messages[this._messages.length - 1];
  }

  /**
   * Clears message history.
   */
  clearMessages(): void {
    this._messages.length = 0;
  }
}

/**
 * Drone event types for typed event handling.
 */
export interface DroneEvents {
  message: [message: AssistantMessage];
  "tool:start": [data: ToolStartEvent];
  "tool:end": [data: ToolEndEvent];
  status: [status: DroneStatus];
  complete: [data: CompleteEvent];
  error: [error: Error];
}
