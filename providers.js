// Central map of provider metadata used by the background, content, and side panel scripts.
const PROVIDERS = {
  perplexity: {
    id: "perplexity",
    label: "Perplexity",
    url: "https://www.perplexity.ai/",
    matches: ["https://www.perplexity.ai/*"],
    hostPermissions: ["https://www.perplexity.ai/*"],
    selectors: {
      input: [
        '#ask-input[contenteditable="true"]',
        'div[contenteditable="true"][role="textbox"]',
        'div[contenteditable="true"][data-lexical-editor="true"]',
        'div[contenteditable="true"]',
      ],
      submit: [
        'button[data-testid="submit-button"]',
        'button[aria-label="Submit"]',
      ],
      answer: [
        "[data-testid='chat-message'] article",
        "main article",
      ],
    },
  },
  chatgpt: {
    id: "chatgpt",
    label: "ChatGPT",
    // Support both the legacy and current ChatGPT domains.
    url: "https://chatgpt.com/",
    matches: ["https://chatgpt.com/*", "https://chat.openai.com/*"],
    hostPermissions: ["https://chatgpt.com/*", "https://chat.openai.com/*"],
    selectors: {
      input: [
        "textarea[data-id='root']",
        "textarea[aria-label]",
        "form textarea",
      ],
      submit: [
        "button[data-testid='send-button']",
        "button[aria-label*='Send']",
        "form button[type='submit']",
      ],
      answer: [
        "div[data-message-author-role='assistant']",
        "article div[data-message-author-role='assistant']",
        "main .markdown",
      ],
    },
  },
  gemini: {
    id: "gemini",
    label: "Gemini",
    url: "https://gemini.google.com/app",
    matches: ["https://gemini.google.com/*", "https://ai.google.com/*"],
    hostPermissions: ["https://gemini.google.com/*", "https://ai.google.com/*"],
    selectors: {
      input: [
        "textarea[aria-label*='prompt']",
        "textarea[aria-label*='message']",
        "textarea[aria-label*='Enter a prompt']",
        "textarea[aria-label*='Reply']",
        "textarea[aria-label*='Write a message']",
        "textarea[data-lexical-editor]",
        "div[contenteditable='true'][role='textbox']",
        "div[contenteditable='true'][aria-label*='prompt']",
        "div[contenteditable='true'][aria-label*='Message']",
        "textarea",
      ],
      submit: [
        "button[aria-label*='Submit']",
        "button[aria-label*='Send']",
        "button[type='submit'][aria-label*='Send']",
        "button[aria-label*='Send message']",
        "button[data-testid='send-button']",
        "form button[type='submit']",
      ],
      answer: [
        "[data-message-author-role='model']",
        "article[data-message-author-role='model']",
        "[data-actor='model']",
        "main article",
      ],
    },
  },
  claude: {
    id: "claude",
    label: "Claude",
    url: "https://claude.ai/new",
    matches: ["https://claude.ai/*"],
    hostPermissions: ["https://claude.ai/*"],
    selectors: {
      input: [
        "textarea[placeholder*='Type a message']",
        "textarea",
        "div[contenteditable='true']",
      ],
      submit: [
        "button[type='submit']",
        "button[aria-label*='Send']",
        "form button",
      ],
      answer: [
        "[data-testid='chat-message']",
        "div[class*='assistant']",
        "main article",
      ],
    },
  },
};

// Resolve a single provider config by id, falling back to Perplexity.
function getProviderById(id) {
  return PROVIDERS[id] || PROVIDERS.perplexity;
}

// Return all providers for UI selection.
function getProviderList() {
  return Object.values(PROVIDERS);
}

// Choose a provider based on the current tab's URL.
function resolveProviderByUrl(url) {
  if (!url) return PROVIDERS.perplexity;
  const match = getProviderList().find((provider) =>
    provider.matches.some((pattern) => {
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const normalizedPattern = escaped.replace(/\\\*/g, ".*");
      const regex = new RegExp(`^${normalizedPattern}$`);
      return regex.test(url);
    }),
  );
  return match || PROVIDERS.perplexity;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { PROVIDERS, getProviderById, getProviderList, resolveProviderByUrl };
}
