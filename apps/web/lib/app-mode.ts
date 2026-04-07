export type AppMode = "local-demo" | "production";

const configuredMode = process.env.NEXT_PUBLIC_APP_MODE;

export const appMode: AppMode =
  configuredMode === "production"
    ? "production"
    : "local-demo";

export const isLocalDemoMode = appMode === "local-demo";
