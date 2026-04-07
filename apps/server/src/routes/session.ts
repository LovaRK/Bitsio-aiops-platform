import type { FastifyInstance } from "fastify";
import { z } from "zod";

import type { SessionStore } from "../services/firestore-service";

const sessionSchema = z.object({
  uid: z.string().min(3),
  email: z.string().email().optional(),
  mode: z.enum(["guest", "auth"])
});

export function registerSessionRoutes(app: FastifyInstance, sessionStore: SessionStore): void {
  app.post("/api/session", async (request, reply) => {
    const parsed = sessionSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        message: "Invalid session payload",
        code: "invalid_session_payload",
        requestId: request.id,
        issues: parsed.error.issues
      });
    }

    try {
      await sessionStore.saveSession({
        ...parsed.data,
        createdAt: new Date().toISOString()
      });

      await sessionStore.addAuditLog("session.upsert", {
        uid: parsed.data.uid,
        mode: parsed.data.mode
      });

      return reply.send({ ok: true });
    } catch (error) {
      request.log.error({ error, requestId: request.id }, "Session route failed");
      return reply.status(503).send({
        message: "Session persistence unavailable",
        code: "session_persistence_unavailable",
        requestId: request.id
      });
    }
  });
}
