const BROWSER_LANG = chrome.i18n.getUILanguage().toLowerCase().startsWith("zh") ? "zh" : "en";

const KEY_MAP = {
  title: "title",
  "login.title": "loginTitle",
  "login.subtitle": "loginSubtitle",
  "login.email": "loginEmail",
  "login.password": "loginPassword",
  "login.loginBtn": "loginLoginBtn",
  "login.registerBtn": "loginRegisterBtn",
  "login.browseWithoutLogin": "loginBrowseWithoutLogin",
  "login.noAccount": "loginNoAccount",
  "login.goToRegister": "loginGoToRegister",
  "login.loggingIn": "loginLoggingIn",
  "login.registering": "loginRegistering",
  "login.loginSuccess": "loginSuccess",
  "login.registerSuccess": "loginRegisterSuccess",
  "login.loginFailed": "loginFailed",
  "login.registerFailed": "loginRegisterFailed",
  "login.invalidEmail": "loginInvalidEmail",
  "login.passwordTooShort": "loginPasswordTooShort",
  "login.pleaseLoginFirst": "loginPleaseLoginFirst",
  "register.title": "registerTitle",
  "register.subtitle": "registerSubtitle",
  "register.passwordConfirm": "registerPasswordConfirm",
  "register.backToLogin": "registerBackToLogin",
  "register.hasAccount": "registerHasAccount",
  "register.goToLogin": "registerGoToLogin",
  registerPasswordMismatch: "registerPasswordMismatch",
  "header.title": "headerTitle",
  "header.openChatGPT": "headerOpenChatGPT",
  "header.login": "headerLogin",
  "header.logout": "headerLogout",
  "header.loggedInAs": "headerLoggedInAs",
  "header.guestMode": "headerGuestMode",
  "header.register": "headerRegister",
  "notice.title": "noticeTitle",
  "notice.chatgptLogin": "noticeChatgptLogin",
  "input.title": "inputTitle",
  "input.placeholder": "inputPlaceholder",
  "input.addBtn": "inputAddBtn",
  "input.clearBtn": "inputClearBtn",
  "control.title": "controlTitle",
  "control.startBtn": "controlStartBtn",
  "control.pauseBtn": "controlPauseBtn",
  "control.resumeBtn": "controlResumeBtn",
  "control.stopBtn": "controlStopBtn",
  "control.retryBtn": "controlRetryBtn",
  "control.useWebSearch": "controlUseWebSearch",
  "control.useWebSearchHint": "controlUseWebSearchHint",
  "stats.total": "statsTotal",
  "stats.completed": "statsCompleted",
  "stats.success": "statsSuccess",
  "stats.failed": "statsFailed",
  "progress.ready": "progressReady",
  "progress.running": "progressRunning",
  "progress.processing": "progressProcessing",
  "progress.paused": "progressPaused",
  "progress.completed": "progressCompleted",
  "log.title": "logTitle",
  "questions.title": "questionsTitle",
  "questions.exportBtn": "questionsExportBtn",
  "questions.clearBtn": "questionsClearBtn",
  "questions.question": "questionsQuestion",
  "questions.answer": "questionsAnswer",
  "questions.sources": "questionsSources",
  "questions.viewAnswer": "questionsViewAnswer",
  "questions.hideAnswer": "questionsHideAnswer",
  "questions.noQuestions": "questionsNoQuestions",
  "questions.addToStart": "questionsAddToStart",
  "questions.noAnswer": "questionsNoAnswer",
  "questions.errorInfo": "questionsErrorInfo",
  "questions.unknownError": "questionsUnknownError",
  "questions.status.pending": "statusPending",
  "questions.status.processing": "statusProcessing",
  "questions.status.completed": "statusCompleted",
  "questions.status.failed": "statusFailed",
  "messages.pleaseEnterQuestion": "msgPleaseEnterQuestion",
  "messages.questionsAdded": "msgQuestionsAdded",
  "messages.inputCleared": "msgInputCleared",
  "messages.alreadyRunning": "msgAlreadyRunning",
  "messages.noQuestions": "msgNoQuestions",
  "messages.pleaseAddQuestions": "msgPleaseAddQuestions",
  "messages.executionStarted": "msgExecutionStarted",
  "messages.executionPaused": "msgExecutionPaused",
  "messages.executionResumed": "msgExecutionResumed",
  "messages.executionStopped": "msgExecutionStopped",
  "messages.noFailedQuestions": "msgNoFailedQuestions",
  "messages.retryingFailed": "msgRetryingFailed",
  "messages.noResults": "msgNoResults",
  "messages.resultsExported": "msgResultsExported",
  "messages.pleaseStopFirst": "msgPleaseStopFirst",
  "messages.confirmClearAll": "msgConfirmClearAll",
  "messages.allCleared": "msgAllCleared",
  "messages.completed": "msgCompleted",
  "messages.failed": "msgFailed",
  "messages.waitingNext": "msgWaitingNext",
  "messages.allCompleted": "msgAllCompleted",
  "messages.chatGPTOpened": "msgChatGPTOpened",
  "messages.chatGPTOpenFailed": "msgChatGPTOpenFailed",
  "messages.openingChatGPT": "msgOpeningChatGPT",
  "messages.cannotOpenChatGPT": "msgCannotOpenChatGPT",
  "messages.error": "msgError",
  "messages.startingBatch": "msgStartingBatch",
  "messages.foundPending": "msgFoundPending",
  "messages.waitingPage": "msgWaitingPage",
  "messages.startingFirst": "msgStartingFirst",
  "messages.resetFailed": "msgResetFailed",
  "messages.submittedWaiting": "msgSubmittedWaiting",
  "messages.processingFailed": "msgProcessingFailed",
  "messages.loadedQuestions": "msgLoadedQuestions",
  "messages.loadFailed": "msgLoadFailed",
  "messages.ready": "msgReady",
};

