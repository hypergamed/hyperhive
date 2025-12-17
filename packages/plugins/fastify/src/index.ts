export { colonyPlugin } from "./plugin.js";
export type { ColonyFastifyOptions } from "./plugin.js";

// Re-export colony types for convenience
export { AIColony, Drone } from "@hyperhive/colony";
export type {
  ColonyConfig,
  DroneConfig,
  DroneStatus,
  LLMProvider,
  ModelTier,
} from "@hyperhive/colony";
