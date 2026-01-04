let currentQuestion = null;
let currentAnswer = "";
let currentSources = [];
let currentReferences = [];
let isProcessing = false;
let isParsing = false;
let sseChunks = [];
const DEFAULT_PROVIDER_ID = (typeof CONFIG !== "undefined" && CONFIG.DEFAULT_PROVIDER) || "perplexity";

let providerHelpers = {};
if (typeof require !== "undefined") {
  providerHelpers = require("./providers.js");
}

function getAvailableProviders() {
  if (typeof providerHelpers.getProviderList === "function") return providerHelpers.getProviderList();
  if (typeof globalThis.getProviderList === "function") return globalThis.getProviderList();
  if (typeof PROVIDERS !== "undefined") return Object.values(PROVIDERS);
  return [];
}

function getProviderConfig(providerId) {
  if (typeof providerHelpers.getProviderById === "function") return providerHelpers.getProviderById(providerId);
  if (typeof getProviderById === "function") return getProviderById(providerId);
  if (typeof PROVIDERS !== "undefined") return PROVIDERS[providerId] || PROVIDERS.perplexity;
  return { id: DEFAULT_PROVIDER_ID, label: "Perplexity", matches: ["https://www.perplexity.ai/*"] };
}

function resolveProviderFromUrl(url) {
  if (typeof providerHelpers.resolveProviderByUrl === "function") return providerHelpers.resolveProviderByUrl(url);
  if (typeof resolveProviderByUrl === "function") return resolveProviderByUrl(url);
  return getProviderConfig(DEFAULT_PROVIDER_ID);
}

let activeProviderId =
  (typeof location !== "undefined" && resolveProviderFromUrl(location.href)?.id) || DEFAULT_PROVIDER_ID;

function setActiveProvider(providerId) {
  activeProviderId = providerId || DEFAULT_PROVIDER_ID;
}

function getActiveProvider() {
  return getProviderConfig(activeProviderId || DEFAULT_PROVIDER_ID);
}

function injectSSEInterceptor() {
  if (getActiveProvider().id !== "perplexity") return;

  try {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("injected.js");
    script.onload = function () {
      this.remove();
    };
    script.onerror = function () {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  } catch (error) {
    // Swallow injection errors to avoid breaking the host page
  }
}

function handleSSEData(chunk) {
  if (isProcessing && currentQuestion && getActiveProvider().id === "perplexity") {
    sseChunks.push(chunk);
  }
}

async function handleSSEDone() {
  if (
    isParsing ||
    !isProcessing ||
    !currentQuestion ||
    sseChunks.length === 0 ||
    getActiveProvider().id !== "perplexity"
  ) {
    return;
  }

  isParsing = true;
  await parseSSEWithBackend();
}

async function handleStreamEnd() {
  if (getActiveProvider().id !== "perplexity") return;
}

async function parseSSEWithBackend() {
  if (!currentQuestion) return;

  try {
    const { text, sources } = extractAnswerFromChunks(sseChunks);
    currentAnswer = text || "No answer received from stream.";
    currentSources = sources;
    currentReferences = [];
    handleAnswerComplete();
  } catch (error) {
    sendQuestionResult(false, `Backend parsing error: ${error.message}`);
  } finally {
    isParsing = false;
  }
}

function extractAnswerFromChunks(chunks) {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return { text: "", sources: [] };
  }

  const parts = [];
  const sources = [];

  for (const chunk of chunks) {
    const text = normalizeChunkText(chunk);
    if (text) {
      parts.push(text);
    }

    const chunkSources = normalizeSources(chunk);
    for (const src of chunkSources) {
      if (!sources.some((s) => s.url === src.url && s.title === src.title)) {
        sources.push(src);
      }
    }
  }

  const combined = parts.join("").trim() || parts.join("\n").trim();
  return { text: combined, sources };
}

function normalizeChunkText(chunk) {
  if (!chunk) return "";
  if (typeof chunk === "string") return chunk;
  if (Array.isArray(chunk)) return chunk.map(normalizeChunkText).join("");
  if (typeof chunk.text === "string") return chunk.text;
  if (Array.isArray(chunk.text)) return chunk.text.map(normalizeChunkText).join("");
  if (typeof chunk.message === "string") return chunk.message;
  if (typeof chunk.content === "string") return chunk.content;
  if (Array.isArray(chunk.content)) return chunk.content.map(normalizeChunkText).join("");
  if (chunk.delta?.content && typeof chunk.delta.content === "string") return chunk.delta.content;
  if (chunk.delta?.text && typeof chunk.delta.text === "string") return chunk.delta.text;
  if (chunk.data && typeof chunk.data === "string") return chunk.data;
  try {
    return JSON.stringify(chunk);
  } catch (error) {
    return "";
  }
}