let questions = [];
let isRunning = false;
let isPaused = false;
let currentIndex = 0;

const questionsInput = document.getElementById("questionsInput");
const addQuestionsBtn = document.getElementById("addQuestionsBtn");
const clearInputBtn = document.getElementById("clearInputBtn");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const stopBtn = document.getElementById("stopBtn");
const stopBtn2 = document.getElementById("stopBtn2");
const retryFailedBtn = document.getElementById("retryFailedBtn");
const exportBtn = document.getElementById("exportBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");
const idleButtons = document.getElementById("idleButtons");
const runningButtons = document.getElementById("runningButtons");
const pausedButtons = document.getElementById("pausedButtons");
const retryButtonContainer = document.getElementById("retryButtonContainer");
const questionsList = document.getElementById("questionsList");
const logContainer = document.getElementById("logContainer");
const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const successCount = document.getElementById("successCount");
const failedCount = document.getElementById("failedCount");
const progressFill = document.getElementById("progressFill");

function setupEventListeners() {
  addQuestionsBtn.addEventListener("click", handleAddQuestions);
  clearInputBtn.addEventListener("click", handleClearInput);
  startBtn.addEventListener("click", handleStart);
  pauseBtn.addEventListener("click", handlePause);
  resumeBtn.addEventListener("click", handleResume);
  stopBtn.addEventListener("click", handleStop);
  stopBtn2.addEventListener("click", handleStop);
  retryFailedBtn.addEventListener("click", handleRetryFailed);
  exportBtn.addEventListener("click", handleExport);
  clearAllBtn.addEventListener("click", handleClearAll);
}

function t(key, params) {
  let message;
  const mappedKey = KEY_MAP[key] || key;

  if (params) {
    if (typeof params !== "object" || Array.isArray(params)) {
      message = Array.isArray(params)
        ? chrome.i18n.getMessage(mappedKey, params.map(String))
        : chrome.i18n.getMessage(mappedKey, String(params));
    } else {
      const values = Object.values(params);
      message = chrome.i18n.getMessage(mappedKey, values.map(String));
    }
  } else {
    message = chrome.i18n.getMessage(mappedKey);
  }

  if (!message) {
    return key;
  }

  if (params && typeof params === "object" && !Array.isArray(params)) {
    message = message.replace(/\{(\w+)\}/g, (match, name) => {
      return params[name] !== undefined ? params[name] : match;
    });
  }

  return message;
}

function applyTranslations() {
  document.title = t("title");
  document.documentElement.lang = BROWSER_LANG;

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    node.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const key = node.getAttribute("data-i18n-placeholder");
    node.placeholder = t(key);
  });

  updateUI();
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function handleAddQuestions() {
  const input = questionsInput.value.trim();
  if (!input) {
    addLog(t("messages.pleaseEnterQuestion"), "warning");
    return;
  }

  const lines = input.split("\n").filter((line) => line.trim());
  let added = 0;

  lines.forEach((line) => {
    const question = line.trim();
    if (!question) return;

    questions.push({
      id: generateUUID(),
      question,
      status: "pending",
      answer: "",
      sources: [],
      timestamp: Date.now(),
      error: null,
    });
    added++;
  });

  if (added > 0) {
    questionsInput.value = "";
    saveQuestions();
    updateUI();
    addLog(`${added} ${t("messages.questionsAdded")}`, "success");
  }
}

