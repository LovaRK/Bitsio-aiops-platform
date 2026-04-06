import Fastify from "fastify";
import cors from "@fastify/cors";
import { createGatewayFromEnv } from "@bitsio/ai";

import { env } from "./config/env";
import { registerCopilotRoutes } from "./routes/copilot";
import { registerHealthRoutes } from "./routes/health";
import { registerScenarioRoutes } from "./routes/scenarios";
import { registerSessionRoutes } from "./routes/session";
import { createCopilotService } from "./services/copilot-service";
import { createSessionStore } from "./services/firestore-service";
import { createScenarioService } from "./services/scenario-service";

async function bootstrap() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: env.corsOrigin.split(",")
  });

  const gateway = createGatewayFromEnv({
    runtime: env.llmRuntime,
    timeoutMs: env.llmTimeoutMs,
    ollamaBaseUrl: env.ollamaBaseUrl,
    ollamaModel: env.ollamaModel,
    openrouterApiKey: env.openrouterApiKey,
    openrouterModel: env.openrouterModel,
    openrouterReferer: env.openrouterReferer,
    openrouterAppName: env.openrouterAppName,
    geminiApiKey: env.geminiApiKey,
    geminiModel: env.geminiModel
  });

  const sessionStore = createSessionStore(app.log);
  const scenarioService = createScenarioService(gateway, sessionStore, env.llmTimeoutMs);
  const copilotService = createCopilotService(gateway, env.llmTimeoutMs);

  registerHealthRoutes(app);
  registerScenarioRoutes(app, scenarioService);
  registerCopilotRoutes(app, copilotService);
  registerSessionRoutes(app, sessionStore);

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error, "Unhandled server error");
    void reply.status(500).send({ message: "Internal server error" });
  });

  await app.listen({
    port: env.port,
    host: "0.0.0.0"
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
