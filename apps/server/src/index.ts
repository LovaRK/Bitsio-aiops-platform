import { createApp } from "./app";
import { env } from "./config/env";

async function bootstrap() {
  const app = await createApp();

  try {
    const address = await app.listen({
      port: env.port,
      host: "0.0.0.0"
    });
    app.log.info(`Server successfully listening at ${address}`);
  } catch (err) {
    app.log.error(err, "Failed to bind to port");
    process.exit(1);
  }

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
