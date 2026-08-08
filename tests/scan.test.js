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

test("scan gives equivalent findings for YAML and JSON tool lists", async () => {
  const [yaml, json] = await Promise.all([scan("fixtures/tool-list.yaml"), scan("fixtures/tool-list.json")]);
  const summarize = (report) => report.findings.map(({ capability, risk }) => ({ capability, risk }));

  assert.deepEqual(summarize(yaml), summarize(json));
  assert.ok(yaml.findings.some((finding) => finding.capability === "shell"));
  assert.ok(yaml.findings.some((finding) => finding.capability === "network"));
  assert.ok(yaml.findings.some((finding) => finding.capability === "filesystem-read"));
});

test("scan includes approval gates in JSON-ready reports", async () => {
  const report = await scan("fixtures/approval-gates.json");
  assert.ok(report.approvalPlan.some((step) => step.action === "block"));
  assert.ok(report.approvalPlan.some((step) => step.action === "approve"));
});

test("scan distinguishes environment prose from credential surfaces", async () => {
  const [benign, credentials] = await Promise.all([
    scan("fixtures/environment-tools.json"),
    scan("fixtures/credential-tools.json"),
  ]);

  assert.notEqual(benign.summary.highestRisk, "critical");
  assert.ok(!benign.findings.some((finding) => finding.capability === "secrets"));
  assert.ok(credentials.findings.some((finding) => finding.capability === "secrets"));
});

test("scan rejects malformed policy rule objects through the API", async () => {
  await assert.rejects(
    scan("fixtures/benign-tools.json", { policyPath: "fixtures/policy-invalid-null.json" }),
    (error) => error?.name === "ToolhutchError" && error?.code === "INVALID_POLICY" && /Invalid policy file/.test(error.message),
  );
});
