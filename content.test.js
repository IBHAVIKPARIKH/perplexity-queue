const assert = require("assert");

const { extractAnswerFromChunks, normalizeSources } = require("./content.js");

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

function run() {
  testExtractAnswerFromChunksCapturesTextAndSources();
  testNormalizeSourcesAddsDomainAndHandlesStrings();
  console.log("All tests passed.");
}

run();
