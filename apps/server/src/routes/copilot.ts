import type { FastifyInstance } from "fastify";
import { z } from "zod";

import type { createCopilotService } from "../services/copilot-service";

const chatInputSchema = z.object({
  scenarioId: z.enum(["aiops-trace", "maturity-assessment", "financial-services"]),
  question: z.string().min(2).max(500),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000)
      })
    )
    .default([])
});

export function registerCopilotRoutes(
  app: FastifyInstance,
  copilotService: ReturnType<typeof createCopilotService>
): void {
  app.post("/api/copilot/chat", async (request, reply) => {
    const parsed = chatInputSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        message: "Invalid chat payload",
        issues: parsed.error.issues
      });
    }

    const result = await copilotService.chat(parsed.data);
    return reply.send(result);
  });
}
