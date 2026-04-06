import type { FastifyInstance } from "fastify";

export function registerHealthRoutes(app: FastifyInstance): void {
  app.get("/health", async () => ({
    status: "ok",
    service: "bitsio-aiops-server",
    timestamp: new Date().toISOString()
  }));
}
