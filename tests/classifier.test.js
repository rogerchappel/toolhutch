import assert from "node:assert/strict";
import test from "node:test";
import { parseManifest, classifyManifest } from "../dist/index.js";

test("classifies risky OpenClaw-style tools", async () => {
  const manifest = await parseManifest("fixtures/risky-openclaw-tools.json");
  const findings = classifyManifest(manifest);
  const capabilities = findings.map((finding) => finding.capability);
  assert.ok(capabilities.includes("shell"));
  assert.ok(capabilities.includes("filesystem-write"));
  assert.ok(capabilities.includes("messaging"));
  assert.ok(capabilities.includes("browser"));
  assert.equal(findings[0].risk, "critical");
});

test("keeps benign fixture free of high-risk findings", async () => {
  const manifest = await parseManifest("fixtures/benign-tools.json");
  const findings = classifyManifest(manifest);
  assert.deepEqual(findings.map((finding) => finding.capability), []);
});

test("classifies database and package manager tools", async () => {
  const manifest = await parseManifest("fixtures/database-package-tools.json");
  const findings = classifyManifest(manifest);
  assert.ok(findings.some((finding) => finding.capability === "database"));
  assert.ok(findings.some((finding) => finding.capability === "package-manager"));
});
