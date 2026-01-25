(() => {
  "use strict";

  // Side panel controller: manages UI, queue state, and background messaging.

  // Force default UI language to English to keep the extension consistent for all users.
  const BROWSER_LANG = "en";

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
  "control.reuseConversation": "controlReuseConversation",
  "control.reuseConversationHint": "controlReuseConversationHint",
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
  "questions.importBtn": "questionsImportBtn",
  "questions.clearBtn": "questionsClearBtn",
  "settings.reuseChatLabel": "settingsReuseChatLabel",
  "settings.reuseChatHint": "settingsReuseChatHint",
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
  "messages.resultsImported": "msgResultsImported",
  "messages.importFailed": "msgImportFailed",
  "messages.invalidImport": "msgInvalidImport",
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

// Fallback strings for environments without i18n bundles.
const DEFAULT_MESSAGES = {
  title: "Batch Question Assistant",
  "input.title": "Question Input",
  "input.placeholder": "Enter one question per line, batch input supported...",
  "input.addBtn": "Add Questions",
  "input.clearBtn": "Clear Input",
  "control.title": "Execution Control",
  "control.startBtn": "Start",
  "control.pauseBtn": "Pause",
  "control.resumeBtn": "Resume",
  "control.stopBtn": "Stop",
  "control.retryBtn": "Retry Failed",
  "control.reuseConversation": "Reuse conversation",
  "control.reuseConversationHint":
    "Reuse the existing provider tab for each question (disable to open a fresh tab per question)",
  "stats.total": "Total",
  "stats.completed": "Completed",
  "stats.success": "Success",
  "stats.failed": "Failed",
  "progress.ready": "Ready",
  "progress.running": "Running",
  "progress.processing": "Processing {current}/{total}",
  "progress.paused": "Paused",
  "progress.completed": "Completed",
  "log.title": "Execution Log",
  "questions.title": "Question List",
  "questions.exportBtn": "Export Results (JSON)",
  "questions.importBtn": "Import Questions (JSON)",
  "questions.clearBtn": "Clear All",
  "settings.reuseChatLabel": "Reuse same chat for all questions",
  "settings.reuseChatHint":
    "Keep this on to run every queued question in one chat. Turn off to start a fresh chat per question.",
  "settings.providerLabel": "Target provider",
  "settings.providerHint": "Choose which AI site to run your batch. Default is Perplexity with web search.",
  "questions.question": "Question",
  "questions.answer": "Answer",
  "questions.sources": "Sources",
  "questions.noQuestions": "No questions yet",
  "questions.addToStart": "Add questions to begin",
  "questions.noAnswer": "No answer",
  "questions.errorInfo": "Error",
  "questions.unknownError": "Unknown error",
  "questions.status.pending": "Pending",
  "questions.status.processing": "Processing",
  "questions.status.completed": "Completed",
  "questions.status.failed": "Failed",
  "messages.pleaseEnterQuestion": "Please enter at least one question",
  "messages.questionsAdded": "questions added",
  "messages.noQuestions": "No questions to process",
  "messages.pleaseAddQuestions": "Please add questions first",
  "messages.executionPaused": "Execution paused",
  "messages.executionResumed": "Execution resumed",
  "messages.executionStopped": "Execution stopped",
  "messages.noFailedQuestions": "No failed questions",
  "messages.resetFailed": "{count} failed questions reset",
  "messages.resultsExported": "Results exported",
  "messages.resultsImported": "Imported {count} questions",
  "messages.importFailed": "Import failed",
  "messages.invalidImport": "Invalid import file format",
  "messages.pleaseStopFirst": "Please stop current run first",
  "messages.allCleared": "All questions cleared",
  "messages.stopReset": "Stopped; {count} in-progress questions reset to pending",
  "messages.confirmClearAll": "Are you sure you want to clear all questions?",
  "messages.completed": "Completed",
  "messages.failed": "Failed",
  "messages.waitingNext": "Waiting for next question...",
  "messages.allCompleted": "All questions completed",
  "messages.openingProvider": "Opening {provider} tab...",
  "messages.cannotOpenProvider": "Could not open {provider}",
  "messages.providerSaved": "Provider set to {provider}",
  "messages.error": "Error",
  "messages.startingBatch": "Starting batch",
  "messages.foundPending": "Found pending questions: {count}",
  "messages.waitingPage": "Waiting for {provider} page to load",
  "messages.startingFirst": "Starting first question",
  "messages.submittedWaiting": "Submitted, waiting for answer...",
  "messages.processingFailed": "Processing failed",
  "messages.loadedQuestions": "Loaded {count} questions",
  "messages.loadFailed": "Failed to load previous questions",
  "messages.detectedInProgress": "Detected in-progress tasks, resumed running state",
  "messages.ready": "Ready",
  };

// In-memory queue state (persisted to chrome.storage.local).
let questions = [];
let isRunning = false;
let isPaused = false;
let currentIndex = 0;
let reuseConversation = true;
let currentProviderId = (CONFIG && CONFIG.DEFAULT_PROVIDER) || "perplexity";

const questionsInput = document.getElementById("questionsInput");
const addQuestionsBtn = document.getElementById("addQuestionsBtn");
const clearInputBtn = document.getElementById("clearInputBtn");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const stopBtn = document.getElementById("stopBtn");
const stopBtn2 = document.getElementById("stopBtn2");
const retryFailedBtn = document.getElementById("retryFailedBtn");
const reuseConversationToggle = document.getElementById("reuseConversationToggle");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const importFileInput = document.getElementById("importFileInput");
const providerSelect = document.getElementById("providerSelect");
const providerHint = document.getElementById("providerHint");
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

// Wire up all UI event handlers.
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
  importBtn.addEventListener("click", handleImportClick);
  importFileInput.addEventListener("change", handleImportFile);
  clearAllBtn.addEventListener("click", handleClearAll);
  reuseConversationToggle.addEventListener("change", handleReuseToggle);
  if (providerSelect) {
    providerSelect.addEventListener("change", handleProviderChange);
  }
}

// Translation helper with fallback strings + token replacement.
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
    message = DEFAULT_MESSAGES[key] || key;
  }

  if (params && typeof params === "object" && !Array.isArray(params)) {
    message = message.replace(/\{(\w+)\}/g, (match, name) => {
      return params[name] !== undefined ? params[name] : match;
    });
  }

  return message;
}

