// Shared configuration constants for the extension.
const CONFIG = {
  DEFAULT_SERVER_URL: "https://ai-assistant-api.aimegatron.com",
  APP_VERSION: "1.0.0",
  APP_NAME: "Batch Question Assistant",
  DEFAULT_PROVIDER: "perplexity",
  PERPLEXITY_STREAMING: false,
};

if (typeof PROVIDERS !== "undefined") {
  CONFIG.PROVIDERS = PROVIDERS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
