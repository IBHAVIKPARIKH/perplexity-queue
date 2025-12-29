const PERPLEXITY_URL = "https://www.perplexity.ai/";

async function handleProcessQuestion(request, sender, sendResponse) {
  const reuseConversation = request?.reuseConversation !== false; // default: reuse same chat

  try {
    const tabId = await ensurePerplexityTab(reuseConversation);
    const ready = await ensureContentScript(tabId, reuseConversation);
    if (!ready) {
      throw new Error("Perplexity tab not ready. Please refresh the page and try again.");
    }

    const result = await chrome.tabs.sendMessage(tabId, {
      type: "ASK_QUESTION",
      question: request.question,
      questionId: request.questionId,
    });

    sendResponse(result);
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function ensurePerplexityTab(reuseConversation) {
  const existing = await chrome.tabs.query({ url: `${PERPLEXITY_URL}*` });
  let tab = existing[0];

  if (!tab) {
    tab = await chrome.tabs.create({ url: PERPLEXITY_URL, active: true });
    await waitForTabLoad(tab.id);
    return tab.id;
  }

  // Reuse without reloading to stay in the same conversation
  if (reuseConversation) {
    await chrome.tabs.update(tab.id, { active: true });
    return tab.id;
  }

  // Force a fresh conversation by reloading the home page
  await chrome.tabs.update(tab.id, { url: PERPLEXITY_URL, active: true });
  await waitForTabLoad(tab.id);
  return tab.id;
}

async function ensureContentScript(tabId, reuseConversation) {
  const ready = await waitForContentScript(tabId);
  if (ready) return true;

  // Try a single reload to inject the content script
  await chrome.tabs.reload(tabId);
  await sleep(3000);
  await waitForTabLoad(tabId);
  return waitForContentScript(tabId);
}

async function waitForContentScript(tabId, attempts = 25) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await chrome.tabs.sendMessage(tabId, { type: "PING" });
      if (res && res.ready) return true;
    } catch (error) {
      await sleep(1200);
    }
  }
  return false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleOpenPerplexity(request, sendResponse) {
  try {
    const existing = await chrome.tabs.query({ url: `${PERPLEXITY_URL}*` });
    if (existing.length > 0) {
      await chrome.tabs.update(existing[0].id, { active: true });
      sendResponse({ success: true, tabId: existing[0].id });
      return;
    }

    const tab = await chrome.tabs.create({ url: PERPLEXITY_URL, active: true });
    sendResponse({ success: true, tabId: tab.id });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

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
    case "OPEN_CHATGPT":
      handleOpenPerplexity(message, sendResponse);
      return true;
    default:
      break;
  }
  return undefined;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && tab.url.includes("perplexity.ai")) {
    // placeholder for future hooks
  }
});
