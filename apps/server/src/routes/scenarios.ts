import type { FastifyInstance } from "fastify";
import { z } from "zod";

import type { ScenarioService } from "../services/scenario-service";

const scenarioIdSchema = z.enum([
  "aiops-trace",
  "maturity-assessment",
  "financial-services"
]);

export function registerScenarioRoutes(app: FastifyInstance, scenarioService: ScenarioService): void {
  app.get("/api/scenarios", async () => ({
    scenarios: scenarioService.list()
  }));

  app.post("/api/scenarios/:id/run", async (request, reply) => {
    const paramsResult = scenarioIdSchema.safeParse((request.params as { id?: string }).id);

    if (!paramsResult.success) {
      return reply.status(400).send({
        message: "Invalid scenario id"
      });
    }

    try {
      const result = await scenarioService.runScenario(paramsResult.data);
      return reply.send(result);
    } catch (error) {
      request.log.error(error, "Failed to run scenario");
      return reply.status(502).send({
        message: "Unable to generate scenario reasoning at this time"
      });
    }
  });
}
