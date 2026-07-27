import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

const CLI = ["dist/cli.js"];

test("cli scan emits markdown", () => {
  const result = spawnSync(process.execPath, [...CLI, "scan", "fixtures/risky-openclaw-tools.json"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /toolhutch risk brief/);
});

test("cli policy exits 3 when a deny rule matches", () => {
  const result = spawnSync(process.execPath, [...CLI, "policy", "fixtures/risky-openclaw-tools.json", "--policy", "examples/toolhutch.policy.json", "--json"], { encoding: "utf8" });
  assert.equal(result.status, 3);
  assert.equal(JSON.parse(result.stdout).summary.denied, 1);
});

test("cli policy requires an explicit policy file", () => {
  const result = spawnSync(process.execPath, [...CLI, "policy", "fixtures/risky-openclaw-tools.json"], { encoding: "utf8" });
  assert.equal(result.status, 64);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /policy requires --policy <path>/);
});

test("cli rejects unknown options with usage exit", () => {
  const result = spawnSync(process.execPath, [...CLI, "scan", "fixtures/benign-tools.json", "--wat"], { encoding: "utf8" });
  assert.equal(result.status, 64);
  assert.match(result.stderr, /Unknown option/);
});

test("cli scan can fail on a configured risk threshold", () => {
  const result = spawnSync(process.execPath, [...CLI, "scan", "fixtures/risky-openclaw-tools.json", "--fail-on", "high"], { encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.match(result.stdout, /Highest risk:/);
});

test("cli rejects invalid risk thresholds with usage exit", () => {
  const result = spawnSync(process.execPath, [...CLI, "scan", "fixtures/benign-tools.json", "--fail-on", "severe"], { encoding: "utf8" });
  assert.equal(result.status, 64);
  assert.match(result.stderr, /--fail-on must be low, medium, high, or critical/);
});

test("cli rejects missing option operands with usage exit", () => {
  for (const [option, message] of [
    ["--format", /--format must be json or markdown/],
    ["--fail-on", /--fail-on must be low, medium, high, or critical/],
    ["--policy", /--policy requires a path/],
  ]) {
    const result = spawnSync(process.execPath, [...CLI, "scan", "fixtures/benign-tools.json", option], { encoding: "utf8" });
    assert.equal(result.status, 64, option);
    assert.match(result.stderr, message, option);
  }
});

test("cli rejects options unsupported by the selected command", () => {
  const cases = [
    ["explain", "--fail-on", "low"],
    ["policy", "--fail-on", "low"],
    ["explain", "--policy", "examples/toolhutch.policy.json"],
    ["policy", "--format", "markdown", "--policy", "examples/toolhutch.policy.json"],
  ];
  for (const [command, ...options] of cases) {
    const result = spawnSync(process.execPath, [...CLI, command, "fixtures/benign-tools.json", ...options], { encoding: "utf8" });
    assert.equal(result.status, 64, `${command} ${options.join(" ")}`);
    assert.match(result.stderr, /is not supported by the .* command/, command);
  }
});

test("cli explain preserves its critical-capability exit", () => {
  const result = spawnSync(process.execPath, [...CLI, "explain", "fixtures/risky-openclaw-tools.json", "--json"], { encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.equal(JSON.parse(result.stdout).summary.highestRisk, "critical");
});

test("cli shows command help without trying to scan --help as a path", () => {
  const result = spawnSync(process.execPath, [...CLI, "scan", "--help"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage:/);
  assert.equal(result.stderr, "");
});

test("cli rejects missing policy path instead of consuming another flag", () => {
  const result = spawnSync(process.execPath, [...CLI, "policy", "fixtures/risky-openclaw-tools.json", "--policy", "--json"], { encoding: "utf8" });
  assert.equal(result.status, 64);
  assert.match(result.stderr, /--policy requires a path/);
});
