#!/usr/bin/env bash
set -euo pipefail

node dist/cli.js --version >/tmp/toolhutch-version.txt
node dist/cli.js scan fixtures/risky-openclaw-tools.json --format markdown >/tmp/toolhutch-risk.md
node dist/cli.js scan fixtures/risky-openclaw-tools.json --format json >/tmp/toolhutch-risk.json
node dist/cli.js policy fixtures/risky-openclaw-tools.json --policy examples/toolhutch.policy.json --json >/tmp/toolhutch-policy.json || code=$?
if [[ "${code:-0}" != "3" ]]; then
  echo "expected policy command to exit 3 on deny, got ${code:-0}" >&2
  exit 1
fi
node -e 'const fs=require("node:fs"); const report=JSON.parse(fs.readFileSync("/tmp/toolhutch-policy.json","utf8")); if(report.summary.denied !== 1) process.exit(1);'
grep -q "Shell (critical)" /tmp/toolhutch-risk.md
