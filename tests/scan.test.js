import assert from "node:assert/strict";
import test from "node:test";
import { scan } from "../dist/index.js";

test("scan returns deterministic JSON-ready report", async () => {
  const report = await scan("fixtures/risky-openclaw-tools.json");
  assert.equal(report.tool, "toolhutch");
  assert.equal(report.scannedAt, "1970-01-01T00:00:00.000Z");
  assert.equal(report.summary.highestRisk, "critical");
  assert.ok(report.summary.findings >= 4);
});

test("scan applies deny and warn policy rules", async () => {
  const report = await scan("fixtures/risky-openclaw-tools.json", { policyPath: "examples/toolhutch.policy.json" });
  assert.equal(report.summary.denied, 1);
  assert.ok(report.summary.warned >= 1);
});

test("scan parses yaml MCP-style manifests", async () => {
  const report = await scan("fixtures/mcp-mixed.yaml");
  assert.ok(report.findings.some((finding) => finding.capability === "filesystem-read"));
  assert.ok(report.findings.some((finding) => finding.capability === "network"));
  assert.ok(report.findings.some((finding) => finding.capability === "secrets"));
});

test("scan includes approval gates in JSON-ready reports", async () => {
  const report = await scan("fixtures/approval-gates.json");
  assert.ok(report.approvalPlan.some((step) => step.action === "block"));
  assert.ok(report.approvalPlan.some((step) => step.action === "approve"));
});
