const assert = require("assert");

const {
  extractAnswerFromChunks,
  normalizeSources,
  resolveProviderFromUrl,
  collectSourcesFromLinks,
  extractTextFromNode,
  getProviderConfig,
} = require("./content.js");

function testExtractAnswerFromChunksCapturesTextAndSources() {
  const chunks = [
    {
      delta: { content: "Answer part " },
      sources: [{ title: "Example Title", url: "https://example.com/article" }],
    },
    {
      message: "continues",
      references: [{ name: "Second Source", link: "https://news.example.org/path" }],
    },
    {
      content: [" with", " snippet"],
      citations: [{ url: "https://third.net/info", snippet: "Third snippet" }],
    },
  ];

  const result = extractAnswerFromChunks(chunks);
  assert.strictEqual(result.text, "Answer part continues with snippet");
  assert.strictEqual(result.sources.length, 3);
  assert.deepStrictEqual(
    result.sources.map((src) => src.title),
    ["Example Title", "Second Source", "https://third.net/info"],
  );
  assert.deepStrictEqual(
    result.sources.map((src) => src.url),
    ["https://example.com/article", "https://news.example.org/path", "https://third.net/info"],
  );
  assert.deepStrictEqual(
    result.sources.map((src) => src.domain),
    ["example.com", "news.example.org", "third.net"],
  );
}

function testNormalizeSourcesAddsDomainAndHandlesStrings() {
  const sources = normalizeSources({
    sources: [
      { title: "Sample", url: "https://samples.test/path" },
      { link: "https://another.example.com/page", snippet: "snippet" },
      "Title Only",
    ],
  });

  assert.strictEqual(sources.length, 3);
  assert.strictEqual(sources[0].domain, "samples.test");
  assert.strictEqual(sources[1].domain, "another.example.com");
  assert.strictEqual(sources[2].domain, "");
  assert.strictEqual(sources[1].title, "https://another.example.com/page");
  assert.strictEqual(sources[2].title, "Title Only");
}

function testResolveProviderFromUrlMatchesSupportedHosts() {
  const perplexity = resolveProviderFromUrl("https://www.perplexity.ai/search");
  const chatgpt = resolveProviderFromUrl("https://chat.openai.com/g");
  const gemini = resolveProviderFromUrl("https://gemini.google.com/app");
  const claude = resolveProviderFromUrl("https://claude.ai/chat/123");
  const fallback = resolveProviderFromUrl("https://unknown.example.com");

  assert.strictEqual(perplexity.id, "perplexity");
  assert.strictEqual(chatgpt.id, "chatgpt");
  assert.strictEqual(gemini.id, "gemini");
  assert.strictEqual(claude.id, "claude");
  assert.strictEqual(fallback.id, "perplexity");
}

function testCollectSourcesFromLinksExtractsDomains() {
  const links = [
    { href: "https://chat.openai.com/share/123", textContent: "ChatGPT ref" },
    { href: "https://gemini.google.com/p", textContent: "Gemini ref" },
    { href: "https://claude.ai/notes/abc", textContent: "" },
  ];
  const sources = collectSourcesFromLinks(links);

  assert.strictEqual(sources.length, 3);
  assert.strictEqual(sources[0].domain, "chat.openai.com");
  assert.strictEqual(sources[1].domain, "gemini.google.com");
  assert.strictEqual(sources[2].title, "https://claude.ai/notes/abc");
}

function testExtractTextFromNodeSupportsPlainObjects() {
  const node = { textContent: "  hello world " };
  const text = extractTextFromNode(node);
  assert.strictEqual(text, "hello world");
}

function testProviderConfigsExposeSelectors() {
  const chatgpt = getProviderConfig("chatgpt");
  const gemini = getProviderConfig("gemini");
  const claude = getProviderConfig("claude");

  assert.ok(Array.isArray(chatgpt.selectors.input) && chatgpt.selectors.input.length > 0);
  assert.ok(Array.isArray(gemini.selectors.answer) && gemini.selectors.answer.length > 0);
  assert.ok(Array.isArray(claude.selectors.submit) && claude.selectors.submit.length > 0);
}

function run() {
  testExtractAnswerFromChunksCapturesTextAndSources();
  testNormalizeSourcesAddsDomainAndHandlesStrings();
  testResolveProviderFromUrlMatchesSupportedHosts();
  testCollectSourcesFromLinksExtractsDomains();
  testExtractTextFromNodeSupportsPlainObjects();
  testProviderConfigsExposeSelectors();
  console.log("All tests passed.");
}

run();
