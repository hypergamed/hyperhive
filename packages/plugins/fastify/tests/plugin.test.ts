import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Fastify, { type FastifyInstance } from "fastify";
import { colonyPlugin } from "../src/plugin.js";
import { AIColony } from "@hyperhive/colony";

describe("colonyPlugin", () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = Fastify();
  });

  afterEach(async () => {
    await app.close();
  });

  it("should register plugin and decorate instance", async () => {
    await app.register(colonyPlugin, {
      apiKey: "test-api-key",
    });

    expect(app.hasDecorator("colony")).toBe(true);
  });

  it("should create AIColony instance with provided config", async () => {
    await app.register(colonyPlugin, {
      apiKey: "test-api-key",
      baseUrl: "https://custom.api.com",
    });

    const colony = (app as unknown as { colony: AIColony }).colony;
    expect(colony).toBeInstanceOf(AIColony);
    expect(colony.getBaseUrl()).toBe("https://custom.api.com");
  });

  it("should use custom decorator name", async () => {
    await app.register(colonyPlugin, {
      apiKey: "test-api-key",
      decoratorName: "hive",
    });

    expect(app.hasDecorator("hive")).toBe(true);
    expect(app.hasDecorator("colony")).toBe(false);
  });

  it("should throw error if decorator already exists", async () => {
    app.decorate("colony", {});

    await expect(
      app.register(colonyPlugin, {
        apiKey: "test-api-key",
      })
    ).rejects.toThrow('Decorator "colony" is already registered');
  });

  it("should allow hatching Drones via the decorator", async () => {
    await app.register(colonyPlugin, {
      apiKey: "test-api-key",
    });

    const colony = (app as unknown as { colony: AIColony }).colony;
    const drone = await colony.hatch({ cwd: "/test" });

    expect(drone.cwd).toBe("/test");
  });
});