// Apply all localized labels to the UI.
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

function getAvailableProviders() {
  if (typeof getProviderList === "function") {
    return getProviderList();
  }
  if (typeof PROVIDERS !== "undefined") {
    return Object.values(PROVIDERS);
  }
  return [];
}

function getProviderConfigById(id) {
  if (typeof getProviderById === "function") {
    return getProviderById(id);
  }
  if (typeof PROVIDERS !== "undefined") {
    return PROVIDERS[id] || PROVIDERS.perplexity;
  }
  return { id: "perplexity", label: "Perplexity" };
}

function getProviderLabel(providerId) {
  const provider = getProviderConfigById(providerId);
  return provider?.label || "Provider";
}

// Populate provider selection dropdown.
function renderProviderOptions() {
  if (!providerSelect) return;
  const providers = getAvailableProviders();
  providerSelect.innerHTML = "";
  providers.forEach((provider) => {
    const option = document.createElement("option");
    option.value = provider.id;
    option.textContent = provider.label;
    providerSelect.appendChild(option);
  });
  providerSelect.value = currentProviderId;
  updateProviderHint();
}

// Show context-specific provider help text.
function updateProviderHint() {
  if (!providerHint) return;
  const provider = getProviderConfigById(currentProviderId);
  const hints = {
    perplexity: "Perplexity uses streaming answers with citations by default.",
    chatgpt: "ChatGPT may not always return sources. Use a new chat for isolated runs.",
    gemini: "Gemini can surface Google results; ensure you are signed in.",
    claude: "Claude may require workspace access; answers rarely include sources.",
  };
  providerHint.textContent = hints[provider.id] || t("settings.providerHint");
}

