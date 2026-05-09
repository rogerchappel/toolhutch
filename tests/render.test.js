import assert from "node:assert/strict";
import test from "node:test";
import { renderReport, scan } from "../dist/index.js";

test("renders markdown report with evidence and mitigations", async () => {
  const report = await scan("fixtures/risky-openclaw-tools.json");
  const markdown = renderReport(report, "markdown");
  assert.match(markdown, /# toolhutch risk brief/);
  assert.match(markdown, /Shell \(critical\)/);
  assert.match(markdown, /Mitigations:/);
});

test("renders json report", async () => {
  const report = await scan("fixtures/benign-tools.json");
  const json = renderReport(report, "json");
  assert.equal(JSON.parse(json).tool, "toolhutch");
});