function handleClearInput() {
  questionsInput.value = "";
}

async function handleStart() {
  if (questions.length === 0) {
    addLog(t("messages.noQuestions"), "warning");
    return;
  }

  const pending = questions.filter(
    (item) => item.status === "pending" || item.status === "failed",
  );

  if (pending.length === 0) {
    addLog(t("messages.noQuestions"), "warning");
    return;
  }

  questions.forEach((item) => {
    if (item.status === "failed") {
      item.status = "pending";
      item.error = null;
    }
  });

  saveQuestions();
  updateUI();
  addLog(t("messages.openingChatGPT"), "info");

  try {
    const result = await chrome.runtime.sendMessage({ type: "OPEN_CHATGPT" });
    if (!result.success) {
      addLog(`${t("messages.cannotOpenChatGPT")}: ${result.error}`, "error");
      return;
    }
  } catch (error) {
    addLog(`${t("messages.error")}: ${error.message}`, "error");
    return;
  }

  isRunning = true;
  isPaused = false;
  currentIndex = 0;
  updateControlButtons();

  addLog(t("messages.startingBatch"), "info");
  addLog(t("messages.foundPending", { count: pending.length }), "info");
  addLog(t("messages.waitingPage"), "info");

  await sleep(3000);

  addLog(t("messages.startingFirst"), "info");
  processNextQuestion();
}

function handlePause() {
  isPaused = true;
  updateControlButtons();
  addLog(t("messages.executionPaused"), "warning");
}

function handleResume() {
  isPaused = false;
  updateControlButtons();
  addLog(t("messages.executionResumed"), "info");
  processNextQuestion();
}

function handleStop() {
  isRunning = false;
  isPaused = false;
  let resetCount = 0;

  questions.forEach((question) => {
    if (question.status === "processing") {
      question.status = "pending";
      resetCount++;
    }
  });

  saveQuestions();
  updateControlButtons();
  updateUI();

  if (resetCount > 0) {
    addLog(`⏹️ 已停止执行，${resetCount} 个问题已重置为待处理状态`, "warning");
  } else {
    addLog(t("messages.executionStopped"), "warning");
  }
}

function handleRetryFailed() {
  if (isRunning) {
    addLog(t("messages.pleaseStopFirst"), "warning");
    return;
  }

  const failed = questions.filter((item) => item.status === "failed");
  if (failed.length === 0) {
    addLog(t("messages.noFailedQuestions"), "info");
    return;
  }

  failed.forEach((item) => {
    item.status = "pending";
    item.error = null;
  });

  saveQuestions();
  updateUI();
  addLog(t("messages.resetFailed").replace("{count}", failed.length), "success");
}

async function processNextQuestion() {
  if (!isRunning || isPaused) return;

  let next = null;
  for (let i = currentIndex; i < questions.length; i++) {
    if (questions[i].status === "pending") {
      next = questions[i];
      currentIndex = i;
      break;
    }
  }

  if (!next) {
    isRunning = false;
    updateControlButtons();
    addLog(t("messages.allCompleted"), "success");
    return;
  }

  next.status = "processing";
  saveQuestions();
  updateUI();

  const preview = next.question.substring(0, 50);
  addLog(`[${currentIndex + 1}/${questions.length}]: ${preview}...`, "info");

  try {
    const response = await chrome.runtime.sendMessage({
      type: "PROCESS_QUESTION",
      question: next.question,
      questionId: next.id,
    });

    if (!response || !response.success) {
      throw new Error(response?.error || "No response from background script");
    }

    addLog(t("messages.submittedWaiting"), "info");
  } catch (error) {
    next.status = "failed";
    next.error = error.message;
    saveQuestions();
    updateUI();
    addLog(`${t("messages.processingFailed")}: ${error.message}`, "error");
    currentIndex++;

    if (isRunning && !isPaused) {
      await sleep(2000);
      processNextQuestion();
    }
  }
}

function handleQuestionComplete(result) {
  const question = questions.find((item) => item.id === result.questionId);
  if (!question || question.status === "completed" || question.status === "failed") {
    return;
  }

  if (result.success) {
    question.status = "completed";
    question.answer = result.answer;
    question.sources = result.sources || [];
    question.completedAt = Date.now();
    addLog(`${t("messages.completed")}: ${question.question.substring(0, 50)}...`, "success");
  } else {
    question.status = "failed";
    question.error = result.error;
    question.completedAt = Date.now();
    addLog(
      `${t("messages.failed")}: ${question.question.substring(0, 50)}... - ${result.error}`,
      "error",
    );
  }

  saveQuestions();
  updateUI();
  currentIndex++;

  if (isRunning && !isPaused) {
    addLog(t("messages.waitingNext"), "info");
    sleep(3000).then(() => processNextQuestion());
  }
}

