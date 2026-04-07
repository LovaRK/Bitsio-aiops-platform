import type { FastifyInstance } from "fastify";

export function registerHealthRoutes(app: FastifyInstance): void {
  app.get("/", async () => ({
    service: "bitsio-aiops-server",
    status: "ok",
    docs: {
      health: "/health",
      scenarios: "/api/scenarios",
      runScenario: "/api/scenarios/:id/run",
      copilot: "/api/copilot/chat"
    },
    timestamp: new Date().toISOString()
  }));

  app.get("/health", async () => ({
    status: "ok",
    service: "bitsio-aiops-server",
    timestamp: new Date().toISOString()
  }));
}
