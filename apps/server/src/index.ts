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
import { AppError } from "./utils/app-error";

async function bootstrap() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: env.corsOrigin.split(",")
  });

  app.addHook("onSend", async (request, reply, payload) => {
    reply.header("x-request-id", request.id);
    return payload;
  });

  const gateway = createGatewayFromEnv({
    runtime: env.llmRuntime,
    timeoutMs: env.llmTimeoutMs,
    allowCloudProviders: env.allowCloudProviders,
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
  const scenarioService = createScenarioService(gateway, sessionStore, {
    timeoutMs: env.llmTimeoutMs,
    promptMaxChars: env.llmMaxPromptChars,
    cacheTtlMs: env.scenarioCacheTtlMs
  });
  const copilotService = createCopilotService(gateway, {
    timeoutMs: env.llmTimeoutMs,
    promptMaxChars: env.llmMaxPromptChars,
    cacheTtlMs: env.copilotCacheTtlMs
  });

  registerHealthRoutes(app);
  registerScenarioRoutes(app, scenarioService);
  registerCopilotRoutes(app, copilotService);
  registerSessionRoutes(app, sessionStore);

  app.setErrorHandler((error, request, reply) => {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const code = error instanceof AppError ? error.code : "internal_error";
    const message = error instanceof AppError ? error.message : "Internal server error";

    app.log.error({ error, requestId: request.id }, "Unhandled server error");
    void reply.status(statusCode).send({
      message,
      code,
      requestId: request.id
    });
  });

  await app.listen({
    port: env.port,
    host: "0.0.0.0"
  });

  app.log.info(
    {
      appMode: env.appMode,
      llmRuntime: env.llmRuntime,
      allowCloudProviders: env.allowCloudProviders,
      firestoreEnabled: env.firestoreEnabled
    },
    "Runtime mode configured"
  );
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
