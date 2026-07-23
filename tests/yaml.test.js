import assert from "node:assert/strict";
import test from "node:test";
import { parseManifest } from "../dist/index.js";

test("YAML sequences of mappings match equivalent JSON", async () => {
  const yaml = await parseManifest("fixtures/tool-list.yaml");
  const json = await parseManifest("fixtures/tool-list.json");

  assert.deepEqual(yaml.document, json.document);
});

test("malformed YAML indentation reports a stable location and code", async () => {
  await assert.rejects(
    parseManifest("fixtures/malformed-indentation.yaml"),
    /Could not parse fixtures\/malformed-indentation\.yaml: Invalid YAML at line 3, column 3 \(MISSING_CHAR\)/,
  );
});
