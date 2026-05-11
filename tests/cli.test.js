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

test("cli rejects unknown options with usage exit", () => {
  const result = spawnSync(process.execPath, [...CLI, "scan", "fixtures/benign-tools.json", "--wat"], { encoding: "utf8" });
  assert.equal(result.status, 64);
  assert.match(result.stderr, /Unknown option/);
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