function normalizeSources(chunk) {
  if (!chunk || typeof chunk !== "object") return [];
  const possibleSources = chunk.sources || chunk.references || chunk.citations;
  if (!Array.isArray(possibleSources)) return [];

  return possibleSources
    .map((src) => {
      if (!src) return null;
      if (typeof src === "string") {
        return { title: src, url: "", snippet: "", domain: "" };
      }
      const url = src.url || src.link || "";
      return {
        title: src.title || src.name || src.url || src.link || "",
        url,
        snippet: src.snippet || src.text || src.excerpt || "",
        domain: url ? safeGetDomain(url) : "",
      };
    })
    .filter((src) => src && (src.title || src.url));
}

function safeGetDomain(url) {
  try {
    return new URL(url).hostname;
  } catch (error) {
    return "";
  }
}

function handleSSEError(error) {
  if (isProcessing && currentQuestion) {
    sendQuestionResult(false, error);
  }
}

function handleAnswerComplete() {
  if (isProcessing && currentQuestion) {
    sendQuestionResult(true);
  }
}

function sendQuestionResult(success, errorMessage = null) {
  const result = {
    success,
    questionId: currentQuestion.questionId,
    question: currentQuestion.question,
    answer: currentAnswer,
    sources: currentSources,
    providerId: getActiveProvider().id,
    error: errorMessage,
  };

  chrome.runtime.sendMessage(
    { type: "QUESTION_COMPLETE", result },
    () => chrome.runtime.lastError,
  );

  isProcessing = false;
  currentQuestion = null;
  currentAnswer = "";
  currentSources = [];
  currentReferences = [];
  sseChunks = [];
}

