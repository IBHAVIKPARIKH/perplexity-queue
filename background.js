async function handleProcessQuestion(message, sender, sendResponse) {
  try {
    const { reuseConversation: reuseSetting } = await chrome.storage.local.get("reuseConversation");
    const reuseConversation = reuseSetting !== false;

    let targetTab = null;

    if (reuseConversation) {
      const existing = await chrome.tabs.query({ url: "https://www.perplexity.ai/*" });
      if (existing.length > 0) {
        targetTab = existing[0];
        await chrome.tabs.update(targetTab.id, { active: true });
      }
    }

    if (!targetTab) {
      targetTab = await chrome.tabs.create({ url: "https://www.perplexity.ai/", active: true });
      await waitForTabLoad(targetTab.id);
    } else {
      await waitForTabLoad(targetTab.id);
    }

    await ensureContentScriptReady(targetTab.id);

    const prepared = await prepareNewConversation(targetTab.id);
    if (!prepared) throw new Error("Failed to prepare new conversation");
    await ensureContentScriptReady(targetTab.id);

    const response = await chrome.tabs.sendMessage(targetTab.id, {
      type: "ASK_QUESTION",
      question: message.question,
      questionId: message.questionId,
    });

    sendResponse(response);
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function ensureContentScriptReady(tabId) {
  let ready = await waitForContentScript(tabId);

  if (!ready) {
    await chrome.tabs.reload(tabId);
    await sleep(3000);
    await waitForTabLoad(tabId);
    ready = await waitForContentScript(tabId);
  }

  if (!ready) {
    throw new Error(
      "Content script not ready even after page refresh. Please try manually refreshing the Perplexity page (F5).",
    );
  }
}

async function prepareNewConversation(tabId) {
  try {
    await waitForTabLoad(tabId);
    await sleep(500);
    const result = await clickNewThread(tabId);
    if (result?.clicked) {
      await sleep(1000);
      await waitForTabLoad(tabId);
    }
    return Boolean(result && (result.clicked || result.hasHome));
  } catch (error) {
    return false;
  }
}

async function clickNewThread(tabId) {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const selectors = [
          'button[aria-label="New thread"]',
          'button[aria-label*="New thread"]',
          'button:has(svg[aria-label*="New thread"])',
          'a[aria-label="Home"]',
          'a[aria-label*="Home"]',
          'a[href="/"]',
          'a[href="/home"]',
        ];

        let clicked = false;

        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el && typeof el.click === "function") {
            el.click();
            clicked = true;
            break;
          }
        }

        const home =
          document.querySelector('a[href="/"]') ||
          document.querySelector('a[href="/home"]') ||
          document.querySelector('a[aria-label*="Home"]');

        return { hasHome: Boolean(home), clicked };
      },
    });

    return result?.result || { clicked: false, hasHome: false };
  } catch (error) {
    return false;
  }
}

async function waitForContentScript(tabId, retries = 25) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { type: "PING" });
      if (response && response.ready) return true;
    } catch (error) {
      await sleep(1200);
    }
    await sleep(200);
  }
  return false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleOpenPerplexity(message, sendResponse) {
  try {
    const url = "https://www.perplexity.ai/";
    const tabs = await chrome.tabs.query({ url: "https://www.perplexity.ai/*" });
    if (tabs.length > 0) {
      await chrome.tabs.update(tabs[0].id, { url, active: true });
      sendResponse({ success: true, tabId: tabs[0].id });
    } else {
      const newTab = await chrome.tabs.create({ url, active: true });
      sendResponse({ success: true, tabId: newTab.id });
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

async function waitForTabLoad(tabId) {
  const status = (await chrome.tabs.get(tabId)).status;
  if (status !== "complete") {
    return new Promise((resolve) => {
      chrome.tabs.onUpdated.addListener(function listener(id, info) {
        if (id === tabId && info.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          setTimeout(resolve, 5000);
        }
      });
    });
  }
  await sleep(5000);
}

async function forwardToSidePanel(message) {
  try {
    await chrome.runtime.sendMessage(message);
  } catch (error) {
    // ignore runtime send errors
  }

  try {
    await chrome.storage.local.set({ pendingMessage: { ...message, timestamp: Date.now() } });
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

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status === "complete" && tab.url && tab.url.includes("perplexity.ai")) {
    // placeholder for future logic
  }
});