// Persist provider selection changes.
function handleProviderChange(event) {
  currentProviderId = event.target.value || (CONFIG && CONFIG.DEFAULT_PROVIDER) || "perplexity";
  saveProviderSetting(currentProviderId);
  updateProviderHint();
  addLog(t("messages.providerSaved", { provider: getProviderLabel(currentProviderId) }), "info");
}

// Generate a UUID v4-like value for queue entries.
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

// Handle adding questions from the textarea into the queue.
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
      providerId: currentProviderId,
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

// Clear the textarea without touching the queue.
// Clear the textarea without touching the queue.
function handleClearInput() {
  questionsInput.value = "";
}

// Persist the user's preference for reusing the same conversation tab.
// Persist the user's preference for reusing the same conversation tab.
function handleReuseToggle() {
  reuseConversation = !!reuseConversationToggle.checked;
  saveReuseConversationSetting(reuseConversation);
}

// Start processing pending questions, honoring the reuseConversation flag.
// Start processing pending questions, honoring the reuseConversation flag.
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
  const providerLabel = getProviderLabel(currentProviderId);
  addLog(t("messages.openingProvider", { provider: providerLabel }), "info");

  try {
    const result = await chrome.runtime.sendMessage({
      type: "OPEN_PROVIDER",
      providerId: currentProviderId,
    });
    if (!result.success) {
      addLog(`${t("messages.cannotOpenProvider", { provider: providerLabel })}: ${result.error}`, "error");
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
  addLog(t("messages.waitingPage", { provider: providerLabel }), "info");

  await sleep(3000);

  addLog(t("messages.startingFirst"), "info");
  processNextQuestion();
}

// Pause the current run; resumes from the same question later.
// Pause the current run; resumes from the same question later.
function handlePause() {
  isPaused = true;
  updateControlButtons();
  addLog(t("messages.executionPaused"), "warning");
}

// Resume processing after a pause.
// Resume processing after a pause.
function handleResume() {
  isPaused = false;
  updateControlButtons();
  addLog(t("messages.executionResumed"), "info");
  processNextQuestion();
}

// Stop the current run and reset in-flight questions back to pending.
// Stop the current run and reset in-flight questions back to pending.
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
    addLog(t("messages.stopReset", { count: resetCount }), "warning");
  } else {
    addLog(t("messages.executionStopped"), "warning");
  }
}

// Move all failed questions back to pending so they can be retried.
// Move all failed questions back to pending so they can be retried.
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

