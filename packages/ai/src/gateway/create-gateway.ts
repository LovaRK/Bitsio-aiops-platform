import type { LLMProvider } from "@bitsio/domain";

import { GeminiProvider } from "../providers/gemini-provider";
import { HeuristicProvider } from "../providers/heuristic-provider";
import { OllamaProvider } from "../providers/ollama-provider";
import { OpenRouterProvider } from "../providers/openrouter-provider";
import { LLMGateway } from "./llm-gateway";

export interface GatewayEnv {
  runtime: "ollama" | "openrouter" | "gemini";
  timeoutMs: number;
  allowCloudProviders: boolean;
  ollamaBaseUrl: string;
  ollamaModel: string;
  openrouterApiKey: string;
  openrouterModel: string;
  openrouterReferer?: string;
  openrouterAppName?: string;
  geminiApiKey: string;
  geminiModel: string;
}

export function createGatewayFromEnv(env: GatewayEnv): LLMGateway {
  const ollama = new OllamaProvider({
    baseUrl: env.ollamaBaseUrl,
    model: env.ollamaModel
  });

  const openrouter = new OpenRouterProvider({
    apiKey: env.openrouterApiKey,
    model: env.openrouterModel,
    referer: env.openrouterReferer,
    appName: env.openrouterAppName
  });

  const gemini = new GeminiProvider({
    apiKey: env.geminiApiKey,
    model: env.geminiModel
  });

  const heuristic = new HeuristicProvider();

  const providerOrder = selectProviderOrder(env.runtime, env.allowCloudProviders, [
    ollama,
    openrouter,
    gemini,
    heuristic
  ]);
  return new LLMGateway(providerOrder);
}

function selectProviderOrder(
  runtime: GatewayEnv["runtime"],
  allowCloudProviders: boolean,
  providers: LLMProvider[]
): LLMProvider[] {
  const byName = new Map(providers.map((provider) => [provider.name, provider]));

  const orders: Record<GatewayEnv["runtime"], string[]> = {
    ollama: ["ollama", "openrouter", "gemini", "heuristic-local"],
    openrouter: ["openrouter", "gemini", "ollama", "heuristic-local"],
    gemini: ["gemini", "openrouter", "ollama", "heuristic-local"]
  };

  const localOnlyOrder: string[] = ["ollama", "heuristic-local"];
  const selectedOrder = allowCloudProviders ? orders[runtime] : localOnlyOrder;

  return selectedOrder
    .map((name) => byName.get(name))
    .filter((provider): provider is LLMProvider => Boolean(provider));
}
