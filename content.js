let currentQuestion = null;
let currentAnswer = "";
let currentSources = [];
let currentReferences = [];
let isProcessing = false;
let isParsing = false;
let sseChunks = [];

function injectSSEInterceptor() {
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
  if (isProcessing && currentQuestion) {
    sseChunks.push(chunk);
  }
}

async function handleSSEDone() {
  if (isParsing || !isProcessing || !currentQuestion || sseChunks.length === 0) {
    return;
  }

  isParsing = true;
  await parseSSEWithBackend();
}

async function handleStreamEnd() {}

async function parseSSEWithBackend() {
  if (!currentQuestion) return;

  try {
    const serverUrl =
      typeof CONFIG !== "undefined" && CONFIG.DEFAULT_SERVER_URL
        ? CONFIG.DEFAULT_SERVER_URL
        : "http://localhost:8000";

    const response = await fetch(`${serverUrl}/api/pplx-sse/parse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: currentQuestion.question,
        sse_chunks: sseChunks,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Backend API error");
    }

    const result = await response.json();
    currentAnswer = result.answer.answer || "";
    currentSources = result.answer.sources || [];
    currentReferences = result.answer.references || [];
    handleAnswerComplete();
  } catch (error) {
    sendQuestionResult(false, `Backend parsing error: ${error.message}`);
  } finally {
    isParsing = false;
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

async function inputQuestion(question) {
  try {
    let input = document.querySelector('#ask-input[contenteditable="true"]');
    if (!input) {
      input = document.querySelector('div[contenteditable="true"][role="textbox"]');
    }
    if (!input) {
      input = document.querySelector('div[contenteditable="true"][data-lexical-editor="true"]');
    }
    if (!input) {
      input = document.querySelector('div[contenteditable="true"]');
    }

    if (!input) {
      throw new Error("Perplexity input element not found");
    }

    input.focus();
    await sleep(300);
    input.textContent = "";
    input.textContent = question;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));

    const inputEvent = new InputEvent("input", {
      bubbles: true,
      cancelable: true,
      composed: true,
      data: question,
      inputType: "insertText",
    });
    input.dispatchEvent(inputEvent);

    const keydown = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    input.dispatchEvent(keydown);

    await sleep(500);
    return true;
  } catch (error) {
    return false;
  }
}

async function submitQuestion() {
  try {
    await sleep(500);
    let submitBtn = document.querySelector('button[data-testid="submit-button"]');
    if (!submitBtn) {
      submitBtn = document.querySelector('button[aria-label="Submit"]');
    }
    if (!submitBtn) {
      submitBtn = Array.from(document.querySelectorAll("button")).find(
        (btn) => btn.querySelector('use[xlink\\:href*="arrow-right"]') !== null,
      );
    }

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

async function askQuestion(question, questionId) {
  currentQuestion = { question, questionId };
  currentAnswer = "";
  currentSources = [];
  currentReferences = [];
  sseChunks = [];
  isProcessing = true;
  isParsing = false;

  try {
    const inputOk = await inputQuestion(question);
    if (!inputOk) {
      throw new Error("Failed to input question");
    }

    const submitted = await submitQuestion();
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

    return { success: true, message: "Question submitted, waiting for answer" };
  } catch (error) {
    sendQuestionResult(false, error.message);
    return { success: false, error: error.message };
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PING") {
    sendResponse({ ready: true });
    return true;
  }

  if (message.type === "ASK_QUESTION") {
    askQuestion(message.question, message.questionId)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  return undefined;
});

initializeContentScript();
