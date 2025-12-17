import { EventEmitter } from "events";
import { Drone } from "./drone.js";
import type { ColonyConfig, DroneConfig, LLMProvider } from "./types.js";

/**
 * Drone info returned by listDrones.
 */
export interface DroneInfo {
  id: string;
  cwd: string;
  status: string;
  createdAt: Date;
  metadata: Record<string, unknown>;
}

/**
 * AIColony is the central controller for Hyperhive.
 *
 * The AIColony manages all Drones (LLM sessions), handles configuration,
 * and provides the main entry point for the library.
 *
 * @example
 * ```typescript
 * import { AIColony } from '@hyperhive/colony';
 *
 * const colony = new AIColony({
 *   apiKey: process.env.ANTHROPIC_API_KEY,
 *   provider: 'claude',
 * });
 *
 * const claudeDrone = await colony.hatch({
 *   cwd: '/path/to/project',
 * });
 *
 * claudeDrone.on('message', (msg) => console.log(msg.content));
 * await claudeDrone.buzz('Fix the bug in auth.ts');
 * ```
 */
export class AIColony extends EventEmitter {
  private readonly _config: Required<ColonyConfig>;
  private readonly _drones = new Map<string, Drone>();

  constructor(config: ColonyConfig) {
    super();

    this._config = {
      apiKey: config.apiKey,
      provider: config.provider ?? "claude",
      baseUrl: config.baseUrl ?? this.getDefaultBaseUrl(config.provider ?? "claude"),
      timeout: config.timeout ?? 30000,
    };
  }

  /**
   * Gets the default base URL for a provider.
   */
  private getDefaultBaseUrl(provider: LLMProvider): string {
    switch (provider) {
      case "claude":
      case "anthropic":
        return "https://api.anthropic.com";
      case "openai":
        return "https://api.openai.com";
      default:
        return "https://api.anthropic.com";
    }
  }

  /**
   * Hatches a new Drone (creates a new LLM session).
   *
   * @param config - Drone configuration
   */
  hatch(config: DroneConfig): Promise<Drone> {
    const id = `drone_${String(Date.now())}_${Math.random().toString(36).substring(2, 9)}`;
    const drone = new Drone(id, config);

    this._drones.set(id, drone);
    this.emit("drone:hatched", drone);

    return Promise.resolve(drone);
  }

  /**
   * Recalls an existing Drone by ID (reconnects to session).
   *
   * @param id - Drone ID
   */
  recall(id: string): Drone | undefined {
    return this._drones.get(id);
  }

  /**
   * Retires a Drone and removes it from tracking.
   *
   * @param id - Drone ID to retire
   */
  async retire(id: string): Promise<void> {
    const drone = this._drones.get(id);
    if (drone) {
      await drone.retire();
      this._drones.delete(id);
      this.emit("drone:retired", id);
    }
  }

  /**
   * Lists all active Drones.
   */
  listDrones(): DroneInfo[] {
    return Array.from(this._drones.values()).map((drone) => ({
      id: drone.id,
      cwd: drone.cwd,
      status: drone.status,
      createdAt: drone.createdAt,
      metadata: drone.metadata,
    }));
  }

  /**
   * Gets the configured API key (masked for security).
   */
  getApiKeyMasked(): string {
    const key = this._config.apiKey;
    if (key.length <= 8) {
      return "****";
    }
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  }

  /**
   * Gets the configured base URL.
   */
  getBaseUrl(): string {
    return this._config.baseUrl;
  }

  /**
   * Gets the configured timeout.
   */
  getTimeout(): number {
    return this._config.timeout;
  }

  /**
   * Gets the configured provider.
   */
  getProvider(): LLMProvider {
    return this._config.provider;
  }
}

/**
 * AIColony event types for typed event handling.
 */
export interface ColonyEvents {
  "drone:hatched": [drone: Drone];
  "drone:retired": [droneId: string];
  error: [error: Error, drone?: Drone];
}
