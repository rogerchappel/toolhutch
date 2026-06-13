---
name: toolhutch
description: Audit local agent tool manifests and explain capability risk before enabling tools.
version: 0.1.0
targets: [codex, claude, openclaw, agents]
tags: [security, tools, mcp, permissions, review]
---

# toolhutch

Use this skill when an agent or maintainer needs a local evidence brief for MCP, OpenClaw, or JSON/YAML tool manifests before enabling tool access.

## Inputs

- A local file or directory containing JSON or YAML tool/server definitions.
- An optional local policy file with `allow`, `warn`, or `deny` rules.
- A requested output format: Markdown for review, JSON for automation.

## Tools

- `toolhutch scan <path>` emits a Markdown risk brief.
- `toolhutch scan <path> --format json` emits deterministic JSON.
- `toolhutch explain <path> --json` includes low-risk evidence and exits `2` for critical capabilities.
- `toolhutch policy <path> --policy <policy.json>` applies local rules and exits `3` on deny.

## Side Effects

All commands are read-only. The CLI does not make network calls, execute listed tools, read secret values intentionally, enforce runtime permissions, or upload reports.

## Approval Boundaries

Ask for explicit approval before enabling a scanned tool server, sharing a report that might contain sensitive path names, or using the result as a hard security approval. Treat the output as review support, not proof of safety.

## Validation

Run:

```sh
npm run release:check
```

For a fixture smoke:

```sh
toolhutch scan ./fixtures/risky-openclaw-tools.json
toolhutch policy ./fixtures/risky-openclaw-tools.json --policy ./examples/toolhutch.policy.json
```

## Example

```sh
toolhutch scan . --format markdown --policy ./toolhutch.policy.json
toolhutch explain ./mcp.json --json
```
