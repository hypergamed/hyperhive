/**
 * Supported LLM providers.
 */
export type LLMProvider = "claude" | "openai" | "anthropic";

/**
 * Supported model tiers.
 */
export type ModelTier = "fast" | "balanced" | "powerful";

/**
 * AIColony configuration options.
 */
export interface ColonyConfig {
  /**
   * The API key for authentication.
   */
  apiKey: string;

  /**
   * The LLM provider to use.
   * @default "claude"
   */
  provider?: LLMProvider;

  /**
   * Optional base URL for the API.
   */
  baseUrl?: string;

  /**
   * Optional timeout in milliseconds.
   * @default 30000
   */
  timeout?: number;
}

/**
 * Drone (LLM session) configuration options.
 */
export interface DroneConfig {
  /**
   * Working directory for the session.
   */
  cwd: string;

  /**
   * Model tier to use.
   * @default "balanced"
   */
  model?: ModelTier;

  /**
   * Available tools for this session.
   */
  tools?: string[];

  /**
   * System prompt to use.
   */
  systemPrompt?: string;

  /**
   * Custom metadata passed through.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Drone status states.
 */
export type DroneStatus = "idle" | "thinking" | "tool_running" | "error";

/**
 * Message from the LLM assistant.
 */
export interface AssistantMessage {
  id: string;
  role: "assistant";
  content: string;
  timestamp: Date;
}

/**
 * Tool execution start event.
 */
export interface ToolStartEvent {
  id: string;
  tool: string;
  input: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Tool execution end event.
 */
export interface ToolEndEvent {
  id: string;
  tool: string;
  input: Record<string, unknown>;
  result: unknown;
  isError: boolean;
  durationMs: number;
  timestamp: Date;
}

/**
 * Session completion event.
 */
export interface CompleteEvent {
  success: boolean;
  usage: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
  };
  durationMs: number;
  timestamp: Date;
}
