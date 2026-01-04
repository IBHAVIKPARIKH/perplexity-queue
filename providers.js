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
    url: "https://chat.openai.com/",
    matches: ["https://chat.openai.com/*", "https://chatgpt.com/*"],
    hostPermissions: ["https://chat.openai.com/*", "https://chatgpt.com/*"],
    selectors: {
      input: [
        "textarea[data-id='root']",
        "textarea[aria-label]",
        "form textarea",
        "textarea[placeholder*='Message']",
        "div[contenteditable='true'][data-lexical-editor='true']",
      ],
      submit: [
        "button[data-testid='send-button']",
        "button[aria-label*='Send']",
        "form button[type='submit']",
        "button[aria-label='Send message']",
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
        "textarea[aria-label*='prompt' i]",
        "textarea[aria-label*='message' i]",
        "textarea[placeholder]",
        "textarea",
        "div[contenteditable='true']",
        "[role='textbox'][contenteditable='true']",
      ],
      submit: [
        "button[aria-label*='Submit' i]",
        "button[aria-label*='Send' i]",
        "form button[type='submit']",
        "button[type='submit']",
        "button[data-testid*='send']",
      ],
      answer: [
        "[data-message-author-role='model']",
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
        "textarea[placeholder*='Message']",
        "textarea[aria-label*='Message' i]",
        "textarea",
        "div[contenteditable='true']",
        "div[contenteditable='true'][role='textbox']",
      ],
      submit: [
        "button[type='submit']",
        "button[aria-label*='Send']",
        "button[data-testid*='send']",
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

function getProviderById(id) {
  return PROVIDERS[id] || PROVIDERS.perplexity;
}

function getProviderList() {
  return Object.values(PROVIDERS);
}

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