// Pull the next pending question and send it to the background script.
// Pull the next pending question and send it to the background script.
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
  next.providerId = currentProviderId;
  saveQuestions();
  updateUI();

  const preview = next.question.substring(0, 50);
  addLog(`[${currentIndex + 1}/${questions.length}]: ${preview}...`, "info");

  try {
    const response = await chrome.runtime.sendMessage({
      type: "PROCESS_QUESTION",
      question: next.question,
      questionId: next.id,
      reuseConversation,
      providerId: currentProviderId,
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

// Apply the result from the content script and advance the queue.
// Apply the result from the content script and advance the queue.
function handleQuestionComplete(result) {
  const question = questions.find((item) => item.id === result.questionId);
  if (!question || question.status === "completed" || question.status === "failed") {
    return;
  }

  question.providerId = result.providerId || question.providerId || currentProviderId;
  const providerLabel = getProviderLabel(question.providerId);

  if (result.success) {
    question.status = "completed";
    question.answer = result.answer;
    question.sources = result.sources || [];
    question.completedAt = Date.now();
    addLog(
      `${t("messages.completed")} (${providerLabel}): ${question.question.substring(0, 50)}...`,
      "success",
    );
  } else {
    question.status = "failed";
    question.error = result.error;
    question.completedAt = Date.now();
    addLog(
      `${t("messages.failed")} (${providerLabel}): ${question.question.substring(0, 50)}... - ${result.error}`,
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

// Export all questions with metadata to JSON (including normalized sources).
// Export all questions with metadata to JSON (including normalized sources).
function handleExport() {
  if (questions.length === 0) {
    addLog(t("messages.noResults"), "warning");
    return;
  }

  const total = questions.length;
  const completed = questions.filter((q) => q.status === "completed").length;
  const failed = questions.filter((q) => q.status === "failed").length;
  const pending = questions.filter((q) => q.status === "pending").length;

  const payload = {
    exportTime: new Date().toISOString(),
    totalQuestions: total,
    completedQuestions: completed,
    failedQuestions: failed,
    pendingQuestions: pending,
    summary: {
      total,
      completed,
      failed,
      pending,
      successRate: total > 0 ? completed / total : 0,
    },
    questions: questions.map((q) => ({
      id: q.id,
      question: q.question,
      status: q.status,
      answer: q.answer || "",
      sources: Array.isArray(q.sources) ? q.sources.map(formatSourceForExport) : [],
      timestamp: q.timestamp,
      completedAt: q.completedAt,
      error: q.error,
      providerId: q.providerId || currentProviderId,
    })),
  };

  const completedWithoutSources = payload.questions.filter(
    (q) => q.status === "completed" && q.sources.some((src) => !src.url || !src.domain),
  );
  if (completedWithoutSources.length > 0) {
    addLog(
      "Cannot export: some completed questions are missing source URLs or domains. Please check results.",
      "warning",
    );
    return;
  }

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

function formatSourceForExport(source) {
  const url = (source && source.url) || "";
  let domain = "";
  try {
    domain = url ? new URL(url).hostname : "";
  } catch (error) {
    domain = "";
  }

  return {
    title: (source && source.title) || "",
    url,
    domain,
    snippet: (source && source.snippet) || "",
  };
}

// Trigger file selection for JSON import.
function handleImportClick() {
  if (isRunning) {
    addLog(t("messages.pleaseStopFirst"), "warning");
    return;
  }
  importFileInput.value = "";
  importFileInput.click();
}

// Normalize various import payload shapes (arrays, messages, sequences) into questions.
function parseImportedQuestions(data) {
  if (!data) return [];

  const allowedStatuses = new Set(["pending", "completed", "failed"]);
  const collected = [];

  const normalizeItem = (item, meta = {}) => {
    if (!item) return null;

    if (typeof item === "string") {
      const question = item.trim();
      return question
        ? {
            id: generateUUID(),
            question,
            status: "pending",
            answer: "",
            sources: [],
            timestamp: Date.now(),
            error: null,
            providerId: currentProviderId,
            ...meta,
          }
        : null;
    }

    if (typeof item === "object" && typeof item.question === "string") {
      const status = allowedStatuses.has(item.status) ? item.status : "pending";
      const question = item.question.trim();
      if (!question) return null;
      return {
        id: item.id || generateUUID(),
        question,
        status,
        answer: item.answer || "",
        sources: Array.isArray(item.sources) ? item.sources : [],
        timestamp: item.timestamp || Date.now(),
        completedAt: item.completedAt || null,
        error: item.error || null,
        providerId: item.providerId || currentProviderId,
        ...meta,
      };
    }

    if (typeof item === "object" && typeof item.text === "string") {
      return normalizeItem(
        { question: item.text, status: item.status, answer: item.answer, sources: item.sources },
        meta,
      );
    }

    return null;
  };

  const pushFromList = (list, metaFactory) => {
    if (!Array.isArray(list)) return;
    list.forEach((entry, idx) => {
      const normalized = normalizeItem(entry, metaFactory ? metaFactory(idx) : undefined);
      if (normalized) collected.push(normalized);
    });
  };

  if (Array.isArray(data)) {
    pushFromList(data);
  } else if (data && typeof data === "object") {
    pushFromList(data.questions || data.messages);

    if (data.sequences && typeof data.sequences === "object") {
      Object.entries(data.sequences).forEach(([sequenceId, sequenceItems]) => {
        pushFromList(sequenceItems, (idx) => ({ sequenceId, sequenceIndex: idx }));
      });
    }
  }

  return collected.filter(Boolean).filter((item) => item.question);
}

// Read a selected JSON file and merge imported questions into the queue.
function handleImportFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result);
      const imported = parseImportedQuestions(json);

      if (!imported.length) {
        addLog(t("messages.invalidImport"), "error");
        return;
      }

      questions = [...questions, ...imported];
      saveQuestions();
      updateUI();
      addLog(t("messages.resultsImported", { count: imported.length }), "success");
    } catch (error) {
      addLog(`${t("messages.importFailed")}: ${error.message}`, "error");
    } finally {
      importFileInput.value = "";
    }
  };

  reader.onerror = () => {
    addLog(t("messages.importFailed"), "error");
    importFileInput.value = "";
  };

  reader.readAsText(file);
}

function handleClearAll() {
  if (isRunning) {
    addLog(t("messages.pleaseStopFirst"), "warning");
    return;
  }

  const confirmed = confirm(t("messages.confirmClearAll"));
  if (!confirmed) return;

  questions = [];
  saveQuestions();
  updateUI();
  addLog(t("messages.allCleared"), "info");
}

// Sync UI views with the current queue state.
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

// Update stats widgets + progress bar.
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

// Render the list of questions and their statuses.
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
  const providerLabel = getProviderLabel(question.providerId || currentProviderId);

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
    ? new Date(question.completedAt).toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  container.innerHTML = `
    <div class="question-header">
      <span class="status-badge ${status}">${statusLabel}</span>
      <span class="provider-pill">${escapeHtml(providerLabel)}</span>
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

// Append a log entry to the scrollable panel.
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

// Persist queue state to storage.
function saveQuestions() {
  chrome.storage.local.set({ questions });
}

function saveReuseConversationSetting(value) {
  chrome.storage.local.set({ reuseConversation: value });
}

function saveProviderSetting(value) {
  chrome.storage.local.set({ providerId: value });
}

// Load user settings from storage and apply to UI.
async function loadSettings() {
  try {
    const stored = await chrome.storage.local.get(["reuseConversation", "providerId"]);
    if (stored.reuseConversation === false) {
      reuseConversation = false;
    } else {
      reuseConversation = true;
    }
    if (stored.providerId) {
      currentProviderId = stored.providerId;
    } else {
      currentProviderId = (CONFIG && CONFIG.DEFAULT_PROVIDER) || "perplexity";
    }
  } catch (error) {
    reuseConversation = true;
    currentProviderId = (CONFIG && CONFIG.DEFAULT_PROVIDER) || "perplexity";
  }

  if (reuseConversationToggle) {
    reuseConversationToggle.checked = reuseConversation;
  }

  renderProviderOptions();
  if (providerSelect) {
    providerSelect.value = currentProviderId;
  }
}

// Load queued questions from storage and restore running state.
async function loadQuestions() {
  try {
    const stored = await chrome.storage.local.get(["questions", "reuseConversation", "providerId"]);
    if (stored.questions) {
      questions = stored.questions;
      if (questions.some((q) => q.status === "processing")) {
        isRunning = true;
        isPaused = false;
        addLog(t("messages.detectedInProgress"), "info");
      }
      updateUI();
      addLog(t("messages.loadedQuestions").replace("{count}", questions.length), "info");
    }

    if (stored.reuseConversation !== undefined) {
      reuseConversationToggle.checked = Boolean(stored.reuseConversation);
    } else {
      reuseConversationToggle.checked = true;
      saveReuseConversationSetting(true);
    }

    if (stored.providerId) {
      currentProviderId = stored.providerId;
      if (providerSelect) {
        providerSelect.value = currentProviderId;
      }
      updateProviderHint();
    }
  } catch (error) {
    addLog(`${t("messages.loadFailed")}: ${error.message}`, "error");
  }
}

// Placeholder for future web-search setting.
function saveWebSearchSetting(value) {
  chrome.storage.local.set({ useWebSearch: value });
}

document.addEventListener("DOMContentLoaded", async () => {
  applyTranslations();
  await loadSettings();
  await loadQuestions();
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
})();
