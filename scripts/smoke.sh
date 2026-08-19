#!/usr/bin/env bash
set -euo pipefail

smoke_dir="$(mktemp -d "${TMPDIR:-/tmp}/toolhutch-smoke.XXXXXX")"
trap 'rm -rf "$smoke_dir"' EXIT

node dist/cli.js --version >"$smoke_dir/version.txt"
node dist/cli.js scan fixtures/risky-openclaw-tools.json --format markdown >"$smoke_dir/risk.md"
node dist/cli.js scan fixtures/risky-openclaw-tools.json --format json >"$smoke_dir/risk.json"

# Execute the scan-and-policy example documented in SKILL.md and docs/PRD.md.
node dist/cli.js scan ./fixtures/risky-openclaw-tools.json --format markdown \
  --policy ./examples/toolhutch.policy.json >"$smoke_dir/documented-example.md"
grep -q "Policy: \*\*deny\*\*" "$smoke_dir/documented-example.md"

node dist/cli.js policy fixtures/risky-openclaw-tools.json --policy examples/toolhutch.policy.json --json >"$smoke_dir/policy.json" || code=$?
if [[ "${code:-0}" != "3" ]]; then
  echo "expected policy command to exit 3 on deny, got ${code:-0}" >&2
  exit 1
fi
node -e 'const fs=require("node:fs"); const report=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); if(report.summary.denied !== 1) process.exit(1);' "$smoke_dir/policy.json"
grep -q "Shell (critical)" "$smoke_dir/risk.md"
