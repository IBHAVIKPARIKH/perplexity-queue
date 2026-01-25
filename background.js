// Background service worker: orchestrates provider tabs + message routing.
importScripts("providers.js", "config.js");

const DEFAULT_PROVIDER_ID = (CONFIG && CONFIG.DEFAULT_PROVIDER) || "perplexity";

// Resolve provider config by id with safe fallback.
function getProviderConfig(providerId) {
  if (typeof getProviderById === "function") {
    return getProviderById(providerId);
  }
  if (typeof PROVIDERS !== "undefined") {
    return PROVIDERS[providerId] || PROVIDERS.perplexity;
  }
  return { id: "perplexity", label: "Perplexity", url: "https://www.perplexity.ai/" };
}

// Determine the active provider (stored choice or default).
async function resolveProvider(requestedId) {
  let providerId = requestedId || DEFAULT_PROVIDER_ID;

  if (!requestedId) {
    try {
      const stored = await chrome.storage.local.get(["providerId"]);
      if (stored.providerId) {
        providerId = stored.providerId;
      }
    } catch (error) {
      providerId = DEFAULT_PROVIDER_ID;
    }
  }

  return getProviderConfig(providerId);
}

// Process a single queued question from the side panel.
async function handleProcessQuestion(request, sender, sendResponse) {
  const reuseConversation = request?.reuseConversation !== false; // default: reuse same chat

  try {
    const provider = await resolveProvider(request.providerId);
    chrome.storage.local.set({ providerId: provider.id });

    const tabId = await ensureProviderTab(provider, reuseConversation);
    const ready = await ensureContentScript(tabId, provider);
    if (!ready) {
      throw new Error(`${provider.label} tab not ready. Please refresh the page and try again.`);
    }

    const result = await chrome.tabs.sendMessage(tabId, {
      type: "ASK_QUESTION",
      question: request.question,
      questionId: request.questionId,
      providerId: provider.id,
    });

    sendResponse(result);
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Find or create a provider tab, optionally forcing a fresh conversation.
async function ensureProviderTab(provider, reuseConversation) {
  const existing = await chrome.tabs.query({ url: `${provider.url}*` });
  let tab = existing[0];

  if (!tab) {
    tab = await chrome.tabs.create({ url: provider.url, active: true });
    await waitForTabLoad(tab.id);
    return tab.id;
  }

  if (reuseConversation) {
    await chrome.tabs.update(tab.id, { active: true });
    return tab.id;
  }

  await chrome.tabs.update(tab.id, { url: provider.url, active: true });
  await waitForTabLoad(tab.id);
  return tab.id;
}

// Check whether a tab URL matches the provider match patterns.
function urlMatchesProvider(url, provider) {
  if (!url || !provider?.matches) return false;
  return provider.matches.some((pattern) => {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const normalizedPattern = escaped.replace(/\\\*/g, ".*");
    const regex = new RegExp(`^${normalizedPattern}$`);
    return regex.test(url);
  });
}

// Ensure content script is active; reload if needed.
async function ensureContentScript(tabId, provider) {
  const ready = await waitForContentScript(tabId, provider.id);
  if (ready) return true;

  const tab = await chrome.tabs.get(tabId);
  if (!urlMatchesProvider(tab.url, provider)) {
    await chrome.tabs.update(tabId, { url: provider.url, active: true });
    await waitForTabLoad(tabId);
  } else {
    await chrome.tabs.reload(tabId);
    await sleep(3000);
  }

  await waitForTabLoad(tabId);
  return waitForContentScript(tabId, provider.id);
}

// Poll the tab to see if the content script responds to PING.
async function waitForContentScript(tabId, providerId, attempts = 25) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await chrome.tabs.sendMessage(tabId, { type: "PING", providerId });
      if (res && res.ready && (!providerId || res.providerId === providerId)) return true;
    } catch (error) {
      await sleep(1200);
    }
  }
  return false;
}

// Simple sleep helper.
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Open a provider tab without submitting a question.
async function handleOpenProvider(request, sendResponse) {
  try {
    const provider = await resolveProvider(request.providerId);
    chrome.storage.local.set({ providerId: provider.id });

    const existing = await chrome.tabs.query({ url: `${provider.url}*` });
    if (existing.length > 0) {
      await chrome.tabs.update(existing[0].id, { active: true });
      sendResponse({ success: true, tabId: existing[0].id, providerId: provider.id });
      return;
    }

    const tab = await chrome.tabs.create({ url: provider.url, active: true });
    sendResponse({ success: true, tabId: tab.id, providerId: provider.id });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Wait for the tab to finish loading before injection.
async function waitForTabLoad(tabId) {
  const tab = await chrome.tabs.get(tabId);
  if (tab.status === "complete") {
    await sleep(5000);
    return;
  }

  return new Promise((resolve) => {
    const listener = (updatedTabId, info) => {
      if (updatedTabId === tabId && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        setTimeout(resolve, 5000);
      }
    };

    chrome.tabs.onUpdated.addListener(listener);
  });
}

// Forward log/progress messages to the side panel (with storage fallback).
async function forwardToSidePanel(message) {
  try {
    await chrome.runtime.sendMessage(message);
  } catch (error) {
    // ignore runtime send errors
  }

  try {
    await chrome.storage.local.set({
      pendingMessage: { ...message, timestamp: Date.now() },
    });
  } catch (error) {
    // ignore storage errors
  }
}

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "PROCESS_QUESTION":
      handleProcessQuestion(message, sender, sendResponse);
      return true;
    case "UPDATE_PROGRESS":
    case "LOG_MESSAGE":
      forwardToSidePanel(message);
      break;
    case "QUESTION_COMPLETE":
      forwardToSidePanel(message);
      sendResponse({ received: true });
      return true;
    case "OPEN_PROVIDER":
      handleOpenProvider(message, sendResponse);
      return true;
    default:
      break;
  }
  return undefined;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    // placeholder for future provider-specific hooks
  }
});
