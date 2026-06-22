export const MODEL_PROVIDERS = {
  deepseek: {
    label: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-v4-flash"
  },
  minimax: {
    label: "MiniMax",
    baseUrl: "https://api.minimaxi.com/v1",
    model: "MiniMax-M2.7"
  },
  custom: {
    label: "Custom",
    baseUrl: "",
    model: ""
  }
};

export function normalizeModelSettings(input = {}) {
  const explicitlyDisabled = input.enabled === false;
  const envProvider = process.env.DIGITAL_LIFE_LLM_PROVIDER || process.env.DIGITAL_LIFE_MODEL_PROVIDER || "";
  const envBaseUrl = process.env.DIGITAL_LIFE_LLM_BASE_URL || process.env.DIGITAL_LIFE_MODEL_BASE_URL || "";
  const envModel = process.env.DIGITAL_LIFE_LLM_MODEL || process.env.DIGITAL_LIFE_MODEL || "";
  const providerId = String(input.provider || envProvider || "deepseek").toLowerCase();
  const preset = MODEL_PROVIDERS[providerId] || MODEL_PROVIDERS.custom;
  const baseUrl = String(input.baseUrl || envBaseUrl || preset.baseUrl || "").trim().replace(/\/+$/, "");
  const model = String(input.model || envModel || preset.model || "").trim();
  const apiKey = explicitlyDisabled ? "" : String(input.apiKey || envApiKeyFor(providerId, baseUrl)).trim();
  return {
    provider: providerId,
    providerLabel: preset.label || providerId,
    baseUrl,
    model,
    apiKey,
    enabled: !explicitlyDisabled && Boolean(apiKey && baseUrl && model)
  };
}

function envApiKeyFor(providerId, baseUrl) {
  if (process.env.DIGITAL_LIFE_LLM_API_KEY) return process.env.DIGITAL_LIFE_LLM_API_KEY;
  if (process.env.DIGITAL_LIFE_MODEL_API_KEY) return process.env.DIGITAL_LIFE_MODEL_API_KEY;
  if (providerId === "deepseek" || /deepseek/i.test(baseUrl)) return process.env.DEEPSEEK_API_KEY || "";
  if (/openai/i.test(baseUrl)) return process.env.OPENAI_API_KEY || "";
  return "";
}

export function chatCompletionsUrl(baseUrl) {
  return baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`;
}