function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const target = document.querySelector(selector);
      if (target) {
        observer.disconnect();
        resolve(target);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for element: ${selector}`));
    }, timeout);
  });
}

function waitForElementFromSelectors(selectors = [], timeout = 10000) {
  if (typeof document === "undefined") return Promise.reject(new Error("DOM not available"));
  const root = document.body || document.documentElement;
  if (!root) return Promise.reject(new Error("DOM not ready"));
  const existing = findElementFromSelectors(selectors);
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    const start = Date.now();

    const checkAndMaybeResolve = () => {
      const el = findElementFromSelectors(selectors);
      if (el) {
        resolve(el);
        return true;
      }
      if (Date.now() - start >= timeout) {
        reject(new Error(`Timeout waiting for elements: ${selectors.join(", ")}`));
        return true;
      }
      return false;
    };

    if (checkAndMaybeResolve()) return;

    const observer = new MutationObserver(() => {
      if (checkAndMaybeResolve()) {
        observer.disconnect();
      }
    });

    observer.observe(root, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      checkAndMaybeResolve();
    }, timeout);
  });
}

function findElementFromSelectors(selectors = []) {
  if (typeof document === "undefined") return null;
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }
  return null;
}

function findElementsFromSelectors(selectors = []) {
  if (typeof document === "undefined") return [];
  const found = [];
  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => found.push(node));
  });
  return found;
}

function extractTextFromNode(node) {
  if (!node) return "";
  if (typeof node === "string") return node.trim();
  if (Array.isArray(node)) return node.map(extractTextFromNode).join(" ").trim();
  if (typeof node.textContent === "string") return node.textContent.trim();
  if (typeof node.innerText === "string") return node.innerText.trim();
  return "";
}

function collectSourcesFromLinks(links = []) {
  return Array.from(links)
    .map((link) => {
      const href = link.href || link.url || link.link || "";
      const title = extractTextFromNode(link.textContent || link.title || href);
      let domain = "";
      try {
        domain = href ? new URL(href).hostname : "";
      } catch (error) {
        domain = "";
      }
      return href
        ? {
            title: title || href,
            url: href,
            domain,
            snippet: link.snippet || link.excerpt || "",
          }
        : null;
    })
    .filter(Boolean);
}

function getAnswerNodes(providerId) {
  const provider = getProviderConfig(providerId);
  return findElementsFromSelectors(provider?.selectors?.answer || []);
}

async function waitForAssistantMessage(providerId, previousCount = 0, timeout = 120000) {
  if (typeof document === "undefined") throw new Error("DOM not available");
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const checkForUpdate = () => {
      const nodes = getAnswerNodes(providerId);
      if (nodes.length > previousCount) {
        resolve(nodes[nodes.length - 1]);
        return true;
      }
      if (Date.now() - start >= timeout) {
        reject(new Error("Timeout waiting for answer"));
        return true;
      }
      return false;
    };

    if (checkForUpdate()) return;

    const observer = new MutationObserver(() => {
      if (checkForUpdate()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      checkForUpdate();
    }, timeout);
  });
}

function setInputValue(element, text) {
  if (!element) return false;
  if (typeof element.focus === "function") {
    element.focus();
  }

  if (element.tagName === "TEXTAREA" || element.tagName === "INPUT") {
    element.value = text;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  if (element.getAttribute && element.getAttribute("contenteditable") === "true") {
    element.textContent = "";
    element.textContent = text;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  try {
    element.textContent = text;
    return true;
  } catch (error) {
    return false;
  }
}

async function fillPromptForProvider(providerId, question) {
  const provider = getProviderConfig(providerId);
  const input =
    (await waitForElementFromSelectors(provider?.selectors?.input || [], 20000).catch(() => null)) ||
    findElementFromSelectors(provider?.selectors?.input || []);
  if (!input) return false;
  return setInputValue(input, question);
}

async function clickSubmitForProvider(providerId) {
  const provider = getProviderConfig(providerId);
  let submit =
    (await waitForElementFromSelectors(provider?.selectors?.submit || [], 20000).catch(() => null)) ||
    findElementFromSelectors(provider?.selectors?.submit || []);
  if (!submit) {
    return false;
  }

  let attempts = 0;
  while (submit.disabled && attempts < 30) {
    await sleep(100);
    attempts++;
  }

  return clickElement(submit);
}

function countAnswerNodes(providerId) {
  return getAnswerNodes(providerId).length;
}

function extractAnswerFromNode(node) {
  if (!node) return { text: "", sources: [] };
  const text = extractTextFromNode(node);
  let sources = [];
  if (node.querySelectorAll) {
    sources = collectSourcesFromLinks(node.querySelectorAll("a[href]"));
  }
  return { text, sources };
}

function clickElement(element) {
  if (!element) return false;
  try {
    element.scrollIntoView({ behavior: "instant", block: "center" });
  } catch (error) {
    // ignore scroll failures
  }

  try {
    element.click();
    return true;
  } catch (error) {
    // fall through
  }

  try {
    element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true, view: window }));
    element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, cancelable: true, view: window }));
    element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    return true;
  } catch (error) {
    // fall through
  }

  try {
    element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    element.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true }));
    element.click();
    return true;
  } catch (error) {
    return false;
  }
}

async function clickWithEvents(element) {
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  const over = new MouseEvent("mouseover", {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y,
  });
  const down = new MouseEvent("mousedown", {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y,
    button: 0,
  });
  const up = new MouseEvent("mouseup", {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y,
    button: 0,
  });
  const click = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y,
    button: 0,
  });

  element.dispatchEvent(over);
  await sleep(50);
  element.dispatchEvent(down);
  await sleep(50);
  element.dispatchEvent(up);
  await sleep(50);
  element.dispatchEvent(click);
  element.click();
}

async function inputPerplexityQuestion(question) {
  try {
    const input = await waitForElementFromSelectors(
      [
        '#ask-input[contenteditable="true"]',
        'div[contenteditable="true"][role="textbox"]',
        'div[contenteditable="true"][data-lexical-editor="true"]',
        'div[contenteditable="true"]',
      ],
      20000,
    ).catch(() => null);

    if (!input) {
      throw new Error("Perplexity input element not found");
    }

    return setInputValue(input, question);
  } catch (error) {
    return false;
  }
}

async function submitPerplexityQuestion() {
  try {
    const submitBtn =
      (await waitForElementFromSelectors(
        [
          'button[data-testid="submit-button"]',
          'button[aria-label="Submit"]',
          'button[aria-label="Send"]',
          'button[type="submit"]',
        ],
        10000,
      ).catch(() => null)) ||
      Array.from(document.querySelectorAll("button")).find(
        (btn) => btn.querySelector('use[xlink\\:href*="arrow-right"]') !== null,
      );

    if (!submitBtn) {
      throw new Error("Could not find Perplexity submit button");
    }

    if (submitBtn.disabled) {
      let attempts = 0;
      while (submitBtn.disabled && attempts < 30) {
        await sleep(100);
        attempts++;
      }
      if (submitBtn.disabled) {
        throw new Error("Submit button remained disabled");
      }
    }

    await clickElement(submitBtn);
    await sleep(1000);
    return true;
  } catch (error) {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function askQuestion(question, questionId, providerId) {
  const provider = getProviderConfig(providerId || activeProviderId);
  setActiveProvider(provider.id);

  currentQuestion = { question, questionId, providerId: provider.id };
  currentAnswer = "";
  currentSources = [];
  currentReferences = [];
  sseChunks = [];
  isProcessing = true;
  isParsing = false;

  try {
    if (provider.id === "perplexity") {
      const inputOk = await inputPerplexityQuestion(question);
      if (!inputOk) {
        throw new Error("Failed to input question");
      }

      const submitted = await submitPerplexityQuestion();
      if (!submitted) {
        throw new Error("Failed to submit question");
      }

      setTimeout(() => {
        if (isProcessing && currentQuestion && currentQuestion.questionId === questionId) {
          if (currentAnswer) {
            handleAnswerComplete();
          } else {
            sendQuestionResult(false, "Timeout waiting for answer");
          }
        }
      }, 120000);
    } else {
      const beforeCount = countAnswerNodes(provider.id);
      const inputOk = await fillPromptForProvider(provider.id, question);
      if (!inputOk) {
        throw new Error(`Failed to input question on ${provider.label}`);
      }

      const submitted = await clickSubmitForProvider(provider.id);
      if (!submitted) {
        throw new Error(`Failed to submit question on ${provider.label}`);
      }

      const latestMessageNode = await waitForAssistantMessage(provider.id, beforeCount);
      const { text, sources } = extractAnswerFromNode(latestMessageNode);
      currentAnswer = text || "No answer received.";
      currentSources = sources || [];
      currentReferences = [];
      handleAnswerComplete();
    }

    return { success: true, message: "Question submitted, waiting for answer", providerId: provider.id };
  } catch (error) {
    sendQuestionResult(false, error.message);
    return { success: false, error: error.message, providerId: provider.id };
  }
}

function initializeContentScript() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      injectSSEInterceptor();
    });
  } else {
    injectSSEInterceptor();
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const { type, data } = event.data;
    switch (type) {
      case "SSE_DATA":
        handleSSEData(data);
        break;
      case "SSE_DONE":
        handleSSEDone();
        break;
      case "SSE_STREAM_END":
        handleStreamEnd();
        break;
      case "SSE_ERROR":
        handleSSEError(event.data.error);
        break;
      default:
        break;
    }
  });
}

  if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "PING") {
      const pageProvider = resolveProviderFromUrl(typeof location !== "undefined" ? location.href : "");
      if (message.providerId && message.providerId !== pageProvider.id) {
        sendResponse({ ready: false, providerId: pageProvider.id });
        return true;
      }
      setActiveProvider(message.providerId || pageProvider.id);
      sendResponse({ ready: true, providerId: getActiveProvider().id });
      return true;
    }

    if (message.type === "ASK_QUESTION") {
      const pageProvider = resolveProviderFromUrl(typeof location !== "undefined" ? location.href : "");
      const targetProviderId = message.providerId || pageProvider.id;
      if (pageProvider.id !== targetProviderId) {
        sendResponse({
          success: false,
          error: `Active tab is ${pageProvider.label || pageProvider.id}, expected ${getProviderConfig(targetProviderId).label}`,
        });
        return true;
      }
      setActiveProvider(targetProviderId);
      askQuestion(message.question, message.questionId, targetProviderId)
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;
    }

    return undefined;
  });
}

if (typeof window !== "undefined") {
  initializeContentScript();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    extractAnswerFromChunks,
    normalizeChunkText,
    normalizeSources,
    resolveProviderFromUrl,
    collectSourcesFromLinks,
    extractTextFromNode,
    getProviderConfig,
  };
}
