import { describe, it, expect } from "vitest";
import { AIColony } from "../src/colony.js";
import { Drone } from "../src/drone.js";

describe("AIColony", () => {
  it("should create instance with required config", () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    expect(colony).toBeInstanceOf(AIColony);
  });

  it("should use default provider when not provided", () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    expect(colony.getProvider()).toBe("claude");
  });

  it("should use custom provider when provided", () => {
    const colony = new AIColony({
      apiKey: "test-api-key",
      provider: "openai",
    });
    expect(colony.getProvider()).toBe("openai");
  });

  it("should use correct default baseUrl for claude", () => {
    const colony = new AIColony({ apiKey: "test-api-key", provider: "claude" });
    expect(colony.getBaseUrl()).toBe("https://api.anthropic.com");
  });

  it("should use correct default baseUrl for openai", () => {
    const colony = new AIColony({ apiKey: "test-api-key", provider: "openai" });
    expect(colony.getBaseUrl()).toBe("https://api.openai.com");
  });

  it("should use custom baseUrl when provided", () => {
    const colony = new AIColony({
      apiKey: "test-api-key",
      baseUrl: "https://custom.api.com",
    });
    expect(colony.getBaseUrl()).toBe("https://custom.api.com");
  });

  it("should use default timeout when not provided", () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    expect(colony.getTimeout()).toBe(30000);
  });

  it("should use custom timeout when provided", () => {
    const colony = new AIColony({
      apiKey: "test-api-key",
      timeout: 60000,
    });
    expect(colony.getTimeout()).toBe(60000);
  });

  it("should mask API key correctly", () => {
    const colony = new AIColony({ apiKey: "sk-ant-api-key-12345678" });
    expect(colony.getApiKeyMasked()).toBe("sk-a...5678");
  });

  it("should fully mask short API keys", () => {
    const colony = new AIColony({ apiKey: "short" });
    expect(colony.getApiKeyMasked()).toBe("****");
  });

  it("should hatch a Drone", async () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    const drone = await colony.hatch({ cwd: "/test/project" });

    expect(drone).toBeInstanceOf(Drone);
    expect(drone.cwd).toBe("/test/project");
  });

  it("should list hatched Drones", async () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    await colony.hatch({ cwd: "/project1" });
    await colony.hatch({ cwd: "/project2" });

    const drones = colony.listDrones();
    expect(drones).toHaveLength(2);
    expect(drones[0]?.cwd).toBe("/project1");
    expect(drones[1]?.cwd).toBe("/project2");
  });

  it("should recall Drone by ID", async () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    const drone = await colony.hatch({ cwd: "/test" });

    const recalled = colony.recall(drone.id);
    expect(recalled).toBe(drone);
  });

  it("should retire Drone", async () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    const drone = await colony.hatch({ cwd: "/test" });

    await colony.retire(drone.id);

    expect(colony.recall(drone.id)).toBeUndefined();
    expect(colony.listDrones()).toHaveLength(0);
  });

  it("should emit drone:hatched event", async () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    let hatchedDrone: Drone | undefined;

    colony.on("drone:hatched", (drone: Drone) => {
      hatchedDrone = drone;
    });

    const drone = await colony.hatch({ cwd: "/test" });

    expect(hatchedDrone).toBe(drone);
  });

  it("should emit drone:retired event", async () => {
    const colony = new AIColony({ apiKey: "test-api-key" });
    let retiredId: string | undefined;

    colony.on("drone:retired", (id: string) => {
      retiredId = id;
    });

    const drone = await colony.hatch({ cwd: "/test" });
    await colony.retire(drone.id);

    expect(retiredId).toBe(drone.id);
  });
});