function handleExport() {
  if (questions.length === 0) {
    addLog(t("messages.noResults"), "warning");
    return;
  }

  const payload = {
    exportTime: new Date().toISOString(),
    totalQuestions: questions.length,
    completedQuestions: questions.filter((q) => q.status === "completed").length,
    questions: questions.map((q) => ({
      question: q.question,
      status: q.status,
      answer: q.answer,
      sources: q.sources,
      timestamp: q.timestamp,
      completedAt: q.completedAt,
      error: q.error,
    })),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `perplexity-answers-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  addLog(t("messages.resultsExported"), "success");
}

function handleClearAll() {
  if (isRunning) {
    addLog("请先停止处理", "warning");
    return;
  }

  const confirmed = confirm("确定要清空所有问题吗？");
  if (!confirmed) return;

  questions = [];
  saveQuestions();
  updateUI();
  addLog(t("messages.allCleared"), "info");
}

function updateUI() {
  updateStatistics();
  updateQuestionsList();
  updateControlButtons();
}

function updateStatValue(node, value) {
  const previous = parseInt(node.textContent) || 0;
  node.textContent = value;

  if (value > previous) {
    node.classList.remove("updated");
    // Trigger reflow to restart animation
    // eslint-disable-next-line no-unused-expressions
    node.offsetWidth;
    node.classList.add("updated");
    setTimeout(() => node.classList.remove("updated"), 400);
  }
}

function updateStatistics() {
  const total = questions.length;
  const done = questions.filter((q) => q.status === "completed" || q.status === "failed").length;
  const success = questions.filter((q) => q.status === "completed").length;
  const failed = questions.filter((q) => q.status === "failed").length;
  const processing = questions.filter((q) => q.status === "processing").length;

  updateStatValue(totalCount, total);
  updateStatValue(completedCount, done);
  updateStatValue(successCount, success);
  updateStatValue(failedCount, failed);

  const percent = total > 0 ? (done / total) * 100 : 0;
  progressFill.style.width = `${percent}%`;
  progressPercent.textContent = Math.round(percent) + "%";

  if (isRunning && processing > 0) {
    const processingIndex = questions.findIndex((q) => q.status === "processing");
    if (processingIndex !== -1) {
      const current = processingIndex + 1;
      progressText.textContent = t("progress.processing", { current, total });
    } else {
      progressText.textContent = t("progress.running");
    }
  } else {
    let key = "progress.ready";
    if (isPaused) {
      key = "progress.paused";
    } else if (total > 0 && done === total) {
      key = "progress.completed";
    }
    progressText.textContent = t(key);
  }

  const failedStat = document.querySelector(".stat-failed");
  if (failedStat) {
    if (failed === 0) {
      failedStat.classList.add("stat-muted");
    } else {
      failedStat.classList.remove("stat-muted");
    }
  }
}

function updateQuestionsList() {
  if (questions.length === 0) {
    questionsList.innerHTML = `
      <div class="empty-state">
        <p data-i18n="questions.noQuestions">${t("questions.noQuestions")}</p>
        <p data-i18n="questions.addToStart">${t("questions.addToStart")}</p>
      </div>
    `;
    return;
  }

  questionsList.innerHTML = "";
  [...questions].reverse().forEach((question, index) => {
    const item = createQuestionItem(question, index);
    questionsList.appendChild(item);
  });
}

function createQuestionItem(question) {
  const container = document.createElement("div");
  container.className = "question-item";
  container.dataset.id = question.id;

  const status = question.status;
  const statusLabel = t("questions.status." + status);

  let details = "";
  if (status === "completed") {
    let sourcesHtml = "";
    if (question.sources && question.sources.length > 0) {
      sourcesHtml = `
        <div class="detail-section">
          <h4>${t("questions.sources")} (${question.sources.length})</h4>
          <ul class="sources-list">
            ${question.sources
              .map(
                (source) => `
              <li class="source-item">
                <div class="source-title">${escapeHtml(source.title)}</div>
                <a href="${escapeHtml(source.url)}" target="_blank" class="source-url">${escapeHtml(source.url)}</a>
                ${
                  source.snippet
                    ? `<div class="source-snippet">${escapeHtml(source.snippet)}</div>`
                    : ""
                }
              </li>
            `,
              )
              .join("")}
          </ul>
        </div>
      `;
    }

    details = `
      <div class="question-details">
        <div class="detail-section">
          <h4>${t("questions.question")}</h4>
          <div class="answer-text">${escapeHtml(question.question)}</div>
        </div>
        <div class="detail-section">
          <h4>${t("questions.answer")}</h4>
          <div class="answer-text">${escapeHtml(question.answer || t("questions.noAnswer"))}</div>
        </div>
        ${sourcesHtml}
      </div>
    `;
  } else if (status === "failed") {
    details = `
      <div class="question-details">
        <div class="detail-section">
          <h4>${t("questions.question")}</h4>
          <div class="answer-text">${escapeHtml(question.question)}</div>
        </div>
        <div class="detail-section">
          <h4>${t("questions.errorInfo")}</h4>
          <div class="error-text">${escapeHtml(question.error || t("questions.unknownError"))}</div>
        </div>
      </div>
    `;
  }

  const completedTime = question.completedAt
    ? new Date(question.completedAt).toLocaleString("zh-CN", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  container.innerHTML = `
    <div class="question-header">
      <span class="status-badge ${status}">${statusLabel}</span>
      <div class="question-text" title="${escapeHtml(question.question)}">
        ${escapeHtml(question.question)}
      </div>
      ${completedTime ? `<span class="question-time">${completedTime}</span>` : ""}
    </div>
    ${details}
  `;

  container.addEventListener("click", () => container.classList.toggle("expanded"));
  return container;
}

function updateControlButtons() {
  idleButtons.style.display = "none";
  runningButtons.style.display = "none";
  pausedButtons.style.display = "none";

  if (isRunning) {
    if (isPaused) {
      pausedButtons.style.display = "flex";
    } else {
      runningButtons.style.display = "flex";
    }
  } else {
    idleButtons.style.display = "flex";
  }

  const hasFailed = questions.some((item) => item.status === "failed");
  retryButtonContainer.style.display = hasFailed && !isRunning ? "flex" : "none";
}

function addLog(message, level = "info") {
  const entry = document.createElement("div");
  entry.className = `log-entry ${level}`;
  const time = new Date().toLocaleTimeString();
  entry.textContent = `[${time}] ${message}`;
  logContainer.appendChild(entry);
  logContainer.scrollTop = logContainer.scrollHeight;

  while (logContainer.children.length > 100) {
    logContainer.removeChild(logContainer.firstChild);
  }
}

function saveQuestions() {
  chrome.storage.local.set({ questions });
}

async function loadQuestions() {
  try {
    const stored = await chrome.storage.local.get(["questions"]);
    if (stored.questions) {
      questions = stored.questions;
      if (questions.some((q) => q.status === "processing")) {
        isRunning = true;
        isPaused = false;
        addLog("🔄 检测到正在处理的任务，已恢复运行状态", "info");
      }
      updateUI();
      addLog(t("messages.loadedQuestions").replace("{count}", questions.length), "info");
    }
  } catch (error) {
    addLog(`${t("messages.loadFailed")}: ${error.message}`, "error");
  }
}

function saveWebSearchSetting(value) {
  chrome.storage.local.set({ useWebSearch: value });
}

document.addEventListener("DOMContentLoaded", () => {
  applyTranslations();
  loadQuestions();
  setupEventListeners();
  updateUI();
  initializeApp();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "QUESTION_COMPLETE":
      handleQuestionComplete(message.result);
      sendResponse({ received: true });
      break;
    case "UPDATE_PROGRESS":
      sendResponse({ received: true });
      break;
    case "LOG_MESSAGE":
      addLog(message.message, message.level || "info");
      sendResponse({ received: true });
      break;
    default:
      sendResponse({ received: false });
  }
  return true;
});

let lastProcessedMessageTimestamp = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes.pendingMessage) return;

  const pending = changes.pendingMessage.newValue;
  if (!pending) return;
  if (pending.timestamp && pending.timestamp <= lastProcessedMessageTimestamp) return;

  if (pending.timestamp) {
    lastProcessedMessageTimestamp = pending.timestamp;
  }

  switch (pending.type) {
    case "QUESTION_COMPLETE":
      handleQuestionComplete(pending.result);
      chrome.storage.local.remove("pendingMessage");
      break;
    case "UPDATE_PROGRESS":
      chrome.storage.local.remove("pendingMessage");
      break;
    case "LOG_MESSAGE":
      addLog(pending.message, pending.level || "info");
      chrome.storage.local.remove("pendingMessage");
      break;
    default:
      break;
  }
});

window.handleBackgroundMessage = function (handler) {
  chrome.runtime.onMessage.addListener(handler);
};

function initializeApp() {
  chrome.storage.local.remove(["authToken", "authEmail"]);
  addLog(t("messages.ready"), "success");
}
