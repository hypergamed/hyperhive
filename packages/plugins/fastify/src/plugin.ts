import type { FastifyPluginAsync, FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { AIColony, type ColonyConfig } from "@hyperhive/colony";

/**
 * Options for the Hyperhive AIColony Fastify plugin.
 */
export interface ColonyFastifyOptions extends ColonyConfig {
  /**
   * Name to use for decorator. Defaults to "colony".
   * @default "colony"
   */
  decoratorName?: string;
}

/**
 * Hyperhive AIColony Fastify plugin.
 *
 * Decorates Fastify instance with an AIColony controller.
 *
 * @example
 * ```typescript
 * import Fastify from "fastify";
 * import { colonyPlugin } from "@hyperhive/plugin-fastify";
 *
 * const app = Fastify();
 *
 * await app.register(colonyPlugin, {
 *   apiKey: process.env.ANTHROPIC_API_KEY,
 * });
 *
 * // Access AIColony via decorator
 * const drone = await app.colony.hatch({ cwd: '/project' });
 * ```
 */
const colonyPluginImpl: FastifyPluginAsync<ColonyFastifyOptions> = (
  fastify: FastifyInstance,
  options: ColonyFastifyOptions
): Promise<void> => {
  const { decoratorName = "colony", ...config } = options;

  if (fastify.hasDecorator(decoratorName)) {
    return Promise.reject(new Error(`Decorator "${decoratorName}" is already registered`));
  }

  const colony = new AIColony(config);
  fastify.decorate(decoratorName, colony);

  return Promise.resolve();
};

/**
 * Hyperhive AIColony Fastify plugin with encapsulation support.
 */
export const colonyPlugin = fp(colonyPluginImpl, {
  fastify: "5.x",
  name: "@hyperhive/plugin-fastify",
});
