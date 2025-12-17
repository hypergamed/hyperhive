import { describe, it, expect, vi } from "vitest";
import { Drone } from "../src/drone.js";

describe("Drone", () => {
  it("should create instance with config", () => {
    const drone = new Drone("test-id", { cwd: "/test" });

    expect(drone.id).toBe("test-id");
    expect(drone.cwd).toBe("/test");
    expect(drone.status).toBe("idle");
  });

  it("should use default model when not provided", () => {
    const drone = new Drone("test-id", { cwd: "/test" });
    expect(drone.model).toBe("balanced");
  });

  it("should use custom model when provided", () => {
    const drone = new Drone("test-id", { cwd: "/test", model: "powerful" });
    expect(drone.model).toBe("powerful");
  });

  it("should store metadata", () => {
    const drone = new Drone("test-id", {
      cwd: "/test",
      metadata: { userId: "user-123" },
    });

    expect(drone.metadata).toEqual({ userId: "user-123" });
  });

  it("should buzz and emit events", async () => {
    const drone = new Drone("test-id", { cwd: "/test" });
    const messageHandler = vi.fn();
    const statusHandler = vi.fn();
    const completeHandler = vi.fn();

    drone.on("message", messageHandler);
    drone.on("status", statusHandler);
    drone.on("complete", completeHandler);

    await drone.buzz("Hello");

    expect(messageHandler).toHaveBeenCalledOnce();
    expect(statusHandler).toHaveBeenCalledWith("thinking");
    expect(statusHandler).toHaveBeenCalledWith("idle");
    expect(completeHandler).toHaveBeenCalledOnce();
  });

  it("should throw error when buzzing while not idle", async () => {
    const drone = new Drone("test-id", { cwd: "/test" });

    // Manually set status to thinking to simulate a busy drone
    // @ts-expect-error - accessing private property for testing
    drone._status = "thinking";

    // Try to buzz while drone is busy
    await expect(drone.buzz("Second")).rejects.toThrow("Cannot buzz while Drone is thinking");
  });

  it("should get messages", async () => {
    const drone = new Drone("test-id", { cwd: "/test" });

    await drone.buzz("Hello");

    const messages = drone.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0]?.content).toContain("Hello");
  });

  it("should get last message", async () => {
    const drone = new Drone("test-id", { cwd: "/test" });

    await drone.buzz("First");
    await drone.buzz("Second");

    const lastMessage = drone.getLastMessage();
    expect(lastMessage?.content).toContain("Second");
  });

  it("should clear messages", async () => {
    const drone = new Drone("test-id", { cwd: "/test" });

    await drone.buzz("Hello");
    expect(drone.getMessages()).toHaveLength(1);

    drone.clearMessages();
    expect(drone.getMessages()).toHaveLength(0);
  });

  it("should support message pagination", async () => {
    const drone = new Drone("test-id", { cwd: "/test" });

    await drone.buzz("First");
    await drone.buzz("Second");
    await drone.buzz("Third");

    const limited = drone.getMessages({ limit: 2 });
    expect(limited).toHaveLength(2);

    const offset = drone.getMessages({ offset: 1 });
    expect(offset).toHaveLength(2);

    const both = drone.getMessages({ offset: 1, limit: 1 });
    expect(both).toHaveLength(1);
  });

  it("should retire and remove listeners", async () => {
    const drone = new Drone("test-id", { cwd: "/test" });
    const handler = vi.fn();

    drone.on("message", handler);
    await drone.retire();

    // After retire, listeners should be removed
    expect(drone.listenerCount("message")).toBe(0);
  });

  it("should interrupt operation", async () => {
    const drone = new Drone("test-id", { cwd: "/test" });

    // Interrupt while idle should be no-op
    await drone.interrupt();
    expect(drone.status).toBe("idle");
  });
});
